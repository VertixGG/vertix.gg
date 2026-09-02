import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { UI_CUSTOM_ID_SEPARATOR, UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { WizardAdapterBuilder } from "@vertix.gg/gui/src/builders/wizard-adapter-builder";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { SetupMasterCreateV3Button } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-v3-button";
import { SetupMasterCreateSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-select-menu";
import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup-elements/setup-max-master-channels-embed";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

// Step 1 component(s)
import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";
import { ChannelNameTemplateEditButton } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-edit-button";

// Step 2 component(s)
import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";
import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu";
import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

// Step 3 component(s)
import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";
import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";

import {
    STEP_1_EMBED_VARS,
    STEP_2_EMBED_VARS,
    STEP_3_EMBED_VARS
} from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-defintions";

import type { BaseGuildTextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { MasterChannelService } from "@vertix.gg/bot/src/services/master-channel-service";
import type { MasterChannelConfigInterface, MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type {
    WizardInteractions,
    IWizardAdapterContext
} from "@vertix.gg/gui/src/builders/builders-definitions";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type UIService from "@vertix.gg/gui/src/ui-service";

async function onCreateMasterChannelClicked(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: WizardInteractions
) {
    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep1Component" );
}

async function onTemplateNameModalSubmit(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const channelNameInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/SetupNewWizardAdapter:VertixBot/UI-General/ChannelNameTemplateInput"
    );

    const value = interaction.fields.getTextInputValue( channelNameInputId );

    context.setArgs( interaction, {
        dynamicChannelNameTemplate: value
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep1Component" );
}

async function onButtonsSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = { ...context.getArgs( interaction ) };
    const buttonValues = interaction.values;

    context.setArgs( interaction, {
        ...args,
        dynamicChannelButtonsTemplate: buttonValues
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep2Component" );
}

async function onConfigExtrasSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = { ...context.getArgs( interaction ) };
    const values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelMentionable":
                args.dynamicChannelMentionable = !!parseInt( parted[ 1 ] );
                break;

            case "dynamicChannelAutoSave":
                args.dynamicChannelAutoSave = !!parseInt( parted[ 1 ] );
                break;

            case "dynamicChannelControlChannelAutoCreate":
                args.dynamicChannelControlChannelAutoCreate = !!parseInt( parted[ 1 ] );
                break;
        }
    } );

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep2Component" );
}

async function onVerifiedRolesSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args = { ...context.getArgs( interaction ) };
    const roles = interaction.values;

    if ( args.dynamicChannelIncludeEveryoneRole ) {
        roles.push( interaction.guildId );
    }

    context.setArgs( interaction, {
        ...args,
        dynamicChannelVerifiedRoles: roles.sort()
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep3Component" );
}

async function onVerifiedRolesEveryoneSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction );
    const values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelIncludeEveryoneRole":
                const state = !!parseInt( parted[ 1 ] );
                const isEveryoneExist = args.dynamicChannelVerifiedRoles?.includes( interaction.guildId );

                args.dynamicChannelIncludeEveryoneRole = state;

                if ( state && !isEveryoneExist ) {
                    args.dynamicChannelVerifiedRoles = args.dynamicChannelVerifiedRoles || [];
                    args.dynamicChannelVerifiedRoles.push( interaction.guildId );
                } else if ( !state && isEveryoneExist ) {
                    args.dynamicChannelVerifiedRoles.splice(
                        args.dynamicChannelVerifiedRoles.indexOf( interaction.guildId ),
                        1
                    );
                }

                args.dynamicChannelVerifiedRoles = args.dynamicChannelVerifiedRoles?.sort();
                break;
        }
    } );

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep3Component" );
}

const SetupStep1Embed = new EmbedBuilder( "VertixBot/UI-V3/SetupNewStep1Embed", STEP_1_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "Step 1 - Set Dynamic Channels Template Name" )
    .setDescription( ( vars ) =>
        "You can specify a default name for dynamic channels that will be used when they are opened.\n\n" +
        "_Current template name_:\n" +
        "`" + vars.dynamicChannelNameTemplate + "`\n\n" +
        "You can keep the default settings by pressing **( `Next ▶` )** button.\n\n" +
        "Not sure how it works? Check out the [explanation](https://voicechannels.xyz/setup/1)."
    )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setLogic( ( args ) => ( {
        dynamicChannelNameTemplate:
            args?.dynamicChannelNameTemplate ||
            ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V3 ).data.settings.dynamicChannelNameTemplate
    } ) )
    .build();

const SetupStep2Embed = new EmbedBuilder( "VertixBot/UI-V3/SetupNewStep2Embed", STEP_2_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "Step 2 - Dynamic Channels Setup" )
    .setDescription( ( vars ) =>
        "Setup dynamic channel management interface.\n\n" +
        "**_🎚 Buttons Interface_**\n\n" +
        vars.message +
        "\n" +
        "**_⚙️ Configuration_**\n\n" +
        "> @ ∙ Mention user in primary message: " +
        vars.configUserMention +
        "\n" +
        "> ⫸ ∙ Auto save dynamic channels: " +
        vars.configAutoSave +
        "\n" +
        "> ▥ ∙ Auto create panel channel: " +
        vars.configControlChannelAutoCreate +
        "\n" +
        "\n" +
        "You can keep the default settings by pressing **( `Next ▶` )** button." +
        "\n\n" +
        "Not sure what buttons do? check out the [explanation](https://voicechannels.xyz/features/dynamic-channel-v3)."
    )
    .setOptions( ( vars ) => ( {
        on: "`🟢∙On`",
        off: "`🔴∙Off`",
        message: {
            [ vars.defaultMessage ]: `${ vars.dynamicChannelButtonsTemplate }\n`,
            [ vars.noButtonsMessage ]: "There are no buttons selected!\n"
        },
        configUserMention: {
            [ vars.configUserMentionEnabled ]: vars.on,
            [ vars.configUserMentionDisabled ]: vars.off
        },
        configAutoSave: {
            [ vars.configAutoSaveEnabled ]: vars.on,
            [ vars.configAutoSaveDisabled ]: vars.off
        },
        configControlChannelAutoCreate: {
            [ vars.configControlChannelAutoCreateEnabled ]: vars.on,
            [ vars.configControlChannelAutoCreateDisabled ]: vars.off
        },
        footer: {
            [ vars.defaultFooter ]: "Newly created dynamic channels through this master channel will be affected by the configuration you have selected.",
            [ vars.noButtonsFooter ]: "Note: Without buttons members will not be able to manage their dynamic channels. no embed or interface will be shown to them.\n"
        }
    } ) )
    .setArrayOptions( {
        dynamicChannelButtonsTemplate: {
            format: "- ( {value} ){separator}",
            separator: "\n",
            options: {
                "rename": EmojiManager.$.getMarkdown( "ChannelRename" ) + "  ∙ **Rename**",
                "limit": EmojiManager.$.getMarkdown( "UserLimit" ) + " ∙ **User Limit**",
                "access": EmojiManager.$.getMarkdown( "ChannelPermissions" ) + " ∙ **Access**",
                "privacy": EmojiManager.$.getMarkdown( "ChannelPrivacy" ) + " ∙ **Privacy**",
                "region": EmojiManager.$.getMarkdown( "ChannelRegion" ) + " ∙ **Region**",
                "edit-primary-message": EmojiManager.$.getMarkdown( "EditChannelMessage" ) + " ∙ **Edit Primary Message**",
                "clear-chat": EmojiManager.$.getMarkdown( "ClearChat" ) + " ∙ **Clear Chat**",
                "rest-channel": EmojiManager.$.getMarkdown( "ResetChannel" ) + "  ∙ **Reset**",
                "transfer": EmojiManager.$.getMarkdown( "TransferChannel" ) + " ∙ **Transfer**",
                "templates": EmojiManager.$.getMarkdown( "Templates" ) + " ∙ **Templates**",
                "claim-button": EmojiManager.$.getMarkdown( "ClaimChannel" ) + " ∙ **Claim**"
            }
        }
    } )
    .setLogic( async( args ) => {
        const vars = STEP_2_EMBED_VARS;
        const buttonsLength = args.dynamicChannelButtonsTemplate?.length ?? 0;
        return {
            configUserMention: args.dynamicChannelMentionable ?
                vars.configUserMentionEnabled : vars.configUserMentionDisabled,

            configAutoSave: args.dynamicChannelAutoSave ?
                vars.configAutoSaveEnabled : vars.configAutoSaveDisabled,

            configControlChannelAutoCreate: args.dynamicChannelControlChannelAutoCreate ?
                vars.configControlChannelAutoCreateEnabled : vars.configControlChannelAutoCreateDisabled,

            message: buttonsLength ?
                vars.defaultMessage : vars.noButtonsMessage,
            footer: buttonsLength ?
                vars.defaultFooter : vars.noButtonsFooter,

            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep3Embed = new EmbedBuilder( "VertixBot/UI-V3/SetupNewStep3Embed", STEP_3_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "Step 3 - Select Verified Roles" )
    .setDescription( ( vars ) =>
        "Select the roles whose permissions will be impacted by the state of Dynamic Channel's.\n\n" +
        "Verified roles are not used in most cases, almost all the servers use the default settings.\n\n" +
        "Not sure how it works?, check out the [explanation](https://voicechannels.xyz/setup/3).\n\n" +
        "**_🛡️ Verified Roles_**\n\n" +
        `> ${ vars.verifiedRolesDisplay }\n\n` +
        "You can keep the default settings by pressing **( `✓ Finish` )** button."
    )
    .setOptions( ( vars ) => ( {
        verifiedRolesDisplay: {
            [ vars.verifiedRoles ]: vars.verifiedRoles,
            [ vars.verifiedRolesDefault ]: "**None**"
        }
    } ) )
    .setArrayOptions( {
        verifiedRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        }
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep1Component = new ComponentBuilder( "VertixBot/UI-V3/SetupStep1Component" )
    .addElements( [ ChannelNameTemplateEditButton ] )
    .addEmbed( SetupStep1Embed )
    .addModal( ChannelNameTemplateModal )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep2Component = new ComponentBuilder( "VertixBot/UI-V3/SetupStep2Component" )
    .addElements( [ ChannelButtonsTemplateSelectMenu ] )
    .addElements( [ ConfigExtrasSelectMenu ] )
    .addEmbed( SetupStep2Embed )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep3Component = new ComponentBuilder( "VertixBot/UI-V3/SetupStep3Component" )
    .addElements( [ VerifiedRolesMenu ] )
    .addElements( [ VerifiedRolesEveryoneSelectMenu ] )
    .addEmbed( SetupStep3Embed )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupNewWizardAdapter = new WizardAdapterBuilder<BaseGuildTextChannel, WizardInteractions>( "VertixBot/UI-V3/SetupNewWizardAdapter" )
    .setComponents( {
        name: "VertixBot/UI-V3/SetupNewWizardComponent",
        components: [ SetupStep1Component, SetupStep2Component, SetupStep3Component ]
    } )
    .setEmbedsGroups( [
        UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        UIEmbedsGroupBase.createSingleGroup( SetupMaxMasterChannelsEmbed )
    ] )
    .setExcludedElements( [ SetupMasterCreateV3Button, SetupMasterCreateSelectMenu ] )
    .setPermissions( new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS ) )
    .setChannelTypes( [ ChannelType.GuildVoice, ChannelType.GuildText ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // Wizard step states
            .addState( "Default", { executionStep: "default" } )
            .addState( "Step1", {
                executionStep: "VertixBot/UI-V3/SetupStep1Component",
                elementsGroup: "VertixBot/UI-V3/SetupStep1Component/ElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupStep1Component/EmbedsGroup",
                previewDefaultVars: { dynamicChannelNameTemplate: "{username}'s Channel" }
            } )
            .addState( "Step2", {
                executionStep: "VertixBot/UI-V3/SetupStep2Component",
                elementsGroup: "VertixBot/UI-V3/SetupStep2Component/ElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupStep2Component/EmbedsGroup"
            } )
            .addState( "Step3", {
                executionStep: "VertixBot/UI-V3/SetupStep3Component",
                elementsGroup: "VertixBot/UI-V3/SetupStep3Component/ElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupStep3Component/EmbedsGroup"
            } )
            .addState( "MaxMasterChannels", {
                executionStep: "VertixBot/UI-General/SetupNewWizardMaxMasterChannels",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup",
                previewDefaultVars: { maxMasterChannels: "3" }
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-General/SetupNewWizardError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            // Start wizard
            .addTransition( "StartWizard", { from: "Default", to: "Step1" } )
            // Step 1 transitions
            .addTransition( "EditTemplateName", { from: "Step1", to: "Step1" } )
            .addTransition( "Step1ToStep2", { from: "Step1", to: "Step2" } )
            // Step 2 transitions
            .addTransition( "SelectButtons", { from: "Step2", to: "Step2" } )
            .addTransition( "SelectConfigExtras", { from: "Step2", to: "Step2" } )
            .addTransition( "Step2ToStep1", { from: "Step2", to: "Step1" } )
            .addTransition( "Step2ToStep3", { from: "Step2", to: "Step3" } )
            // Step 3 transitions
            .addTransition( "SelectVerifiedRoles", { from: "Step3", to: "Step3" } )
            .addTransition( "SelectEveryoneRole", { from: "Step3", to: "Step3" } )
            .addTransition( "Step3ToStep2", { from: "Step3", to: "Step2" } )
            .addTransition( "Finish", { from: "Step3", to: "Default" } )
            // Error transitions
            .addTransition( "ShowMaxChannels", { from: "Step3", to: "MaxMasterChannels" } )
            .addTransition( "ShowError", { from: "Step3", to: "Error" } )
            // Element bindings with handlers
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterCreateV3Button",
                "StartWizard",
                onCreateMasterChannelClicked
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterCreateSelectMenu",
                "StartWizard",
                onCreateMasterChannelClicked
            )
            // Modal-button binding
            .bindModalWithButton<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/ChannelNameTemplateEditButton",
                "VertixBot/UI-General/ChannelNameTemplateModal",
                "EditTemplateName",
                onTemplateNameModalSubmit
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu",
                "SelectButtons",
                onButtonsSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/ConfigExtrasSelectMenu",
                "SelectConfigExtras",
                onConfigExtrasSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesMenu",
                "SelectVerifiedRoles",
                onVerifiedRolesSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
                "SelectEveryoneRole",
                onVerifiedRolesEveryoneSelected
            );
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const result: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-General/SetupNewWizardMaxMasterChannels":
                result.maxMasterChannels = argsFromManager.maxMasterChannels;
                break;
        }

        return result;
    } )
    .onBeforeBuildPrototype( async( context, args, _from, interaction ) => {
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V3/SetupStep2Component":
                args._configExtraMenuDisableLogsChannelOption = true;
                args._configExtraMenuEnableControlChannelAutoCreateOption = true;

                if ( args.dynamicChannelControlChannelAutoCreate === undefined && interaction ) {
                    args.dynamicChannelControlChannelAutoCreate = true;
                    context.setArgs( interaction, {
                        dynamicChannelControlChannelAutoCreate: true
                    } );
                }
                break;

            case "VertixBot/UI-V3/SetupStep3Component":
                args._wizardShouldDisableFinishButton = !args.dynamicChannelVerifiedRoles?.length;
                break;
        }
    } )
    .onBeforeFinish( async(
        context: IWizardAdapterContext<WizardInteractions>,
        interaction: WizardInteractions
    ) => {
        const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V3
        ).defaults;

        const masterChannelService = ServiceLocator.$.get<MasterChannelService>( "VertixBot/Services/MasterChannel" );

        const args = context.getArgs( interaction ) || {};
        const templateName: string = args.dynamicChannelNameTemplate || configV3.settings.dynamicChannelNameTemplate;
        const templateButtons: string[] = args.dynamicChannelButtonsTemplate?.length ?
            args.dynamicChannelButtonsTemplate :
            DynamicChannelPrimaryMessageElementsGroup.sortIds(
                DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() )
            );
        const mentionable: boolean = args.dynamicChannelMentionable || false;
        const autosave: boolean = args.dynamicChannelAutoSave || false;
        const verifiedRoles: string[] = args.dynamicChannelVerifiedRoles || [ interaction.guildId ];
        const controlChannelAutoCreate = !!args.dynamicChannelControlChannelAutoCreate;

        const result = await masterChannelService.createMasterChannel( {
            guildId: interaction.guildId,
            userOwnerId: interaction.user.id,
            dynamicChannelNameTemplate: templateName,
            dynamicChannelButtonsTemplate: templateButtons,
            dynamicChannelMentionable: mentionable,
            dynamicChannelAutoSave: autosave,
            dynamicChannelControlChannelAutoCreate: controlChannelAutoCreate,
            dynamicChannelVerifiedRoles: verifiedRoles,
            version: VERSION_UI_V3
        } );

        switch ( result.code ) {
            case "success":
                // TODO: Need access to regenerate method
                ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
                    .get( "VertixBot/UI-General/SetupAdapter" )
                    ?.editReply( interaction, {
                        newMasterChannelV3: result.db
                    } );
                break;

            case "limit-reached":
                await context.ephemeral( interaction, {
                    maxMasterChannels: result.maxMasterChannels
                } );
                break;

            default:
                await context.ephemeral( interaction, {} );
        }

        context.deleteArgs( interaction );
    } )
    .setShouldRequireArgs( () => true )
    .onRegenerate( async( context, interaction ) => {
        ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
    } )
    .build();

export { SetupNewWizardAdapter, SetupStep1Component, SetupStep2Component, SetupStep3Component };
