
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
    .setInitiatorElement( DynamicChannelTemplatesButton )
    .defineTransactions( ( tx ) => {
        defineTemplatesStates( tx )
            .addTransition( "Open", { from: "Default", to: "Default" } )
            /**
             * The opening button is declared by `setInitiatorElement()` above and bound nowhere.
             *
             * It belongs to the control panel, not to this adapter, and `bindButton()` resolves a name
             * against the adapter's own entities - so binding it here threw `does not exist in
             * adapter`, which reaches the client as an error event and takes the whole bot down.
             * Privacy, region and the primary-message editor all declare their initiator the same way
             * and bind nothing; this was the one that did both.
             *
             * Nothing is lost by removing it. The panel opens this adapter with `runInitial()`, whose
             * args go through `getTemplatesReplyArgs()` - which fetches the member's kept settings when
             * the screen is reached without them, which is exactly what the binding did by hand.
             */
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
