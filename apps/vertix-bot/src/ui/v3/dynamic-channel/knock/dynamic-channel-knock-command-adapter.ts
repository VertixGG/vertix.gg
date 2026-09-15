import {
    CommandExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/command-execution-adapter-builder";

import {
    DynamicChannelKnockComponent
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-component";

import {
    defineKnockStates,
    getKnockReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction =
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultButtonChannelVoiceInteraction;

/**
 * The interface `/knock` opens.
 *
 * Its own adapter rather than the knock button's, because the two are reached differently and it
 * showed: the button's interface does its deciding inside the button's own handler, and a command
 * that opened it landed on a springboard state that draws an embed and no menu. Here the deciding
 * happens in the command, which then opens this at whichever screen the answer was - so every state
 * this holds is a screen a member can actually be shown, and none of them is a place to pass
 * through.
 *
 * The screens themselves are the button interface's own, shared rather than restated.
 */
const DynamicChannelKnockCommandAdapter = new CommandExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelKnockCommandAdapter"
)
    .setComponent( DynamicChannelKnockComponent )
    .defineTransactions( ( tx ) => {
        defineKnockStates( tx ).setInitialState( "SelectChannel" );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getKnockReplyArgs )
    .build();

export { DynamicChannelKnockCommandAdapter };
