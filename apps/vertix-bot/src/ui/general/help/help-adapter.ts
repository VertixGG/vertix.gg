import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { HelpComponent } from "@vertix.gg/bot/src/ui/general/help/help-component";

import type { TextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * What `/help` opens.
 *
 * It used to open `FeedbackAdapter`, which is built on the admin base - so help demanded that the
 * *bot* hold Manage Channels, Manage Messages, Manage Roles, Connect and Move Members before it
 * would say anything. A server that had not granted those got a wall of missing permissions instead
 * of help, which is the worst possible moment to be told the bot can do nothing: help is where
 * someone goes when the rest is already not working. top.gg declined the listing over exactly that.
 *
 * So this asks for nothing. `ExecutionAdapterBuilder` rather than the admin one, so there is no
 * permission gate to inherit; middleware off; no channel read; and both buttons on it are links,
 * which discord draws and handles without the bot being involved at all. There is no configuration
 * of a server under which `/help` can fail to render.
 *
 * One state and no transitions - it is a page, not a flow - but declared through `defineTransactions`
 * all the same, because that is what emits `VertixBot/UI-General/HelpFlow` into `exports/ui`, which
 * is what the command's `flowTargetState` names and what the dashboard draws.
 */
const HelpAdapter = new ExecutionAdapterBuilder<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
    UIArgs
>( "VertixBot/UI-General/HelpAdapter" )
    .setComponent( HelpComponent )
    // The screen says one fixed thing and reads nothing, but the base makes this mandatory - left
    // out, the reply throws rather than rendering an argument-less embed.
    .getReplyArgs( async() => ( {} ) )
    .disableMiddleware()
    .defineTransactions( ( tx ) => {
        tx.setInitialState( "Initial" )
            .addState( "Initial", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-General/HelpElementsGroup"
            } );
    } )
    .build();

export { HelpAdapter };
