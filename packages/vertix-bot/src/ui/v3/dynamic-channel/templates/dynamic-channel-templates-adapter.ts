import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelTemplateModel } from "@vertix.gg/base/src/models/data/channel-template-model";

import { DynamicChannelTemplatesButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-button";
import { DynamicChannelTemplatesComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-component";
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { ChannelTemplate } from "@vertix.gg/base/src/interfaces/channel-template";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction =
    | UIDefaultButtonChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
    | UIDefaultModalChannelVoiceInteraction;

const MAX_TEMPLATES = 5;

async function getCurrentChannelConfig( channel: VoiceChannel ) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const state = await dynamicChannelService.getChannelState( channel );
    const visibilityState = await dynamicChannelService.getChannelVisibilityState( channel );

    return {
        nameTemplate: channel.name,
        userLimit: channel.userLimit,
        state,
        visibilityState,
        region: channel.rtcRegion ?? "auto"
    };
}

const DynamicChannelTemplatesAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTemplatesAdapter"
)
    .setComponent( DynamicChannelTemplatesComponent )
    .setInitiatorElement( DynamicChannelTemplatesButton )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                navigationType: "editReply",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
            } )
            .addState( "ApplyMenu", {
                executionStep: "apply-menu",
                navigationType: "editReply",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesApplyElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
            } )
            .addState( "ApplyConfirm", {
                executionStep: "apply-confirm",
                navigationType: "editReply",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
            } )
            .addState( "ManageMenu", {
                executionStep: "manage-menu",
                navigationType: "editReply",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbedGroup"
            } )
            .addState( "DeleteConfirm", {
                executionStep: "delete-confirm",
                navigationType: "editReply",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageConfirmElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbedGroup"
            } )
            .addState( "TemplateSaved", {
                executionStep: "template-saved",
                navigationType: "editReply",
                previewDefaultVars: { templateName: "My Template" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesSavedEmbedGroup"
            } )
            .addState( "TemplateApplied", {
                executionStep: "template-applied",
                navigationType: "editReply",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesAppliedEmbedGroup"
            } )
            .addState( "TemplateDeleted", {
                executionStep: "template-deleted",
                navigationType: "editReply",
                previewDefaultVars: { deletedTemplateName: "My Template" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesDeletedEmbedGroup"
            } )
            // Transitions
            .addTransition( "OpenApplyMenu", { from: "Default", to: "ApplyMenu" } )
            .addTransition( "OpenManageMenu", { from: "Default", to: "ManageMenu" } )
            .addTransition( "SelectTemplateToApply", { from: "ApplyMenu", to: "ApplyConfirm" } )
            .addTransition( "ConfirmApply", { from: "ApplyConfirm", to: "TemplateApplied" } )
            .addTransition( "SelectTemplateToDelete", { from: "ManageMenu", to: "DeleteConfirm" } )
            .addTransition( "ConfirmDelete", { from: "DeleteConfirm", to: "TemplateDeleted" } )
            .addTransition( "SaveTemplate", { from: "Default", to: "TemplateSaved" } )
            .addTransition( "BackToDefault", { from: [ "ApplyMenu", "ManageMenu", "TemplateSaved", "TemplateApplied", "TemplateDeleted" ], to: "Default" } )
            // Handler bindings (combines element-to-transition binding with handler)
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesApplyButton",
                "OpenApplyMenu",
                async( context, interaction ) => {
                    await context.triggerTransition( "OpenApplyMenu", interaction );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesManageButton",
                "OpenManageMenu",
                async( context, interaction ) => {
                    await context.triggerTransition( "OpenManageMenu", interaction );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesBackButton",
                "BackToDefault",
                async( context, interaction ) => {
                    await context.triggerTransition( "BackToDefault", interaction );
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesApplySelectMenu",
                "SelectTemplateToApply",
                async( context, interaction ) => {
                    if ( !interaction.deferred && !interaction.replied ) {
                        try {
                            await interaction.deferUpdate();
                        } catch {
                            return;
                        }
                    }

                    const templateId = interaction.values[ 0 ];

                    const args = context.getArgs( interaction ) ?? {};

                    context.setArgs(
                        interaction,
                        Object.assign( {}, args, {
                            selectedTemplateId: templateId
                        } )
                    );

                    await context.triggerTransition( "SelectTemplateToApply", interaction );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmButton",
                "ConfirmApply",
                async( context, interaction ) => {
                    if ( !interaction.deferred && !interaction.replied ) {
                        try {
                            await interaction.deferUpdate();
                        } catch {
                            return;
                        }
                    }

                    const args = context.getArgs( interaction ) ?? {};
                    const selectedTemplateId = typeof args.selectedTemplateId === "string"
                        ? args.selectedTemplateId
                        : "";

                    if ( !selectedTemplateId ) {
                        await context.triggerTransition( "OpenApplyMenu", interaction );
                        return;
                    }

                    const template = await ChannelTemplateModel.$.getTemplateById(
                        interaction.user.id,
                        interaction.guildId,
                        selectedTemplateId
                    );

                    if ( !template ) {
                        await context.triggerTransition( "OpenApplyMenu", interaction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>(
                        "VertixBot/Services/DynamicChannel"
                    );

                    const config = template.config;

                    try {
                        if ( config.userLimit !== undefined ) {
                            await interaction.channel.setUserLimit( config.userLimit );
                        }

                        if ( config.state && config.state !== "unknown" ) {
                            await dynamicChannelService.editChannelState( interaction, interaction.channel, config.state );
                        }

                        if ( config.visibilityState && config.visibilityState !== "unknown" ) {
                            await dynamicChannelService.editChannelVisibilityState(
                                interaction,
                                interaction.channel,
                                config.visibilityState
                            );
                        }

                        if ( typeof config.region === "string" ) {
                            const region = config.region.trim();

                            if ( region.length ) {
                                await interaction.channel.setRTCRegion( region === "auto" ? null : region );
                            }
                        }

                        if ( config.nameTemplate ) {
                            await interaction.channel.setName( config.nameTemplate ).catch( () => {} );
                        }
                    } catch {
                    }

                    context.setArgs(
                        interaction,
                        Object.assign( {}, args, {
                            appliedTemplate: template,
                            selectedTemplateId: ""
                        } )
                    );

                    await context.triggerTransition( "ConfirmApply", interaction );
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesDeleteSelectMenu",
                "SelectTemplateToDelete",
                async( context, interaction ) => {
                    if ( !interaction.deferred && !interaction.replied ) {
                        try {
                            await interaction.deferUpdate();
                        } catch {
                            return;
                        }
                    }

                    const templateId = interaction.values[ 0 ];

                    const args = context.getArgs( interaction ) ?? {};

                    context.setArgs(
                        interaction,
                        Object.assign( {}, args, {
                            selectedTemplateId: templateId
                        } )
                    );

                    await context.triggerTransition( "SelectTemplateToDelete", interaction );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesDeleteConfirmButton",
                "ConfirmDelete",
                async( context, interaction ) => {
                    if ( !interaction.deferred && !interaction.replied ) {
                        try {
                            await interaction.deferUpdate();
                        } catch {
                            return;
                        }
                    }

                    const args = context.getArgs( interaction ) ?? {};
                    const selectedTemplateId = typeof args.selectedTemplateId === "string"
                        ? args.selectedTemplateId
                        : "";

                    if ( !selectedTemplateId ) {
                        await context.triggerTransition( "OpenManageMenu", interaction );
                        return;
                    }

                    const template = await ChannelTemplateModel.$.getTemplateById(
                        interaction.user.id,
                        interaction.guildId,
                        selectedTemplateId
                    );

                    const templateName = template?.name ?? "Unknown";

                    await ChannelTemplateModel.$.deleteTemplate(
                        interaction.user.id,
                        interaction.guildId,
                        selectedTemplateId
                    );

                    const templates = await ChannelTemplateModel.$.getTemplates(
                        interaction.user.id,
                        interaction.guildId
                    );

                    context.setArgs(
                        interaction,
                        Object.assign( {}, args, {
                            deletedTemplateName: templateName,
                            selectedTemplateId: "",
                            templates
                        } )
                    );

                    await context.triggerTransition( "ConfirmDelete", interaction );
                }
            )
            // Modal-button bindings (for visualization - shows which button opens which modal)
            .bindModalWithButton<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton",
                "VertixBot/UI-V3/DynamicChannelTemplatesSaveModal",
                "SaveTemplate",
                async( context, interaction ) => {
                    const inputId =
                        "VertixBot/UI-V3/DynamicChannelTemplatesAdapter" +
                        UI_CUSTOM_ID_SEPARATOR +
                        "VertixBot/UI-V3/DynamicChannelTemplatesSaveInput";

                    const templateName = interaction.fields.getTextInputValue(
                        context.customIdStrategy.generateId( inputId )
                    );

                    const config = await getCurrentChannelConfig( interaction.channel );

                    const result = await ChannelTemplateModel.$.saveTemplate(
                        interaction.user.id,
                        interaction.guildId,
                        templateName,
                        config
                    );

                    if ( !result.success ) {
                        await context.editReply( interaction, {
                            templateName,
                            error: result.error
                        } );
                        return;
                    }

                    const templates = await ChannelTemplateModel.$.getTemplates(
                        interaction.user.id,
                        interaction.guildId
                    );

                    context.setArgs( interaction, {
                        templates,
                        maxTemplates: MAX_TEMPLATES,
                        templateName
                    } );

                    await context.triggerTransition( "SaveTemplate", interaction );
                }
            );
    } )
    .getStartArgs( async() => ( {
        templates: [],
        maxTemplates: MAX_TEMPLATES
    } ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const existingArgs = context.getArgs( interaction ) ?? {};

        const mergedArgs = Object.assign( {}, existingArgs, argsFromManager ?? {} );

        const templates = Array.isArray( mergedArgs.templates )
            ? ( mergedArgs.templates as ChannelTemplate[] )
            : await ChannelTemplateModel.$.getTemplates(
                interaction.user.id,
                interaction.guildId
            );

        const maxTemplates = typeof mergedArgs.maxTemplates === "number"
            ? mergedArgs.maxTemplates
            : MAX_TEMPLATES;

        return Object.assign( {}, mergedArgs, {
            templates,
            maxTemplates
        } );
    } )
    .build();

export { DynamicChannelTemplatesAdapter };
