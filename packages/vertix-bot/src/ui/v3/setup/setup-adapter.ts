import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { badwordsNormalizeArray, badwordsSplitOrDefault, } from "@vertix.gg/base/src/utils/badwords-utils";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminAdapterBase } from "@vertix.gg/bot/src/ui/v3/_general/admin/admin-adapter-base";

import { SetupComponent } from "@vertix.gg/bot/src/ui/v3/setup/setup-component";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui/v3/language/language-select-menu";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/v3/setup/setup-definitions";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { BaseGuildTextChannel } from "discord.js";
import type MasterChannelService from "@vertix.gg/bot/src/services/master-channel-service";

type DefaultInteraction =
    UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;

export class SetupAdapter extends AdminAdapterBase<BaseGuildTextChannel, DefaultInteraction> {
    private masterChannelService: MasterChannelService;

    public static getName() {
        return "Vertix/UI-V3/SetupAdapter";
    }

    public static getComponent() {
        return SetupComponent;
    }

    protected static getExcludedElements() {
        return [
            LanguageSelectMenu,
        ];
    }

    public constructor( protected options: any ) {
        super( options );

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
                "Vertix/UI-V3/SetupMasterEditButton",
                this.onEditMasterChannelClicked
            );
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "Vertix/UI-V3/SetupMasterCreateButton",
                this.onCreateMasterChannelClicked
            );

            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "Vertix/UI-V3/SetupBadwordsEditButton",
                this.onEditBadwordsClicked
            );
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "Vertix/UI-V3/LanguageChooseButton",
                this.onLanguageChooseClicked
            );

            this.bindModal<UIDefaultModalChannelTextInteraction>(
                "Vertix/UI-V3/BadwordsModal",
                this.onBadwordsModalSubmitted
            );
        }
    }

    private async onEditMasterChannelClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        // TODO: There should be some helper or extension of interaction to get the customId parts.
        // EG: interaction.getCustomId( "masterChannelIndex" )
        const customIdParts =
                this.customIdStrategy.getId( interaction.customId ).split( UI_CUSTOM_ID_SEPARATOR ),
            masterChannelIndex = parseInt( customIdParts[ 2 ] ),
            masterChannels = await ChannelModel.$.getMasters( interaction.guild.id, false );

        if ( ! masterChannels.length || ! masterChannels[ masterChannelIndex ] ) {
            // TODO: Error...
            await this.editReply( interaction, {} );
            return;
        }

        const masterChannelDB = masterChannels[ masterChannelIndex ];

        await this.uiService.get( "Vertix/UI-V3/SetupEditAdapter" )?.runInitial( interaction, {
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
            component.switchEmbedsGroup( "Vertix/UI-V3/SetupMaxMasterChannelsEmbedGroup" );

            await this.ephemeral( interaction, {
                maxMasterChannels: limit
            } );

            return;
        }

        const { masterChannelData } = ConfigManager.$
            .get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", "0.0.2" as const ).data;

        this.uiService.get( "Vertix/UI-V3/SetupNewWizardAdapter" )?.runInitial( interaction, {
            dynamicChannelButtonsTemplate: masterChannelData.dynamicChannelButtonsTemplate,

            dynamicChannelMentionable: masterChannelData.dynamicChannelMentionable,
            dynamicChannelAutoSave: masterChannelData.dynamicChannelAutoSave,

            dynamicChannelIncludeEveryoneRole: true,
            dynamicChannelVerifiedRoles: [
                interaction.guild.roles.everyone.id,
            ],
        } );

        // Delete Args since left to another adapter.
        this.deleteArgs( interaction );
    }

    private async onEditBadwordsClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        await this.showModal( "Vertix/UI-V3/BadwordsModal", interaction );
    }

    private async onBadwordsModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const badwordsInputId = this.customIdStrategy
                .generateId( "Vertix/UI-V3/SetupAdapter:Vertix/UI-V3/BadwordsInput" );

        const value = interaction.fields.getTextInputValue( badwordsInputId ),
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
        this.uiService.get( "Vertix/UI-V3/LanguageAdapter" )?.editReply( interaction, {} );
    }
}
