import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

/**
 * The screen that asks how many teams to deal the lobby into.
 */
const TeamLobbyRandomTeamsEmbed = new EmbedBuilder( "VertixBot/UI-V3/TeamLobbyRandomTeamsEmbed" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( "🎲  Random teams" )
    .setDescription(
        "How many teams? Everyone in the lobby is shuffled evenly into them and moved to their team's room.\n\n" +
        "Only some of them playing? Pick who in the first menu, then the number."
    )
    .build();

export { TeamLobbyRandomTeamsEmbed };
