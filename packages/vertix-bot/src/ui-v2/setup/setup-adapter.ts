import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { badwordsNormalizeArray, badwordsSplitOrDefault, } from "@vertix.gg/base/src/utils/badwords-utils";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import {
    DEFAULT_DYNAMIC_CHANNEL_AUTOSAVE,
    DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE
} from "@vertix.gg/base/src/definitions/master-channel-defaults";

import { UI_GENERIC_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { AdminAdapterBase } from "@vertix.gg/bot/src/ui-v2/_general/admin/admin-adapter-base";

import { SetupComponent } from "@vertix.gg/bot/src/ui-v2/setup/setup-component";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui-v2/language/language-select-menu";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui-v2/setup/setup-definitions";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type UIAdapterService from "@vertix.gg/gui/src/ui-adapter-service";

import type { BaseGuildTextChannel } from "discord.js";
import type MasterChannelService from "@vertix.gg/bot/src/services/master-channel-service";

type DefaultInteraction =
    UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;

export class SetupAdapter extends AdminAdapterBase<BaseGuildTextChannel, DefaultInteraction> {
    private masterChannelService: MasterChannelService;

    public static getName() {
        return "VertixBot/UI-V2/SetupAdapter";
    }

    public static getComponent() {
        return SetupComponent;
    }

    protected static getExcludedElements() {
        return [
            LanguageSelectMenu,
        ];
    }

    public constructor( uiAdapterService: UIAdapterService ) {
        super( uiAdapterService );

        this.masterChannelService = ServiceLocator.$.get( "VertixBot/Services/MasterChannel" );
    }

    protected async getReplyArgs( interaction: DefaultInteraction, argsFromManager?: UIArgs ): Promise<ISetupArgs> {
        const args: any = {},
            badwords = badwordsNormalizeArray( await GuildDataManager.$.getBadwords( interaction.guild.id ) );

        args.masterChannels = await ChannelModel.$.getMasters( interaction.guild.id, true );
        args.badwords = badwords;

        if ( argsFromManager?.maxMasterChannels ) {
            args.maxMasterChannels = argsFromManager.maxMasterChannels;
        }

        return args;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async onBeforeBuild( args: UIArgs, from: string, interaction?: DefaultInteraction ) {
        if ( "run" === from ) {
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V2/SetupMasterEditButton",
                this.onEditMasterChannelClicked
            );
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V2/SetupMasterCreateButton",
                this.onCreateMasterChannelClicked
            );

            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V2/SetupBadwordsEditButton",
                this.onEditBadwordsClicked
            );
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V2/LanguageChooseButton",
                this.onLanguageChooseClicked
            );

            this.bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-V2/BadwordsModal",
                this.onBadwordsModalSubmitted
            );
        }
    }

    private async onEditMasterChannelClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        // TODO: There should be some helper or extension of interaction to get the customId parts.
        // EG: interaction.getCustomId( "masterChannelIndex" )
        const customIdParts =
                this.uiService.getCustomIdFromHash( interaction.customId ).split( UI_GENERIC_SEPARATOR ),
            masterChannelIndex = parseInt( customIdParts[ 2 ] ),
            masterChannels = await ChannelModel.$.getMasters( interaction.guild.id, false );

        if ( ! masterChannels.length || ! masterChannels[ masterChannelIndex ] ) {
            // TODO: Error...
            await this.editReply( interaction, {} );
            return;
        }

        const masterChannelDB = masterChannels[ masterChannelIndex ];

        await this.uiAdapterService.get( "VertixBot/UI-V2/SetupEditAdapter" )?.runInitial( interaction, {
            masterChannelIndex,
            masterChannelDB
        } );

        // Delete Args since left to another adapter.
        this.deleteArgs( interaction );
    }

    private async onCreateMasterChannelClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const guildId = interaction.guild.id,
            limit = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit = await this.masterChannelService.isReachedMasterLimit( guildId, limit );

        if ( hasReachedLimit ) {
            const component = this.getComponent();

            component.clearElements();
            component.switchEmbedsGroup( "VertixBot/UI-V2/SetupMaxMasterChannelsEmbedGroup" );

            await this.ephemeral( interaction, {
                maxMasterChannels: limit
            } );

            return;
        }

        this.uiAdapterService.get( "VertixBot/UI-V2/SetupNewWizardAdapter" )?.runInitial( interaction, {
            dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.getAll().map( i => i.getId() ),

            dynamicChannelMentionable: DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE,
            dynamicChannelAutoSave: DEFAULT_DYNAMIC_CHANNEL_AUTOSAVE,

            dynamicChannelIncludeEveryoneRole: true,
            dynamicChannelVerifiedRoles: [
                interaction.guild.roles.everyone.id,
            ],
        } );

        // Delete Args since left to another adapter.
        this.deleteArgs( interaction );
    }

    private async onEditBadwordsClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        await this.showModal( "VertixBot/UI-V2/BadwordsModal", interaction );
    }

    private async onBadwordsModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const value = interaction.fields.getTextInputValue( "VertixBot/UI-V2/SetupAdapter:VertixBot/UI-V2/BadwordsInput" ),
            newBadwords = badwordsNormalizeArray( badwordsSplitOrDefault( value ) )
                .map( ( word ) => word.trim() );

        await GuildDataManager.$.setBadwords( interaction.guildId, newBadwords ).then( ( data )  => {
            if ( data ) {
                const guild = interaction.guild;
                SetupAdapter.dedicatedLogger.admin( this.onBadwordsModalSubmitted,
                    `🔧 Bad Words filter has been modified - "${ data.oldBadwords }" -> "${ data.newBadwords }" (${ guild.name }) (${ guild.memberCount })`
                );
            }
        } );

        await this.editReply( interaction, {} );
    }

    private async onLanguageChooseClicked( interaction: DefaultInteraction ) {
        this.uiAdapterService.get( "VertixBot/UI-V2/LanguageAdapter" )?.editReply( interaction, {} );
    }
}
