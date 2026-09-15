import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelPermissionsAccessComponent
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-access-component";

import {
    definePermissionsAccessStates,
    getPermissionsAccessReplyArgs
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-access-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

/**
 * The interface `/voice access` opens on a channel whose generator runs the older interface.
 *
 * v2 keeps access behind a button on its privacy screen, so opening that adapter landed a member on
 * the privacy screen and left them to find the button. Here the access screen is simply where this
 * starts - and it is that same screen, shared rather than restated.
 *
 * It draws a component of its own holding only the access wordings, because the privacy ones belong
 * to `/voice privacy` and a component carrying screens this can never reach would be describing an
 * interface that does not exist.
 */
const DynamicChannelPermissionsAccessCommandAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelPermissionsAccessCommandAdapter"
)
    .setComponent( DynamicChannelPermissionsAccessComponent )
    .defineTransactions( ( tx ) => {
        definePermissionsAccessStates( tx, { actedFrom: "Access" } )
            .setInitialState( "Access" );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getPermissionsAccessReplyArgs )
    .build();

export { DynamicChannelPermissionsAccessCommandAdapter };
