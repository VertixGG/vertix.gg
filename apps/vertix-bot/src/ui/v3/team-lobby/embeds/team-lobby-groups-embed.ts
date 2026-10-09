import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

/**
 * The screen that asks how many to put in each group.
 */
const TeamLobbyGroupsEmbed = new EmbedBuilder( "VertixBot/UI-V3/TeamLobbyGroupsEmbed" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( "👥  Groups" )
    .setDescription(
        "How many to a group? Everyone in the lobby is dealt into rooms of that size and moved.\n\n" +
        "Only some of them taking part? Pick who in the first menu, then the size."
    )
    .build();

export { TeamLobbyGroupsEmbed };
