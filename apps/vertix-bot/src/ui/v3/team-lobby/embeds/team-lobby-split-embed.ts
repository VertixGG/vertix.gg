import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const TEAM_LOBBY_SPLIT_EMBED_VARS = {
    roomsCount: uiUtilsWrapAsTemplate( "roomsCount" ),
    moved: uiUtilsWrapAsTemplate( "moved" ),
    splitResult: uiUtilsWrapAsTemplate( "splitResult" ),
    splitDealt: uiUtilsWrapAsTemplate( "splitDealt" ),
    splitPicked: uiUtilsWrapAsTemplate( "splitPicked" )
};

/**
 * What a split did, said to whoever asked for it - the screen they picked a number on, redrawn.
 *
 * Picked teams moved nobody, so they are told where everybody goes instead of how many were moved.
 */
const TeamLobbySplitEmbed = new EmbedBuilder<UIArgs, typeof TEAM_LOBBY_SPLIT_EMBED_VARS>(
    "VertixBot/UI-V3/TeamLobbySplitEmbed",
    TEAM_LOBBY_SPLIT_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "🎮  Split" )
    .setDescription( ( vars ) =>
        vars.splitResult + "\n\n" +
        "Press **↩️ Recall** on the panel to bring everyone back."
    )
    .setOptions( ( { roomsCount, moved, splitDealt, splitPicked } ) => ( {
        splitResult: {
            [ String( splitDealt ) ]: `Opened **${ roomsCount }** rooms and moved **${ moved }** members into them.`,
            [ String( splitPicked ) ]: `Opened **${ roomsCount }** team rooms - everyone walks into the one they want.`
        }
    } ) )
    .setLogic( ( args: UIArgs, vars ) => ( {
        roomsCount: args?.roomsCount ?? "0",
        moved: args?.moved ?? "0",
        splitResult: "pick-teams" === args?.mode ? vars.splitPicked : vars.splitDealt
    } ) )
    .build();

export { TeamLobbySplitEmbed };
