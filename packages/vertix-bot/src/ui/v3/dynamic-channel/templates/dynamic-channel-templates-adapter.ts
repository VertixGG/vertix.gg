import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelTemplateModel } from "@vertix.gg/base/src/models/data/channel-template-model";

import { DynamicChannelTemplatesButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-button";
import { DynamicChannelTemplatesComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-component";
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { ChannelTemplate } from "@vertix.gg/base/src/interfaces/channel-template";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction =
    | UIDefaultButtonChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelVoiceInteraction
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
        region: channel.rtcRegion ?? ""
    };
}

const DynamicChannelTemplatesAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTemplatesAdapter"
)
    .setComponent( DynamicChannelTemplatesComponent )
    .setInitiatorElement( DynamicChannelTemplatesButton )
    .setExecutionSteps( {
        default: {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
        },
        "apply-menu": {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesApplyElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
        },
        "apply-confirm": {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
        },
        "manage-menu": {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbedGroup"
        },
        "delete-confirm": {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageConfirmElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbedGroup"
        },
        "template-saved": {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesSavedEmbedGroup"
        },
        "template-applied": {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesAppliedEmbedGroup"
        },
        "template-deleted": {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesDeletedEmbedGroup"
        }
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
    .onEntityMap( async( { bindButton, bindModalWithButton, bindSelectMenu } ) => {
        bindModalWithButton<UIDefaultModalChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton",
            "VertixBot/UI-V3/DynamicChannelTemplatesSaveModal",
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

                await context.editReplyWithStep( interaction, "template-saved" );
            }
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesApplyButton",
            async( context, interaction ) => {
                await context.editReplyWithStep( interaction, "apply-menu" );
            }
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesManageButton",
            async( context, interaction ) => {
                await context.editReplyWithStep( interaction, "manage-menu" );
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesApplySelectMenu",
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

                await context.editReplyWithStep( interaction, "apply-confirm" );
            }
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmButton",
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
                    await context.editReplyWithStep( interaction, "apply-menu" );
                    return;
                }

                const template = await ChannelTemplateModel.$.getTemplateById(
                    interaction.user.id,
                    interaction.guildId,
                    selectedTemplateId
                );

                if ( !template ) {
                    await context.editReplyWithStep( interaction, "apply-menu" );
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

                    if ( config.region ) {
                        await interaction.channel.setRTCRegion( config.region || null );
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

                await context.editReplyWithStep( interaction, "template-applied" );
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesDeleteSelectMenu",
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

                await context.editReplyWithStep( interaction, "delete-confirm" );
            }
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesDeleteConfirmButton",
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
                    await context.editReplyWithStep( interaction, "manage-menu" );
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

                await context.editReplyWithStep( interaction, "template-deleted" );
            }
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesBackButton",
            async( context, interaction ) => {
                await context.editReplyWithStep( interaction, "default" );
            }
        );
    } )
    .build();

export { DynamicChannelTemplatesAdapter };

