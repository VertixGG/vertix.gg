import {
    BaseGuildTextChannel,
    ChannelType,
    MessageComponentInteraction,
    PermissionFlagsBits,
    PermissionsBitField,
} from "discord.js";

import {
    UIAdapterBuildSource,
    UIArgs,
} from "@vertix/ui-v2/_base/ui-definitions";

import {
    UIAdapterReplyContext,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UIWizardAdapterBase } from "@vertix/ui-v2/_base/ui-wizard-adapter-base";
import { UIWizardComponentBase } from "@vertix/ui-v2/_base/ui-wizard-component-base";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";

import { TemplateComponent } from "@vertix/ui-v2/template/template-component";
import { ButtonsComponent } from "@vertix/ui-v2/buttons/buttons-component";

import { SetupMasterCreateButton } from "@vertix/ui-v2/setup/setup-master-create-button";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { SomethingWentWrongEmbed } from "@vertix/ui-v2/_general/something-went-wrong-embed";
import { SetupMaxMasterChannelsEmbed } from "@vertix/ui-v2/setup/setup-max-master-channels-embed";

import { MasterChannelManager } from "@vertix/managers/master-channel-manager";

type Interactions = UIDefaultButtonChannelTextInteraction | UIDefaultModalChannelTextInteraction | UIDefaultStringSelectMenuChannelTextInteraction;

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
                    TemplateComponent,
                    ButtonsComponent,
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

    protected async onBeforeBuild( args: UIArgs, from: UIAdapterBuildSource, interaction?: Interactions ): Promise<void> {
        if ( args && ! args.dynamicChannelButtonsTemplate ) {
            const args: UIArgs = {};

            args.dynamicChannelButtonsTemplate = DynamicChannelElementsGroup.getAllItems().map(
                ( item ) => item.getId()
            );

            this.getArgsManager().setArgs( this, interaction as UIAdapterReplyContext, args );
        }
    }

    protected async onBeforeFinish( interaction: UIDefaultButtonChannelTextInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction ),
            templateName: string = args.dynamicChannelNameTemplate,
            templateButtons: number[] = args.dynamicChannelButtonsTemplate;

        const result = await MasterChannelManager.$.createMasterChannel( {
            guildId: interaction.guildId,

            userOwnerId: interaction.user.id,

            dynamicChannelNameTemplate: templateName,
            dynamicChannelButtonsTemplate: templateButtons,
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
        await this.editReplyWithStep( interaction, "Vertix/UI-V2/TemplateComponent" );
    }

    private async onTemplateNameModalSubmit( interaction: UIDefaultModalChannelTextInteraction ) {
        const value = interaction.fields.getTextInputValue( "Vertix/UI-V2/SetupNewWizardAdapter:Vertix/UI-V2/TemplateNameInput" );

        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelNameTemplate: value,
        } );

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/TemplateComponent" );
    }

    private async onButtonsSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        this.getArgsManager().setArgs( this, interaction, {
            dynamicChannelButtonsTemplate: interaction.values.map( ( i ) => parseInt( i ) )
        } );

        await interaction.deferUpdate();
    }
}
