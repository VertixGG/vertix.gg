import { Colors } from "discord.js";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Shown when a question spanning two presses is answered after the first press was forgotten.
 *
 * The screen asking it is an ordinary message and stays on display, so the second press still
 * arrives - it just arrives at a process that no longer knows what was picked. Saying so is the
 * whole point of this embed: the generic failure it replaces reads as the action having gone wrong,
 * when nothing was attempted at all.
 */
const ChoiceExpiredEmbed = new EmbedBuilder(
    "VertixBot/UI-General/ChoiceExpiredEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "⌛ That choice expired" )
    .setDescription( "Nothing was changed.\n\nStart over to pick again." )
    .setColor( Colors.Yellow )
    .build();

export { ChoiceExpiredEmbed };
