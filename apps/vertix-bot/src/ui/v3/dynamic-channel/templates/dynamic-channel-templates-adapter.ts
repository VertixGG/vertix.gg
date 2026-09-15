
import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

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
    /**
     * The button belongs to the control panel, and the panel opens this adapter by handing it that
     * press - so `run()` looks the press up among *this* adapter's entities and has to find it.
     *
     * `setExcludedElements()` is what puts it there; `setInitiatorElement()` only records it, and on
     * this builder nothing reads that back. Declaring the initiator and binding the button threw
     * `does not exist in adapter`, and so did declaring it and binding nothing - the entity was
     * missing either way, and only the second failed silently, with the panel simply not answering.
     *
     * Registered and bound, the way transfer, knock and invite each do it.
     */
    .setExcludedElements( [ DynamicChannelTemplatesButton ] )
    .defineTransactions( ( tx ) => {
        defineTemplatesStates( tx )
            // The press lands on `Entry`, which draws nothing, and the transition opens the screen.
            // `Opened` and not `Default`: the first screen has to be sent before it can be edited.
            .setInitialState( "Entry" )
            .addState( "Entry", { executionStep: "default" } )
            .addTransition( "Open", { from: "Entry", to: "Opened" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesButton",
                "Open",
                async( context, interaction ) => {
                    await context.triggerTransition( "Open", interaction );
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
