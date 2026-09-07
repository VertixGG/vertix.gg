import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    events: uiUtilsWrapAsTemplate( "events" ),
    channels: uiUtilsWrapAsTemplate( "channels" ),
    warning: uiUtilsWrapAsTemplate( "warning" )
};

const TriggerEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixAI/UI/TriggerEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => "🎚️  Events the AI acts on" )
    .setDescription( () => (
        "Pick the Discord events that should wake the AI. For each one it gets " +
        "the event's context plus this server's prompt, and decides what to do.\n\n" +
        `**Enabled:**\n${ vars.events }\n\n` +
        `**Message channels:** ${ vars.channels }\n` +
        `${ vars.warning }`
    ) )
    .setColor( Colors.Blurple )
    .setLogic( ( args: UIArgs ) => ( {
        events: args.eventsLabel,
        channels: args.channelsLabel,
        warning: args.warning
    } ) )
    .setDefaultVars( () => ( {
        events: "None - the AI never acts on its own.",
        channels: "—",
        warning: ""
    } ) )
    .build();

export { TriggerEmbed };
