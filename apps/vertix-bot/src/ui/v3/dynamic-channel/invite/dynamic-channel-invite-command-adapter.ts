import {
    CommandExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/command-execution-adapter-builder";

import {
    DynamicChannelInviteComponent
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-component";

import {
    DynamicChannelInviteButton
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-button";

import {
    defineInviteStates,
    getInviteReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultButtonChannelVoiceInteraction;

/**
 * The interface `/voice invite` opens.
 *
 * The command works out which of three screens applies - the member owns nothing, owns the one, or
 * owns several - and opens straight at it. From there this is the button's interface, shared rather
 * than restated, because from there the two are the same thing: a member picking who to let in.
 *
 * It is built on the command base rather than the ordinary one, and the channel picker is why. The
 * ordinary gate asks whether the member owns the channel they are standing in, and a member choosing
 * between the channels they own is by definition not standing in the one they mean yet - the press
 * would be refused before the choice could be made. Ownership is not going unchecked: the command
 * asked it first, and the picker offers nothing but channels the answer named.
 */
const DynamicChannelInviteCommandAdapter = new CommandExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelInviteCommandAdapter"
)
    .setComponent( DynamicChannelInviteComponent )
    .setExcludedElements( [ DynamicChannelInviteButton ] )
    .defineTransactions( ( tx ) => {
        defineInviteStates( tx ).setInitialState( "SelectUser" );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getInviteReplyArgs )
    .build();

export { DynamicChannelInviteCommandAdapter };
