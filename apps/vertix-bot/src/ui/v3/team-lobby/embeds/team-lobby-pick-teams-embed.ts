import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

/**
 * The screen that asks how many team rooms to open for members to pick from.
 */
const TeamLobbyPickTeamsEmbed = new EmbedBuilder( "VertixBot/UI-V3/TeamLobbyPickTeamsEmbed" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( "🙋  Pick teams" )
    .setDescription(
        "How many teams? Their rooms open empty, each holding its share of the lobby, and everyone walks into the one they want.\n\n" +
        "Only some of them playing? Pick who in the first menu, then the number - the rooms open to them alone."
    )
    .build();

export { TeamLobbyPickTeamsEmbed };
