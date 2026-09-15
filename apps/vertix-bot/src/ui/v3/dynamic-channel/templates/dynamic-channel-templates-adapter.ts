
import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelTemplateModel } from "@vertix.gg/data/src/models/data/channel-template-model";

import { DynamicChannelTemplatesButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-button";
import { DynamicChannelTemplatesComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-component";
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    MAX_TEMPLATES,
    onSaveTemplateSubmitted
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-handlers";

import {
    defineTemplatesStates,
    getTemplatesReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction =
    | UIDefaultButtonChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
    | UIDefaultModalChannelVoiceInteraction;

const DynamicChannelTemplatesAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTemplatesAdapter"
)
    .setComponent( DynamicChannelTemplatesComponent )
    .setInitiatorElement( DynamicChannelTemplatesButton )
    .defineTransactions( ( tx ) => {
        defineTemplatesStates( tx )
            .addTransition( "Open", { from: "Default", to: "Default" } )
            /**
             * Opening the list, which is a piece of work rather than a call: the screen is the
             * member's kept settings, and an adapter opened without them draws an empty list.
             *
             * Bound here rather than in the control panel, which is where it used to live and made
             * this the only feature of its set whose opening could not be reached by name.
             */
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesButton",
                "Open",
                async( context, interaction ) => {
                    const templates = await ChannelTemplateModel.$.getTemplates(
                        interaction.user.id,
                        interaction.guildId
                    );

                    await context.ephemeral( interaction, {
                        templates,
                        maxTemplates: MAX_TEMPLATES
                    } );
                }
            )
            .bindModalWithButton<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton",
                "VertixBot/UI-V3/DynamicChannelTemplatesSaveModal",
                "SaveTemplate",
                async( context, interaction ) => onSaveTemplateSubmitted(
                    context,
                    interaction,
                    context.customIdStrategy.generateId(
                        "VertixBot/UI-V3/DynamicChannelTemplatesAdapter" +
                        UI_CUSTOM_ID_SEPARATOR +
                        "VertixBot/UI-V3/DynamicChannelTemplatesSaveInput"
                    )
                )
            );
    } )
    .getStartArgs( async() => ( {
        templates: [],
        maxTemplates: MAX_TEMPLATES
    } ) )
    .getReplyArgs( getTemplatesReplyArgs )
    .build();

export { DynamicChannelTemplatesAdapter };
