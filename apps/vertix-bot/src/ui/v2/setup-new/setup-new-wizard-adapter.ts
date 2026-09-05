import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { WizardAdapterBuilder } from "@vertix.gg/gui/src/builders/wizard-adapter-builder";

import {
    verifiedRolesFromEveryoneRole,
    verifiedRolesFromSelectedRoles
} from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-utils";

import { SetupMasterCreateButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-button";
import { SetupMasterCreateSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-select-menu";

import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup-elements/setup-max-master-channels-embed";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { SetupStep1Component } from "@vertix.gg/bot/src/ui/v2/setup-new/step-1/setup-step-1-component";
import { SetupStep2Component } from "@vertix.gg/bot/src/ui/v2/setup-new/step-2/setup-step-2-component";
import { SetupStep3Component } from "@vertix.gg/bot/src/ui/v2/setup-new/step-3/setup-step-3-component";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type { BaseGuildTextChannel } from "discord.js";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { MasterChannelService } from "@vertix.gg/bot/src/services/master-channel-service";

import type { IWizardAdapterContext, WizardInteractions } from "@vertix.gg/gui/src/builders/builders-definitions";
import type UIService from "@vertix.gg/gui/src/ui-service";

async function onCreateMasterChannelClicked(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: WizardInteractions
) {
    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep1Component" );
}

async function onTemplateNameModalSubmit(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const channelNameInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V2/SetupNewWizardAdapter:VertixBot/UI-General/ChannelNameTemplateInput"
    );

    const value = interaction.fields.getTextInputValue( channelNameInputId );

    context.setArgs( interaction, {
        dynamicChannelNameTemplate: value
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep1Component" );
}

async function onButtonsSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    context.setArgs( interaction, {
        dynamicChannelButtonsTemplate: interaction.values.map( ( i ) => parseInt( i ) )
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep2Component" );
}

async function _onButtonSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction,
    state: "added" | "remove"
) {
    const selectedButtonId = interaction.values[ 0 ],
        args = context.getArgs( interaction ),
        buttons = args.dynamicChannelButtonsTemplate || DynamicChannelElementsGroup.getAll().map( ( i ) => i.getId() );

    if ( state === "added" ) {
        if ( !buttons.includes( parseInt( selectedButtonId ) ) ) {
            buttons.push( parseInt( selectedButtonId ) );
        }
    } else {
        if ( buttons.includes( parseInt( selectedButtonId ) ) ) {
            buttons.splice( buttons.indexOf( parseInt( selectedButtonId ) ), 1 );
        }
    }

    context.setArgs( interaction, {
        dynamicChannelButtonsTemplate: buttons
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep2Component" );
}

async function onConfigExtrasSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const argsToSet: UIArgs = {},
        values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelMentionable":
                argsToSet.dynamicChannelMentionable = !!parseInt( parted[ 1 ] );
                break;

            case "dynamicChannelAutoSave":
                argsToSet.dynamicChannelAutoSave = !!parseInt( parted[ 1 ] );
                break;

        }
    } );

    context.setArgs( interaction, argsToSet );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep2Component" );
}

async function onVerifiedRolesSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction );

    context.setArgs( interaction, verifiedRolesFromSelectedRoles(
        interaction.values,
        interaction.guildId,
        Boolean( args.dynamicChannelIncludeEveryoneRole )
    ) );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep3Component" );
}

async function onVerifiedRolesEveryoneSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelIncludeEveryoneRole":
                Object.assign( args, verifiedRolesFromEveryoneRole(
                    !!parseInt( parted[ 1 ] ),
                    args.dynamicChannelVerifiedRoles ?? [],
                    interaction.guildId
                ) );

                break;
        }
    } );

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupStep3Component" );
}

const SetupNewWizardAdapter = new WizardAdapterBuilder<BaseGuildTextChannel, WizardInteractions>(
    "VertixBot/UI-V2/SetupNewWizardAdapter"
)
    .setComponents( {
        name: "VertixBot/UI-V2/SetupNewWizardComponent",
        components: [ SetupStep1Component, SetupStep2Component, SetupStep3Component ]
    } )
    .setEmbedsGroups( [
        UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        UIEmbedsGroupBase.createSingleGroup( SetupMaxMasterChannelsEmbed )
    ] )
    .setExcludedElements( [ SetupMasterCreateButton, SetupMasterCreateSelectMenu ] )
    .setPermissions( new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS ) )
    .setChannelTypes( [ ChannelType.GuildVoice, ChannelType.GuildText ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // Wizard step states
            .addState( "Default", { executionStep: "default" } )
            .addState( "Step1", {
                executionStep: "VertixBot/UI-V2/SetupStep1Component",
                elementsGroup: "VertixBot/UI-V2/SetupStep1Component/ElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupStep1Component/EmbedsGroup",
                previewDefaultVars: { dynamicChannelNameTemplate: "{username}'s Channel" }
            } )
            .addState( "Step2", {
                executionStep: "VertixBot/UI-V2/SetupStep2Component",
                elementsGroup: "VertixBot/UI-V2/SetupStep2Component/ElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupStep2Component/EmbedsGroup"
            } )
            .addState( "Step3", {
                executionStep: "VertixBot/UI-V2/SetupStep3Component",
                elementsGroup: "VertixBot/UI-V2/SetupStep3Component/ElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupStep3Component/EmbedsGroup"
            } )
            .addState( "MaxMasterChannels", {
                executionStep: "VertixBot/UI-V2/SetupNewWizardMaxMasterChannels",
                navigationType: "ephemeral",
                previewDefaultVars: { maxMasterChannels: "3" },
                embedsGroup: "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/SetupNewWizardError",
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
            // Handler bindings
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterCreateButton",
                "StartWizard",
                onCreateMasterChannelClicked
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterCreateSelectMenu",
                "StartWizard",
                onCreateMasterChannelClicked
            )
            .bindModalWithButton<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/ChannelNameTemplateEditButton",
                "VertixBot/UI-General/ChannelNameTemplateModal",
                "EditTemplateName",
                onTemplateNameModalSubmit
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu",
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
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const result: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/SetupNewWizardMaxMasterChannels":
                result.maxMasterChannels = argsFromManager?.maxMasterChannels;
                break;
        }

        return result;
    } )
    .onBeforeBuildPrototype( async( context, args, _from, interaction ) => {
        // TODO: Create convenient solution.
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/SetupStep2Component":
                args._configExtraMenuDisableLogsChannelOption = true;

                if ( args.dynamicChannelControlChannelAutoCreate === undefined && interaction ) {
                    args.dynamicChannelControlChannelAutoCreate = true;
                    context.setArgs( interaction, {
                        dynamicChannelControlChannelAutoCreate: true
                    } );
                }
                break;

            case "VertixBot/UI-V2/SetupStep3Component":
                args._wizardShouldDisableFinishButton = !args.dynamicChannelVerifiedRoles?.length;
                break;
        }
    } )
    .onBeforeFinish( async( context, interaction ) => {
        const masterChannelService = ServiceLocator.$.get<MasterChannelService>( "VertixBot/Services/MasterChannel" );
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

        const args = context.getArgs( interaction );
        const templateName: string = args.dynamicChannelNameTemplate;
        const templateButtons: string[] = args.dynamicChannelButtonsTemplate;
        const mentionable: boolean = args.dynamicChannelMentionable;
        const autosave: boolean = args.dynamicChannelAutoSave;
        const verifiedRoles: string[] = args.dynamicChannelVerifiedRoles;
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

            version: VERSION_UI_V2
        } );

        switch ( result.code ) {
            case "success":
                uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
                break;

            case "limit-reached":
                await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/SetupNewWizardMaxMasterChannels", {
                    maxMasterChannels: result.maxMasterChannels
                } );
                break;

            default:
                await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/SetupNewWizardError" );
        }

        context.deleteArgs( interaction );
    } )
    .setShouldRequireArgs( () => true )
    .onRegenerate( async( context, interaction ) => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
    } )
    .build();

export { SetupNewWizardAdapter };
