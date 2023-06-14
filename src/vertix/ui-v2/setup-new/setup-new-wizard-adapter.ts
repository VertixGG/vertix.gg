import {
    BaseGuildTextChannel,
    ChannelType,
    MessageComponentInteraction,
    PermissionFlagsBits,
    PermissionsBitField,
} from "discord.js";

import { UI_GENERIC_SEPARATOR, UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UIWizardAdapterBase } from "@vertix/ui-v2/_base/ui-wizard-adapter-base";
import { UIWizardComponentBase } from "@vertix/ui-v2/_base/ui-wizard-component-base";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";

import { SetupStep1Component } from "@vertix/ui-v2/setup-new/step-1/setup-step-1-component";
import { SetupStep2Component } from "@vertix/ui-v2/setup-new/step-2/setup-step-2-component";

import { SetupMasterCreateButton } from "@vertix/ui-v2/setup/setup-master-create-button";

import { SomethingWentWrongEmbed } from "@vertix/ui-v2/_general/something-went-wrong-embed";
import { SetupMaxMasterChannelsEmbed } from "@vertix/ui-v2/setup/setup-max-master-channels-embed";

import { MasterChannelManager } from "@vertix/managers/master-channel-manager";

import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE } from "@vertix/definitions/master-channel";

type Interactions =
    UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

export class SetupNewWizardAdapter extends UIWizardAdapterBase<BaseGuildTextChannel, Interactions> {
    public static getName() {
        return "Vertix/UI-V2/SetupNewWizardAdapter";
    }

    public static getComponent() {
        return class SetupNewWizardComponent extends UIWizardComponentBase {
            public static getName() {
                return "Vertix/UI-V2/SetupNewWizardComponent";
            }

            public static getComponents() {
                return [
                    SetupStep1Component,
                    SetupStep2Component,
                ];
            }

            public static getEmbedsGroups() {
                return [
                    // TODO: Find better way to do this.
                    ... super.getEmbedsGroups(),

                    UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
                    UIEmbedsGroupBase.createSingleGroup( SetupMaxMasterChannelsEmbed ),
                ];
            }
        };
    }

    protected static getExcludedElements() {
        return [
            SetupMasterCreateButton,
        ];
    }

    protected static getExecutionSteps() {
        return {
            "Vertix/UI-V2/SetupNewWizardMaxMasterChannels": {
                embedsGroup: "Vertix/UI-V2/SetupMaxMasterChannelsEmbedGroup",
            },

            "Vertix/UI-V2/SetupNewWizardError": {
                embedsGroup: "Vertix/UI-V2/SomethingWentWrongEmbedGroup",
            },
        };
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.Administrator );
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice,
            ChannelType.GuildText,
        ];
    }

    protected onEntityMap() {
        // Create new master channel.
        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "Vertix/UI-V2/SetupMasterCreateButton",
            this.onCreateMasterChannelClicked
        );

        // Modify template name.
        this.bindModalWithButton<UIDefaultModalChannelTextInteraction>(
            "Vertix/UI-V2/TemplateModifyButton",
            "Vertix/UI-V2/TemplateNameModal",
            this.onTemplateNameModalSubmit
        );

        // Select buttons menu.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/ButtonsSelectMenu",
            this.onButtonsSelected
        );

        // Config buttons menu.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V2/ConfigExtrasSelectMenu",
            this.onConfigExtrasSelected
        );

        // this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
        //     "Vertix/UI-V2/ButtonsAddSelectMenu",
        //     async ( interaction ) => {
        //         await this.onButtonSelected( interaction, "added" );
        //     }
        // );
        //
        // this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
        //     "Vertix/UI-V2/ButtonsRemoveSelectMenu",
        //     async ( interaction ) => {
        //         await this.onButtonSelected( interaction, "remove" );
        //     }
        // );
    }

    protected async getStartArgs( channel: BaseGuildTextChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: UIDefaultButtonChannelTextInteraction, argsFromManager: UIArgs ) {
        const result: UIArgs = {};

        switch ( this.getCurrentExecutionStep( interaction )?.name ) {
            case "Vertix/UI-V2/SetupNewWizardMaxMasterChannels":
                result.maxMasterChannels = argsFromManager.maxMasterChannels;
                break;
        }

        return result;
    }

    protected async onBeforeFinish( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            templateName: string = args.dynamicChannelNameTemplate,
            templateButtons: number[] = args.dynamicChannelButtonsTemplate,
            mentionable: boolean = args.dynamicChannelMentionable;

        const result = await MasterChannelManager.$.createMasterChannel( {
            guildId: interaction.guildId,

            userOwnerId: interaction.user.id,

            dynamicChannelNameTemplate: templateName,
            dynamicChannelButtonsTemplate: templateButtons,
            dynamicChannelMentionable: mentionable,
        } );

        switch ( result.code ) {
            case "success":
                await this.regenerate( interaction );
                break;

            case "limit-reached":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/SetupNewWizardMaxMasterChannels", {
                    maxMasterChannels: result.maxMasterChannels,
                } );
                break;

            default:
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/SetupNewWizardError" );
        }

        this.deleteArgs( interaction );
    }

    protected shouldRequireArgs(): boolean {
        return true;
    }

    protected async regenerate( interaction: MessageComponentInteraction<"cached"> ): Promise<void> {
        this.uiManager.get( "Vertix/UI-V2/SetupAdapter" )?.editReply( interaction );
    }

    private async onCreateMasterChannelClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupStep1Component" );
    }

    private async onTemplateNameModalSubmit( interaction: UIDefaultModalChannelTextInteraction ) {
        const value = interaction.fields.getTextInputValue( "Vertix/UI-V2/SetupNewWizardAdapter:Vertix/UI-V2/TemplateNameInput" );

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelNameTemplate: value,
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupStep1Component" );
    }

    private async onButtonsSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: interaction.values.map( ( i ) => parseInt( i ) )
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupStep2Component" );
    }

    private async onButtonSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction, state: "added" | "remove" ) {
        const selectedButtonId = interaction.values[ 0 ],
            args = this.getArgsManager().getArgs( this, interaction ),
            buttons = args.dynamicChannelButtonsTemplate || DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE;

        if ( state === "added" ) {
            if ( ! buttons.includes( parseInt( selectedButtonId ) ) ) {
                buttons.push( parseInt( selectedButtonId ) );
            }
        } else {
            if ( buttons.includes( parseInt( selectedButtonId ) ) ) {
                buttons.splice( buttons.indexOf( parseInt( selectedButtonId ) ), 1 );
            }
        }

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: buttons,
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupStep2Component" );
    }

    private async onConfigExtrasSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const argsToSet: UIArgs = {},
            values = interaction.values;

        values.forEach( ( value ) => {
            const parted = value.split( UI_GENERIC_SEPARATOR );

            switch ( parted[ 0 ] ) {
                case "dynamicChannelMentionable":
                    argsToSet.dynamicChannelMentionable = !! parseInt( parted[ 1 ] );
                    break;
            }
        } );

        this.getArgsManager().setArgs( this, interaction, argsToSet );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/SetupStep2Component" );
    }
}
