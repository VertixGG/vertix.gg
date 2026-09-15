import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    DynamicChannelTemplatesComponent
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-component";

import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    defineTemplatesStates,
    getTemplatesReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-states";

import {
    MAX_TEMPLATES,
    onSaveTemplateSubmitted
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-handlers";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction =
    | UIDefaultButtonChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
    | UIDefaultModalChannelVoiceInteraction;

/**
 * The interface `/voice templates` opens.
 *
 * It starts on the list of kept settings, which is where the button's interface starts too - the
 * difference is only in who fetched them. The button's handler reads a member's templates and opens
 * the interface holding them; the command does that reading itself, and this is opened already
 * holding the answer.
 *
 * Every screen and every handler past that is shared with the button's interface rather than
 * restated. What is its own is the save modal: a modal's field is read back by an id built from the
 * name of whichever adapter opened it.
 */
const DynamicChannelTemplatesCommandAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTemplatesCommandAdapter"
)
    .setComponent( DynamicChannelTemplatesComponent )
    .defineTransactions( ( tx ) => {
        defineTemplatesStates( tx )
            .bindModalWithButton<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton",
                "VertixBot/UI-V3/DynamicChannelTemplatesSaveModal",
                "SaveTemplate",
                async( context, interaction ) => onSaveTemplateSubmitted(
                    context,
                    interaction,
                    context.customIdStrategy.generateId(
                        "VertixBot/UI-V3/DynamicChannelTemplatesCommandAdapter" +
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

export { DynamicChannelTemplatesCommandAdapter };
