import { MessageComponentInteraction, VoiceChannel } from "discord.js";

import {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { ConfigComponent } from "@vertix/ui-v2/config/config-component";

import { ChannelModel } from "@vertix/models";

import { AppManager } from "@vertix/managers/app-manager";
import { ChannelDataManager } from "@vertix/managers/channel-data-manager";
import { DynamicChannelClaimManager } from "@vertix/managers/dynamic-channel-claim-manager";
import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";
import { MasterChannelManager } from "@vertix/managers/master-channel-manager";

import {
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE
} from "@vertix/definitions/master-channel";

import { AdminAdapterExuBase } from "@vertix/ui-v2/_general/admin/admin-adapter-exu-base";

import { SetupMasterModifyButton } from "@vertix/ui-v2/setup/setup-master-modify-button";

type Interactions =
    UIDefaultButtonChannelTextInteraction |
    UIDefaultStringSelectMenuChannelTextInteraction |
    UIDefaultModalChannelTextInteraction;

/**
 * TODO: `ConfigAdapter` should handle only '/config' command, the rest logic should be handled by setup-wizard.
 */
export class ConfigAdapter extends AdminAdapterExuBase<VoiceChannel, Interactions> {
    public static getName() {
        return "Vertix/UI-V2/ConfigAdapter";
    }

    public static getComponent() {
        return ConfigComponent;
    }

    protected static getExcludedElements() {
        return [
            SetupMasterModifyButton,
        ];
    }

    protected static getExecutionSteps() {
        return {
            default: {},

            "Vertix/UI-V2/ConfigSelectMaster": {
                elementsGroup: "Vertix/UI-V2/ConfigElementsSelectGroup",
                embedsGroup: "Vertix/UI-V2/ConfigSelectEmbedGroup",
            },

            "Vertix/UI-V2/ConfigModifyMaster": {
                elementsGroup: "Vertix/UI-V2/ConfigModifyElementsGroup",
                embedsGroup: "Vertix/UI-V2/ConfigModifyEmbedGroup",
            },

            "Vertix/UI-V2/ConfigModifyButtons": {
                elementsGroup: "Vertix/UI-V2/ConfigModifyButtonsElementsGroup",
                embedsGroup: "Vertix/UI-V2/ConfigModifyButtonsEmbedGroup",
            },
            "Vertix/UI-V2/ConfigModifyButtonsEffect": {
                elementsGroup: "Vertix/UI-V2/ConfigModifyButtonsEffectElementsGroup",
                embedsGroup: "Vertix/UI-V2/ConfigModifyButtonsEffectEmbedGroup",
            },
        };
    }

    protected async getStartArgs( channel: VoiceChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: Interactions, argsFromManager?: UIArgs ) {
        let args: UIArgs = {};

        if ( argsFromManager?.dynamicChannelButtonsTemplate ) {
            args.dynamicChannelButtonsTemplate = argsFromManager.dynamicChannelButtonsTemplate;
        }

        const availableArgs = this.getArgsManager().getArgs( this, interaction ),
            masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;

        if ( masterChannelDB ) {
            args.index = masterChannelDB.masterChannelIndex;
            args.ChannelDBId = masterChannelDB.id;
            args.masterChannelId = masterChannelDB.channelId;

            const masterChannelData = await ChannelDataManager.$.getSettingsData( args.ChannelDBId, false );

            args.dynamicChannelNameTemplate = masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ];
            args.dynamicChannelButtonsTemplate = masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ];
        } else {
            args.masterChannels = await ChannelModel.$.getMasters( interaction.guild?.id || "", true );
        }

        return args;
    }

    protected onEntityMap() {
        this.bindSelectMenu(
            "Vertix/UI-V2/ConfigSelectMasterMenu",
            this.onSelectMasterChannel
        );

        this.bindModalWithButton(
            "Vertix/UI-V2/TemplateModifyButton",
            "Vertix/UI-V2/TemplateNameModal",
            this.onTemplateModifyModalSubmitted
        );

        this.bindButton( "Vertix/UI-V2/ConfigModifyButtonsButton", this.onModifyButtonsButtonClicked );

        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "Vertix/UI-V2/SetupMasterModifyButton",
            this.onSetupMasterModifyButtonClicked
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/ButtonsSelectMenu",
            this.onButtonsSelected
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/ConfigModifyButtonsEffectImmediatelyButton",
            this.onButtonsEffectImmediatelyButtonsClicked
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/ConfigModifyButtonsEffectNewlyButton",
            this.onButtonsEffectNewlyButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelTextInteraction>( "Vertix/UI-V2/DoneButton", this.onDoneButtonClicked );
    }

    protected shouldRequireArgs() {
        return true;
    }

    protected async regenerate( interaction: MessageComponentInteraction<"cached"> ): Promise<void> {
        // TODO: What happens when it start from /config?
        this.uiManager.get( "Vertix/UI-V2/SetupAdapter" )?.editReply( interaction );
    }

    private async onSelectMasterChannel( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const value = interaction.values[ 0 ].split( ":" ),
            index = parseInt( value[ 0 ] ),
            channelDBId = value[ 1 ],
            masterChannelDB = await ChannelModel.$.getByObjectId( channelDBId, true ),
            masterChannelData = await ChannelDataManager.$.getSettingsData( channelDBId, false ),
            args = {
                index,
                ChannelDBId: channelDBId,
                masterChannelId: masterChannelDB?.channelId, // TODO: Possible null.
                dynamicChannelNameTemplate: masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ],
                dynamicChannelButtonsTemplate: masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ],

                // verifiedRoles: [
                //     "@Basic Role",
                // ],
            };

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReply( interaction );
    }

    private async onTemplateModifyModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const value = interaction.fields.getTextInputValue( "Vertix/UI-V2/ConfigAdapter:Vertix/UI-V2/TemplateNameInput" ),
            args = this.getArgsManager().getArgs( this, interaction );

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelNameTemplate: value || DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
        } );

        await MasterChannelManager.$.setChannelNameTemplate( args?.ChannelDBId, value );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/ConfigModifyMaster" );
    }

    private async onModifyButtonsButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction );

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/ConfigModifyButtons", {
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
        } );
    }

    private async onSetupMasterModifyButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction );

        args.index = args.masterChannelIndex;
        args.ChannelDBId = args.masterChannelDB.id;
        args.masterChannelId = args.masterChannelDB.channelId;

        const masterChannelData = await ChannelDataManager.$.getSettingsData( args.ChannelDBId, false );

        args.dynamicChannelNameTemplate = masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ];
        args.dynamicChannelButtonsTemplate = masterChannelData?.object[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ];

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/ConfigModifyMaster" );
    }

    private async onButtonsSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: interaction.values.map( ( value ) => parseInt( value ) ),
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/ConfigModifyButtonsEffect" );
    }

    private async onButtonsEffectImmediatelyButtonsClicked( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            buttons = args.dynamicChannelButtonsTemplate;

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

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/ConfigModifyMaster" );
    }

    private async onButtonsEffectNewlyButtonClicked( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            buttons = args.dynamicChannelButtonsTemplate;

        await MasterChannelManager.$.setChannelButtonsTemplate( args.ChannelDBId, buttons );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/ConfigModifyMaster" );
    }

    private async onDoneButtonClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        switch ( this.getCurrentExecutionStep( interaction )?.name ) {
            case "Vertix/UI-V2/ConfigModifyButtons":

            case "Vertix/UI-V2/ConfigModifyMaster":
                this.uiManager.get( "Vertix/UI-V2/SetupAdapter" )?.editReply( interaction );
                break;
        }

        this.deleteArgs( interaction );
    }
}
