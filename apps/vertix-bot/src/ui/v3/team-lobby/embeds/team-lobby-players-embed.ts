import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const TEAM_LOBBY_PLAYERS_EMBED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    players: uiUtilsWrapAsTemplate( "players" ),
    playersMessage: uiUtilsWrapAsTemplate( "playersMessage" ),
    playersMessageDefault: uiUtilsWrapAsTemplate( "playersMessageDefault" ),

    roomsLimit: uiUtilsWrapAsTemplate( "roomsLimit" ),

    applyMessage: uiUtilsWrapAsTemplate( "applyMessage" ),
    applyMessageWaiting: uiUtilsWrapAsTemplate( "applyMessageWaiting" ),
    applyMessageNoCount: uiUtilsWrapAsTemplate( "applyMessageNoCount" ),
    applyMessageNobody: uiUtilsWrapAsTemplate( "applyMessageNobody" ),
    applyMessageTooFew: uiUtilsWrapAsTemplate( "applyMessageTooFew" ),
    applyMessageTooManyRooms: uiUtilsWrapAsTemplate( "applyMessageTooManyRooms" ),
    applyMessageReady: uiUtilsWrapAsTemplate( "applyMessageReady" )
};

/**
 * Who a split is for, under the screen that asks how - each member picked marked ✅ when they are in
 * the lobby and ❌ when they are not, or are a bot - and what **Apply** is waiting for: the members
 * picked, the number, or a lobby that can make the split asked for.
 *
 * Shared by the three screens that ask, and drawn again whenever a member picked comes or goes.
 * Each mark is worked out before drawing and handed in with the member, since a drawing asks nothing
 * of the lobby itself.
 */
const TeamLobbyPlayersEmbed = new EmbedBuilder<UIArgs, typeof TEAM_LOBBY_PLAYERS_EMBED_VARS>(
    "VertixBot/UI-V3/TeamLobbyPlayersEmbed",
    TEAM_LOBBY_PLAYERS_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setDescription( ( vars ) =>
        vars.playersMessage + "\n" +
        vars.applyMessage
    )
    .setArrayOptions( ( { value, separator } ) => ( {
        players: {
            format: `${ value }${ separator }`,
            separator: " · "
        }
    } ) )
    .setOptions( ( vars ) => ( {
        playersMessage: {
            [ String( vars.players ) ]: `**Playing:** ${ vars.players }`,
            [ String( vars.playersMessageDefault ) ]: "**Playing:** everyone in the lobby"
        },
        applyMessage: {
            [ String( vars.applyMessageWaiting ) ]:
                "-# ❌ Not in the lobby yet, or a bot - Apply waits for everyone picked to be in the lobby.",
            [ String( vars.applyMessageNoCount ) ]: "-# Pick the number, then Apply.",
            [ String( vars.applyMessageNobody ) ]: "-# ❌ Nobody is in the lobby to split yet.",
            [ String( vars.applyMessageTooFew ) ]:
                "-# ❌ Not enough people in the lobby for that - pick a smaller number, or wait for more to join.",
            [ String( vars.applyMessageTooManyRooms ) ]:
                `-# ❌ That would open more than ${ vars.roomsLimit } rooms - pick bigger groups.`,
            [ String( vars.applyMessageReady ) ]: "-# Ready - Apply splits the lobby."
        }
    } ) )
    .setLogic( ( args: UIArgs, vars ) => {
        const result: Record<string, JsonValue> = {};

        const players = ( args?.players ?? [] ) as Array<{ id: string; isReady: boolean }>;

        if ( players.length ) {
            result.players = players.map( ( player ) => `${ player.isReady ? "✅" : "❌" } <@${ player.id }>` );
            result.playersMessage = vars.players;
        } else {
            result.playersMessage = vars.playersMessageDefault;
        }

        // Mapped from the refusal codes written out, rather than through anything imported: a preview
        // runs this with nothing but its arguments and these vars.
        const byRefusal: Record<string, string> = {
            "nobody-to-split": vars.applyMessageNobody,
            "too-few-members": vars.applyMessageTooFew,
            "too-many-rooms": vars.applyMessageTooManyRooms
        };

        if ( players.some( ( player ) => ! player.isReady ) ) {
            result.applyMessage = vars.applyMessageWaiting;
        } else if ( undefined === args?.count || null === args?.count ) {
            result.applyMessage = vars.applyMessageNoCount;
        } else if ( args?.planRefusal && byRefusal[ String( args.planRefusal ) ] ) {
            result.applyMessage = byRefusal[ String( args.planRefusal ) ];
            result.roomsLimit = String( args?.roomsLimit ?? "" );
        } else {
            result.applyMessage = vars.applyMessageReady;
        }

        return result;
    } )
    .build();

export { TeamLobbyPlayersEmbed, TEAM_LOBBY_PLAYERS_EMBED_VARS };
