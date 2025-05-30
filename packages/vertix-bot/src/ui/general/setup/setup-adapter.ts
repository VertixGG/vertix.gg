import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { badwordsNormalizeArray, badwordsSplitOrDefault } from "@vertix.gg/base/src/utils/badwords-utils";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import UIHashService from "@vertix.gg/gui/src/ui-hash-service";

import { AdminAdapterBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-base";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui/general/language/language-select-menu";

import { SetupComponent } from "@vertix.gg/bot/src/ui/general/setup/setup-component";

import type { UIEntitySchemaBase, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { TVersionType } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import type {
    MasterChannelConfigInterface,
    MasterChannelConfigInterfaceV3
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type UIAdapterVersioningService from "@vertix.gg/gui/src/ui-adapter-versioning-service";

import type { BaseGuildTextChannel } from "discord.js";
import type MasterChannelService from "@vertix.gg/bot/src/services/master-channel-service";

type DefaultInteraction = UIDefaultButtonChannelTextInteraction | UIDefaultModalChannelTextInteraction;

export class SetupAdapter extends AdminAdapterBase<BaseGuildTextChannel, DefaultInteraction> {
    private masterChannelService: MasterChannelService;

    public static getName() {
        return "VertixBot/UI-General/SetupAdapter";
    }

    public static getComponent() {
        return SetupComponent;
    }

    protected static getExcludedElements() {
        return [ LanguageSelectMenu ];
    }

    public constructor( protected options: any ) {
        super( options );

        this.masterChannelService = ServiceLocator.$.get( "VertixBot/Services/MasterChannel" );
    }

    protected async getReplyArgs( interaction: DefaultInteraction, argsFromManager?: UIArgs ): Promise<ISetupArgs> {
        const args: any = {},
            badwords = badwordsNormalizeArray( await GuildDataManager.$.getBadwords( interaction.guild.id ) );

        args.masterChannels = await ChannelModel.$.getMasters( interaction.guild.id, "settings" );
        args.badwords = badwords;

        if ( argsFromManager?.maxMasterChannels ) {
            args.maxMasterChannels = argsFromManager.maxMasterChannels;
        }

        return args;
    }

    protected generateCustomIdForEntity( entity: UIEntitySchemaBase ) {
        switch ( entity.name ) {
            case "VertixBot/UI-General/SetupMasterCreateV3Button": {
                return new UICustomIdHashStrategy().generateId( this.getName() + UI_CUSTOM_ID_SEPARATOR + entity.name );
            }
        }

        return super.generateCustomIdForEntity( entity );
    }

    protected getCustomIdForEntity( hash: string ) {
        if ( hash.startsWith( UIHashService.HASH_SIGNATURE ) ) {
            return new UICustomIdHashStrategy().getId( hash );
        }

        return super.getCustomIdForEntity( hash );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async onBeforeBuild( args: UIArgs, from: string, interaction?: DefaultInteraction ) {
        if ( "run" === from ) {
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterCreateButton",
                ( interaction ) => this.onCreateMasterChannelClicked( interaction, VERSION_UI_V2 )
            );

            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterCreateV3Button",
                ( interaction ) => this.onCreateMasterChannelClicked( interaction, VERSION_UI_V3 )
            );

            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/SetupBadwordsEditButton",
                this.onEditBadwordsClicked
            );
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/LanguageChooseButton",
                this.onLanguageChooseClicked
            );

            this.bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/BadwordsModal",
                this.onBadwordsModalSubmitted
            );

            this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterEditSelectMenu",
                this.onSelectEditMasterChannel
            );
        }
    }

    private async onSelectEditMasterChannel( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const masterChannelValue = interaction.values.at( 0 );

        let masterChannelId, masterChannelIndex;

        if ( masterChannelValue ) {
            [ masterChannelId, masterChannelIndex ] = masterChannelValue.split( UI_CUSTOM_ID_SEPARATOR, 2 );
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannelId! );

        if ( !masterChannelDB ) {
            // TODO: Error...
            await this.editReply( interaction as any, {} );
            return;
        }

        const uiVersioningAdapterService = ServiceLocator.$.get<UIAdapterVersioningService>(
            "VertixGUI/UIVersioningAdapterService"
        ),
            setupEditAdapter = await uiVersioningAdapterService.get( "Vertix/SetupEditAdapter", masterChannelDB.id );

        await setupEditAdapter?.runInitial( interaction, {
            masterChannelIndex,
            masterChannelDB
        } );

        // Delete Args since left to another adapter.
        this.deleteArgs( interaction as any );
    }

    private async onCreateMasterChannelClicked(
        interaction: UIDefaultButtonChannelTextInteraction,
        version: TVersionType = VERSION_UI_V2
    ) {
        const guildId = interaction.guild.id,
            limit = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit = await this.masterChannelService.isReachedMasterLimit( guildId, limit );

        if ( hasReachedLimit ) {
            const component = this.getComponent();

            component.clearElements();
            component.switchEmbedsGroup( "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup" );

            await this.ephemeral( interaction, {
                maxMasterChannels: limit
            } );

            return;
        }

        const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3 | MasterChannelConfigInterface>(
            "Vertix/Config/MasterChannel",
            version
        ).data;

        const adapterName =
            version === VERSION_UI_V3 ? "Vertix/UI-V3/SetupNewWizardAdapter" : "Vertix/UI-V2/SetupNewWizardAdapter";

        this.uiService.get( adapterName )?.runInitial( interaction, {
            dynamicChannelButtonsTemplate: settings.dynamicChannelButtonsTemplate,

            dynamicChannelMentionable: settings.dynamicChannelMentionable,
            dynamicChannelAutoSave: settings.dynamicChannelAutoSave,

            dynamicChannelIncludeEveryoneRole: true,
            dynamicChannelVerifiedRoles: [ interaction.guild.roles.everyone.id ]
        } );

        // Delete Args since left to another adapter.
        this.deleteArgs( interaction );
    }

    private async onEditBadwordsClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        await this.showModal( "VertixBot/UI-General/BadwordsModal", interaction );
    }

    private async onBadwordsModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const badwordsInputId = this.customIdStrategy.generateId(
            "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/BadwordsInput"
        );

        const value = interaction.fields.getTextInputValue( badwordsInputId ),
            newBadwords = badwordsNormalizeArray( badwordsSplitOrDefault( value ) ).map( ( word ) => word.trim() );

        await GuildDataManager.$.setBadwords( interaction.guildId, newBadwords ).then( ( data ) => {
            if ( data ) {
                const guild = interaction.guild;
                SetupAdapter.dedicatedLogger.admin(
                    this.onBadwordsModalSubmitted,
                    `🔧 Bad Words filter has been modified - "${ data.oldBadwords }" -> "${ data.newBadwords }" (${ guild.name }) (${ guild.memberCount })`
                );
            }
        } );

        await this.editReply( interaction, {} );
    }

    private async onLanguageChooseClicked( interaction: DefaultInteraction ) {
        this.uiService.get( "VertixBot/UI-General/LanguageAdapter" )?.editReply( interaction, {} );
    }
}
