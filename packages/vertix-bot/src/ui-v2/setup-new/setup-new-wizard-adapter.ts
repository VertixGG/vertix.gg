import { ChannelType, PermissionsBitField, } from "discord.js";

import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE } from "@vertix.gg/base/src/definitions/master-channel-defaults";

import { UI_GENERIC_SEPARATOR } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { UIWizardAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-wizard-adapter-base";
import { UIWizardComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-wizard-component-base";
import { UIEmbedsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embeds-group-base";

import { SetupStep1Component } from "@vertix.gg/bot/src/ui-v2/setup-new/step-1/setup-step-1-component";
import { SetupStep2Component } from "@vertix.gg/bot/src/ui-v2/setup-new/step-2/setup-step-2-component";
import { SetupStep3Component } from "@vertix.gg/bot/src/ui-v2/setup-new/step-3/setup-step-3-component";

import { SetupMasterCreateButton } from "@vertix.gg/bot/src/ui-v2/setup/setup-master-create-button";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui-v2/_general/something-went-wrong-embed";
import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui-v2/setup/setup-max-master-channels-embed";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";
import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { BaseGuildTextChannel, MessageComponentInteraction } from "discord.js";

type Interactions =
    UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

export class SetupNewWizardAdapter extends UIWizardAdapterBase<BaseGuildTextChannel, Interactions> {
    public static getName() {
        return "VertixBot/UI-V2/SetupNewWizardAdapter";
    }

    public static getComponent() {
        return class SetupNewWizardComponent extends UIWizardComponentBase {
            public static getName() {
                return "VertixBot/UI-V2/SetupNewWizardComponent";
            }

            public static getComponents() {
                return [
                    SetupStep1Component,
                    SetupStep2Component,
                    SetupStep3Component,
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
            "VertixBot/UI-V2/SetupNewWizardMaxMasterChannels": {
                embedsGroup: "VertixBot/UI-V2/SetupMaxMasterChannelsEmbedGroup",
            },

            "VertixBot/UI-V2/SetupNewWizardError": {
                embedsGroup: "VertixBot/UI-V2/SomethingWentWrongEmbedGroup",
            },
        };
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
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
            "VertixBot/UI-V2/SetupMasterCreateButton",
            this.onCreateMasterChannelClicked
        );

        // Edit template name.
        this.bindModalWithButton<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-V2/ChannelNameTemplateEditButton",
            "VertixBot/UI-V2/ChannelNameTemplateModal",
            this.onTemplateNameModalSubmit
        );

        // Select buttons menu.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu",
            this.onButtonsSelected
        );

        // Config buttons menu.
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V2/ConfigExtrasSelectMenu",
            this.onConfigExtrasSelected
        );

        // this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
        //     "VertixBot/UI-V2/ButtonsAddSelectMenu",
        //     async ( interaction ) => {
        //         await this.onButtonSelected( interaction, "added" );
        //     }
        // );
        //
        // this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
        //     "VertixBot/UI-V2/ButtonsRemoveSelectMenu",
        //     async ( interaction ) => {
        //         await this.onButtonSelected( interaction, "remove" );
        //     }
        // );

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
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async getStartArgs( channel: BaseGuildTextChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: UIDefaultButtonChannelTextInteraction, argsFromManager: UIArgs ) {
        const result: UIArgs = {};

        switch ( this.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/SetupNewWizardMaxMasterChannels":
                result.maxMasterChannels = argsFromManager.maxMasterChannels;
                break;
        }

        return result;
    }

    protected async onBeforeBuild( args: UIArgs, from: UIAdapterBuildSource, context: Interactions ): Promise<void> {
        // TODO: Create convenient solution.
        switch ( this.getCurrentExecutionStep( context )?.name ) {

            case "VertixBot/UI-V2/SetupStep2Component":
                args._configExtraMenuDisableLogsChannelOption = true;
                break;

            case "VertixBot/UI-V2/SetupStep3Component":
                args._wizardShouldDisableFinishButton = ! args.dynamicChannelVerifiedRoles?.length;
                break;
        }
    }

    protected async onBeforeFinish( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            templateName: string = args.dynamicChannelNameTemplate,
            templateButtons: number[] = args.dynamicChannelButtonsTemplate,
            mentionable: boolean = args.dynamicChannelMentionable,
            autosave: boolean = args.dynamicChannelAutoSave,
            verifiedRoles: string[] = args.dynamicChannelVerifiedRoles;

        const result = await this.masterChannelService.createMasterChannel( {
            guildId: interaction.guildId,

            userOwnerId: interaction.user.id,

            dynamicChannelNameTemplate: templateName,

            dynamicChannelButtonsTemplate: templateButtons,

            dynamicChannelMentionable: mentionable,
            dynamicChannelAutoSave: autosave,

            dynamicChannelVerifiedRoles: verifiedRoles,
        } );

        switch ( result.code ) {
            case "success":
                await this.regenerate( interaction );
                break;

            case "limit-reached":
                await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/SetupNewWizardMaxMasterChannels", {
                    maxMasterChannels: result.maxMasterChannels,
                } );
                break;

            default:
                await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/SetupNewWizardError" );
        }

        this.deleteArgs( interaction );
    }

    protected shouldRequireArgs(): boolean {
        return true;
    }

    protected async regenerate( interaction: MessageComponentInteraction<"cached"> ): Promise<void> {
        this.uiService.get( "VertixBot/UI-V2/SetupAdapter" )?.editReply( interaction );
    }

    private async onCreateMasterChannelClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep1Component" );
    }

    private async onTemplateNameModalSubmit( interaction: UIDefaultModalChannelTextInteraction ) {
        const value = interaction.fields.getTextInputValue( "VertixBot/UI-V2/SetupNewWizardAdapter:VertixBot/UI-V2/ChannelNameTemplateInput" );

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelNameTemplate: value,
        } );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep1Component" );
    }

    private async onButtonsSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: interaction.values.map( ( i ) => parseInt( i ) ),
        } );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep2Component" );
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

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep2Component" );
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

                case "dynamicChannelAutoSave":
                    argsToSet.dynamicChannelAutoSave = !! parseInt( parted[ 1 ] );
                    break;
            }
        } );

        this.getArgsManager().setArgs( this, interaction, argsToSet );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep2Component" );
    }

    private async onVerifiedRolesSelected( interaction: UIDefaultStringSelectRolesChannelTextInteraction ) {
        const args: UIArgs = this.getArgsManager().getArgs( this, interaction ),
            roles = interaction.values;

        if ( args.dynamicChannelIncludeEveryoneRole ) {
            roles.push( interaction.guildId );
        }

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelVerifiedRoles: roles.sort(),
        } );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep3Component" );
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

        this.getArgsManager().setArgs( this, interaction, args );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep3Component" );
    }

}
