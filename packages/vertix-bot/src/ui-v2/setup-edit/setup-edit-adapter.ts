import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_GENERIC_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminAdapterExuBase } from "@vertix.gg/bot/src/ui-v2/_general/admin/admin-adapter-exu-base";
import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";
import { SetupEditComponent } from "@vertix.gg/bot/src/ui-v2/setup-edit/setup-edit-component";
import { SetupMasterEditButton } from "@vertix.gg/bot/src/ui-v2/setup/setup-master-edit-button";

import type { DynamicChannelClaimService } from "src/services/dynamic-channel-claim-service";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultChannelSelectMenuChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIAdapterService } from "@vertix.gg/gui/src/ui-adapter-service";
import type { MessageComponentInteraction, VoiceChannel } from "discord.js";

type Interactions =
    UIDefaultButtonChannelTextInteraction |
    UIDefaultStringSelectMenuChannelTextInteraction |
    UIDefaultChannelSelectMenuChannelTextInteraction |
    UIDefaultModalChannelTextInteraction;

export class SetupEditAdapter extends AdminAdapterExuBase<VoiceChannel, Interactions> {
    private appService: AppService;

    public static getName() {
        return "VertixBot/UI-V2/SetupEditAdapter";
    }

    public static getComponent() {
        return SetupEditComponent;
    }

    protected static getExcludedElements() {
        return [
            SetupMasterEditButton,
        ];
    }

    protected static getExecutionSteps() {
        return {
            default: {},

            "VertixBot/UI-V2/SetupEditMaster": {
                elementsGroup: "VertixBot/UI-V2/SetupEditElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditEmbedGroup",
            },

            "VertixBot/UI-V2/SetupEditButtons": {
                elementsGroup: "VertixBot/UI-V2/SetupEditButtonsElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditButtonsEmbedGroup",
            },
            "VertixBot/UI-V2/SetupEditButtonsEffect": {
                elementsGroup: "VertixBot/UI-V2/SetupEditButtonsEffectElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditButtonsEffectEmbedGroup",
            },

            "VertixBot/UI-V2/SetupEditVerifiedRoles": {
                elementsGroup: "VertixBot/UI-V2/SetupEditVerifiedRolesElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditVerifiedRolesEmbedGroup",
            }
        };
    }

    public constructor( uiManager: UIAdapterService ) {
        super( uiManager );

        this.appService = ServiceLocator.$.get( "VertixBot/Services/App" );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async getStartArgs( channel: VoiceChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: Interactions, argsFromManager?: UIArgs ) {
        let args: UIArgs = {};

        if ( argsFromManager?.dynamicChannelButtonsTemplate ) {
            args.dynamicChannelButtonsTemplate =
                DynamicChannelElementsGroup.sortIds( argsFromManager.dynamicChannelButtonsTemplate );
        }

        const availableArgs = this.getArgsManager().getArgs( this, interaction ),
            masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;

        if ( masterChannelDB ) {
            // TODO: Does it even work?
            args.index = masterChannelDB.masterChannelIndex;
            args.ChannelDBId = masterChannelDB.id;
            args.masterChannelId = masterChannelDB.channelId;

            const masterChannelKeys = MasterChannelDataManager.$.getKeys();

            const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( args.ChannelDBId );

            const selectedKeys = [
                masterChannelKeys.dynamicChannelNameTemplate,
                masterChannelKeys.dynamicChannelButtonsTemplate,
                masterChannelKeys.dynamicChannelMentionable,
                masterChannelKeys.dynamicChannelVerifiedRoles,
            ];

            selectedKeys.forEach( ( key ) => {
                args[ key ] = masterChannelSettings.object[ key ];
            } );
        } else {
            args.masterChannels = await ChannelModel.$.getMasters( interaction.guild?.id || "", true );
        }

        return args;
    }

    protected onEntityMap() {
        // Comes from 'setup' adapter, selects the master channel to edit
        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V2/SetupMasterEditButton",
            this.onSetupMasterEditButtonClicked
        );

        // Select edit option.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/SetupEditSelectEditOptionMenu",
            this.onSelectEditOptionSelected
        );

        // Channel name template.
        this.bindModal<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-V2/ChannelNameTemplateModal",
            this.onTemplateEditModalSubmitted
        );

        // Buttons template.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu",
            this.onButtonsSelected
        );

        // Effect buttons.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/SetupEditButtonsEffectImmediatelyButton",
            this.onButtonsEffectImmediatelyButtonsClicked
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/SetupEditButtonsEffectNewlyButton",
            this.onButtonsEffectNewlyButtonClicked
        );

        // Configuration toggle.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/ConfigExtrasSelectMenu",
            this.onConfigExtrasSelected
        );

        // Log channel.
        this.bindSelectMenu<UIDefaultChannelSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/LogChannelSelectMenu",
            this.onLogChannelSelected
        );

        // Verified roles buttons menu.
        this.bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
            "VertixBot/UI-V2/VerifiedRolesMenu",
            this.onVerifiedRolesSelected
        );

        // Verified roles everyone.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/VerifiedRolesEveryoneSelectMenu",
            this.onVerifiedRolesEveryoneSelected
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V2/DoneButton",
            this.onDoneButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V2/WizardBackButton",
            this.onBackButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V2/WizardFinishButton",
            this.onFinishButtonClicked
        );
    }

    protected shouldRequireArgs() {
        return true;
    }

    protected async regenerate( interaction: MessageComponentInteraction<"cached"> ): Promise<void> {
        this.uiAdapterService.get( "VertixBot/UI-V2/SetupAdapter" )?.editReply( interaction );
    }

    private async onSetupMasterEditButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction );

        args.index = args.masterChannelIndex;
        args.ChannelDBId = args.masterChannelDB.id;
        args.masterChannelId = args.masterChannelDB.channelId;

        const masterChannelKeys = MasterChannelDataManager.$.getKeys();
        const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( args.ChannelDBId, {
            [ masterChannelKeys.dynamicChannelLogsChannelId ]: [ interaction.guild.roles.everyone.id ]
        } );

        Object.entries( masterChannelSettings.object ).forEach( ( [ key, value ] ) => {
            args[ key ] = value;
        } );

        if ( args[ masterChannelKeys.dynamicChannelVerifiedRoles ].includes( interaction.guild.roles.everyone.id ) ) {
            args.dynamicChannelIncludeEveryoneRole = true;
        }

        // For verified roles.
        args._wizardIsFinishButtonAvailable = true;

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }

    private async onSelectEditOptionSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        switch ( interaction.values[ 0 ] ) {
            // TODO: Use constants.

            default: // Being called after the modal is canceled and the same option requested again.
            case "edit-dynamic-channel-name":
                await this.showModal( "VertixBot/UI-V2/ChannelNameTemplateModal", interaction );
                break;

            case "edit-dynamic-channel-buttons":
                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditButtons" );
                break;

            case "edit-dynamic-channel-verified-roles":
                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVerifiedRoles" );
                break;
        }
    }

    private async onTemplateEditModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ),
            channelNameInputId = uiService
                .generateCustomIdHash( "VertixBot/UI-V2/SetupEditAdapter:VertixBot/UI-V2/ChannelNameTemplateInput" );

        const value = interaction.fields.getTextInputValue( channelNameInputId ),
            args = this.getArgsManager().getArgs( this, interaction );

        const { masterChannelData } = ConfigManager.$.
            get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", "0.0.2" as const ).data;

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelNameTemplate: value || masterChannelData.dynamicChannelNameTemplate,
        } );

        await MasterChannelDataManager.$.setChannelNameTemplate( args?.ChannelDBId, value );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }

    private async onButtonsSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.sortIds( interaction.values.map( ( i ) => parseInt( i ) ) )
        } );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditButtonsEffect" );
    }

    private async onButtonsEffectImmediatelyButtonsClicked( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            buttons = DynamicChannelElementsGroup.sortIds( args.dynamicChannelButtonsTemplate );

        await MasterChannelDataManager.$.setChannelButtonsTemplate( args.ChannelDBId, buttons );

        const claimChannelButtonId = DynamicChannelElementsGroup
            .getByName( "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton" )?.getId();

        if ( claimChannelButtonId && buttons.includes( claimChannelButtonId ) ) {
            // Get all channels that are using this master channel.
            setTimeout( async () => {
                const channels = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, args.masterChannelId );

                for ( const channelDB of channels ) {
                    const channel = this.appService.getClient().channels.cache.get( channelDB.channelId ) as VoiceChannel;

                    if ( ! channel ) {
                        console.warn( `Channel ${ channelDB.channelId } not found.` );
                    }

                    this.dynamicChannelService.editPrimaryMessageDebounce( channel );
                }

                // Ignore await.
                ServiceLocator.$.get<DynamicChannelClaimService>( "VertixBot/Services/DynamicChannelClaim" )
                    .handleAbandonedChannels( this.appService.getClient(), [], channels )
                    .catch( ( e ) => { throw e; } );
            } );
        }

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }

    private async onButtonsEffectNewlyButtonClicked( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            buttons = DynamicChannelElementsGroup.sortIds( args.dynamicChannelButtonsTemplate );

        await MasterChannelDataManager.$.setChannelButtonsTemplate( args.ChannelDBId, buttons );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }

    private async onDoneButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        switch ( this.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/SetupEditButtons":
                await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
                break;

            case "VertixBot/UI-V2/SetupEditMaster":
                this.deleteArgs( interaction );

                this.uiAdapterService.get( "VertixBot/UI-V2/SetupAdapter" )?.editReply( interaction );
                break;
        }

        this.deleteArgs( interaction );
    }

    private async onConfigExtrasSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args: UIArgs = this.getArgsManager().getArgs( this, interaction ),
            values = interaction.values;

        for ( const value of values ) {
            const parted = value.split( UI_GENERIC_SEPARATOR );

            switch ( parted[ 0 ] ) {
                case "dynamicChannelMentionable":
                    args.dynamicChannelMentionable = !! parseInt( parted[ 1 ] );

                    await MasterChannelDataManager.$.setChannelMentionable( args.ChannelDBId, args.dynamicChannelMentionable );
                    break;

                case "dynamicChannelAutoSave":
                    args.dynamicChannelAutoSave = !! parseInt( parted[ 1 ] );

                    await MasterChannelDataManager.$.setChannelAutoSave( args.ChannelDBId, args.dynamicChannelAutoSave );
                    break;

                case "dynamicChannelLogsChannel":
                    args.dynamicChannelLogsChannelId = null;

                    await MasterChannelDataManager.$.setChannelLogsChannel( args.ChannelDBId, args.dynamicChannelLogsChannelId );
                    break;
            }
        }

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }

    private async onLogChannelSelected( interaction: UIDefaultChannelSelectMenuChannelTextInteraction ) {
        const channelId = interaction.values.at( 0 ) || null,
            args: UIArgs = this.getArgsManager().getArgs( this, interaction );

        args.dynamicChannelLogsChannelId = channelId;

        await MasterChannelDataManager.$.setChannelLogsChannel( args.ChannelDBId, channelId );

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }

    private async onVerifiedRolesSelected( interaction: UIDefaultStringSelectRolesChannelTextInteraction ) {
        const args: UIArgs = this.getArgsManager().getArgs( this, interaction ),
            roles = interaction.values;

        if ( args.dynamicChannelIncludeEveryoneRole ) {
            roles.push( interaction.guildId );
        }

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelVerifiedRoles: roles.sort(),
            _wizardIsFinishButtonDisabled: ! roles.length,
        } );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVerifiedRoles" );
    }

    private async onVerifiedRolesEveryoneSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args: UIArgs = this.getArgsManager().getArgs( this, interaction ),
            values = interaction.values;

        values.forEach( ( value ) => {
            const parted = value.split( UI_GENERIC_SEPARATOR );

            switch ( parted[ 0 ] ) {
                case "dynamicChannelIncludeEveryoneRole":
                    const state = !! parseInt( parted[ 1 ] ),
                        isEveryoneExist = args.dynamicChannelVerifiedRoles.includes( interaction.guildId );

                    args.dynamicChannelIncludeEveryoneRole = state;

                    if ( state && ! isEveryoneExist ) {
                        args.dynamicChannelVerifiedRoles.push( interaction.guildId );
                    } else if ( ! state && isEveryoneExist ) {
                        args.dynamicChannelVerifiedRoles.splice( args.dynamicChannelVerifiedRoles.indexOf( interaction.guildId ), 1 );
                    }

                    args.dynamicChannelVerifiedRoles = args.dynamicChannelVerifiedRoles.sort();

                    break;
            }
        } );

        args._wizardIsFinishButtonDisabled = ! args.dynamicChannelVerifiedRoles?.length;

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVerifiedRoles" );
    }

    private async onBackButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction );

        const keys = MasterChannelDataManager.$.getKeys();

        const verifiedRoles = await MasterChannelDataManager.$
            .getChannelVerifiedRoles( args.ChannelDBId, interaction.guild.id );

        if ( verifiedRoles.length && verifiedRoles.includes( interaction.guild.roles.everyone.id ) ) {
            args.dynamicChannelIncludeEveryoneRole = true;
        }

        args[ keys.dynamicChannelVerifiedRoles ] = verifiedRoles;

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }

    private async onFinishButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args: UIArgs = this.getArgsManager().getArgs( this, interaction );

        await MasterChannelDataManager.$.setChannelVerifiedRoles(
            interaction.guildId,
            args.ChannelDBId,
            args.dynamicChannelVerifiedRoles
        );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
    }
}
