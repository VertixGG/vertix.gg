import { MessageComponentInteraction, VoiceChannel } from "discord.js";

import {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UI_GENERIC_SEPARATOR, UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { ChannelModel } from "@vertix/models";

import { AppManager } from "@vertix/managers/app-manager";
import { ChannelDataManager } from "@vertix/managers/channel-data-manager";
import { DynamicChannelClaimManager } from "@vertix/managers/dynamic-channel-claim-manager";
import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";
import { MasterChannelManager } from "@vertix/managers/master-channel-manager";

import {
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES
} from "@vertix/definitions/master-channel";

import { AdminAdapterExuBase } from "@vertix/ui-v2/_general/admin/admin-adapter-exu-base";
import { SetupEditComponent } from "@vertix/ui-v2/setup-edit/setup-edit-component";
import { SetupMasterEditButton } from "@vertix/ui-v2/setup/setup-master-edit-button";

type Interactions =
    UIDefaultButtonChannelTextInteraction |
    UIDefaultStringSelectMenuChannelTextInteraction |
    UIDefaultModalChannelTextInteraction;

export class SetupEditAdapter extends AdminAdapterExuBase<VoiceChannel, Interactions> {
    public static getName() {
        return "Vertix/UI-V2/SetupEditAdapter";
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

            "Vertix/UI-V2/SetupEditMaster": {
                elementsGroup: "Vertix/UI-V2/SetupEditElementsGroup",
                embedsGroup: "Vertix/UI-V2/SetupEditEmbedGroup",
            },

            "Vertix/UI-V2/SetupEditButtons": {
                elementsGroup: "Vertix/UI-V2/SetupEditButtonsElementsGroup",
                embedsGroup: "Vertix/UI-V2/SetupEditButtonsEmbedGroup",
            },
            "Vertix/UI-V2/SetupEditButtonsEffect": {
                elementsGroup: "Vertix/UI-V2/SetupEditButtonsEffectElementsGroup",
                embedsGroup: "Vertix/UI-V2/SetupEditButtonsEffectEmbedGroup",
            },

            "Vertix/UI-V2/SetupEditVerifiedRoles": {
                elementsGroup: "Vertix/UI-V2/SetupEditVerifiedRolesElementsGroup",
                embedsGroup: "Vertix/UI-V2/SetupEditVerifiedRolesEmbedGroup",
            }
        };
    }

    protected async getStartArgs( channel: VoiceChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: Interactions, argsFromManager?: UIArgs ) {
        let args: UIArgs = {};

        if ( argsFromManager?.dynamicChannelButtonsTemplate ) {
            args.dynamicChannelButtonsTemplate = argsFromManager.dynamicChannelButtonsTemplate.sort();
        }

        const availableArgs = this.getArgsManager().getArgs( this, interaction ),
            masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;

        if ( masterChannelDB ) {
            // TODO: Does it even work?
            args.index = masterChannelDB.masterChannelIndex;
            args.ChannelDBId = masterChannelDB.id;
            args.masterChannelId = masterChannelDB.channelId;

            const masterChannelData = await ChannelDataManager.$.getSettingsData( args.ChannelDBId, false );

            args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ] =
                masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ];
            args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ] =
                masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ];
            args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ] =
                masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ];
            args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ] =
                masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ];
        } else {
            args.masterChannels = await ChannelModel.$.getMasters( interaction.guild?.id || "", true );
        }

        return args;
    }

    protected onEntityMap() {
        // Comes from 'setup' adapter, selects the master channel to edit
        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "Vertix/UI-V2/SetupMasterEditButton",
            this.onSetupMasterEditButtonClicked
        );

        // Select edit option.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/SetupEditSelectEditOptionMenu",
            this.onSelectEditOptionSelected
        );

        // Channel name template.
        this.bindModal<UIDefaultModalChannelTextInteraction>(
            "Vertix/UI-V2/ChannelNameTemplateModal",
            this.onTemplateEditModalSubmitted
        );

        // Buttons template.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/ChannelButtonsTemplateSelectMenu",
            this.onButtonsSelected
        );

        // Effect buttons.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/SetupEditButtonsEffectImmediatelyButton",
            this.onButtonsEffectImmediatelyButtonsClicked
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/SetupEditButtonsEffectNewlyButton",
            this.onButtonsEffectNewlyButtonClicked
        );

        // Configuration toggler.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/ConfigExtrasSelectMenu",
            this.onConfigExtrasSelected
        );

        // Verified roles buttons menu.
        this.bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
            "Vertix/UI-V2/VerifiedRolesMenu",
            this.onVerifiedRolesSelected
        );

        // Verified roles everyone.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/VerifiedRolesEveryoneSelectMenu",
            this.onVerifiedRolesEveryoneSelected
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "Vertix/UI-V2/DoneButton",
            this.onDoneButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "Vertix/UI-V2/WizardBackButton",
            this.onBackButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "Vertix/UI-V2/WizardFinishButton",
            this.onFinishButtonClicked
        );
    }

    protected shouldRequireArgs() {
        return true;
    }

    protected async regenerate( interaction: MessageComponentInteraction<"cached"> ): Promise<void> {
        this.uiManager.get( "Vertix/UI-V2/SetupAdapter" )?.editReply( interaction );
    }

    private async onSetupMasterEditButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction );

        args.index = args.masterChannelIndex;
        args.ChannelDBId = args.masterChannelDB.id;
        args.masterChannelId = args.masterChannelDB.channelId;

        const masterChannelData = await ChannelDataManager.$.getSettingsData( args.ChannelDBId, false );

        args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ]
            = masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ];
        args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ] =
            masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ];
        args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ] =
            masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ];
        args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ] =
            masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ] || [
                interaction.guild.roles.everyone.id
            ];

        if ( args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ].includes( interaction.guild.roles.everyone.id ) ) {
            args.dynamicChannelIncludeEveryoneRole = true;
        }

        // For verified roles.
        args._wizardIsFinishButtonAvailable = true;

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
    }

    private async onSelectEditOptionSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        switch ( interaction.values[ 0 ] ) {
            // TODO: Use constants.

            default: // Being called after the modal is canceled and the same option requested again.
            case "edit-dynamic-channel-name":
                await this.showModal( "Vertix/UI-V2/ChannelNameTemplateModal", interaction );
                break;

            case "edit-dynamic-channel-buttons":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditButtons" );
                break;

            case "edit-dynamic-channel-verified-roles":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditVerifiedRoles" );
                break;
        }
    }

    private async onTemplateEditModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const value = interaction.fields.getTextInputValue( "Vertix/UI-V2/SetupEditAdapter:Vertix/UI-V2/ChannelNameTemplateInput" ),
            args = this.getArgsManager().getArgs( this, interaction );

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelNameTemplate: value || DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
        } );

        await MasterChannelManager.$.setChannelNameTemplate( args?.ChannelDBId, value );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
    }

    private async onButtonsSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: interaction.values.map( ( value ) => parseInt( value ) ).sort(),
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditButtonsEffect" );
    }

    private async onButtonsEffectImmediatelyButtonsClicked( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            buttons = args.dynamicChannelButtonsTemplate.sort();

        await MasterChannelManager.$.setChannelButtonsTemplate( args.ChannelDBId, buttons );

        // Get all channels that are using this master channel.
        setTimeout( async () => {
            const channels = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, args.masterChannelId );

            for ( const channelDB of channels ) {
                const channel = AppManager.$.getClient().channels.cache.get( channelDB.channelId ) as VoiceChannel;

                if ( ! channel ) {
                    console.warn( `Channel ${ channelDB.channelId } not found.` );
                }

                await DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
            }

            DynamicChannelClaimManager.$.handleAbandonedChannels( AppManager.$.getClient(), [], channels );
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
    }

    private async onButtonsEffectNewlyButtonClicked( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            buttons = args.dynamicChannelButtonsTemplate.sort();

        await MasterChannelManager.$.setChannelButtonsTemplate( args.ChannelDBId, buttons );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
    }

    private async onDoneButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        switch ( this.getCurrentExecutionStep( interaction )?.name ) {
            case "Vertix/UI-V2/SetupEditButtons":
                await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
                break;

            case "Vertix/UI-V2/SetupEditMaster":
                this.deleteArgs( interaction );

                this.uiManager.get( "Vertix/UI-V2/SetupAdapter" )?.editReply( interaction );
                break;
        }

        this.deleteArgs( interaction );
    }

    private async onConfigExtrasSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args: UIArgs = this.getArgsManager().getArgs( this, interaction ),
            values = interaction.values;

        values.forEach( ( value ) => {
            const parted = value.split( UI_GENERIC_SEPARATOR );

            switch ( parted[ 0 ] ) {
                case "dynamicChannelMentionable":
                    args.dynamicChannelMentionable = !! parseInt( parted[ 1 ] );
                    break;
            }
        } );

        await MasterChannelManager.$.setChannelMentionable( args.ChannelDBId, args.dynamicChannelMentionable );

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
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

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditVerifiedRoles" );
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

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditVerifiedRoles" );
    }

    private async onBackButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            masterChannelData = await ChannelDataManager.$.getSettingsData( args.ChannelDBId, false );

        args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ] =
            masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ] || [
                interaction.guild.roles.everyone.id
            ];

        if ( ! args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ].length ||
            args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ].includes( interaction.guild.roles.everyone.id ) ) {
            args.dynamicChannelIncludeEveryoneRole = true;
        }

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
    }

    private async onFinishButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args: UIArgs = this.getArgsManager().getArgs( this, interaction );

        await MasterChannelManager.$.setChannelVerifiedRoles(
            interaction.guildId,
            args.ChannelDBId,
            args.dynamicChannelVerifiedRoles
        );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupEditMaster" );
    }
}
