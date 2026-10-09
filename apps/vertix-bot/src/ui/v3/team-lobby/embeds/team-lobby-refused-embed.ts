import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const TEAM_LOBBY_REFUSED_EMBED_VARS = {
    roomsLimit: uiUtilsWrapAsTemplate( "roomsLimit" ),
    missingPermissions: uiUtilsWrapAsTemplate( "missingPermissions" ),

    reason: uiUtilsWrapAsTemplate( "reason" ),
    reasonNotCovered: uiUtilsWrapAsTemplate( "reasonNotCovered" ),
    reasonNotHost: uiUtilsWrapAsTemplate( "reasonNotHost" ),
    reasonAlreadySplit: uiUtilsWrapAsTemplate( "reasonAlreadySplit" ),
    reasonNotSplit: uiUtilsWrapAsTemplate( "reasonNotSplit" ),
    reasonNobodyToSplit: uiUtilsWrapAsTemplate( "reasonNobodyToSplit" ),
    reasonTooFewMembers: uiUtilsWrapAsTemplate( "reasonTooFewMembers" ),
    reasonInvalidCount: uiUtilsWrapAsTemplate( "reasonInvalidCount" ),
    reasonTooManyRooms: uiUtilsWrapAsTemplate( "reasonTooManyRooms" ),
    reasonMissingPermissions: uiUtilsWrapAsTemplate( "reasonMissingPermissions" ),
    reasonFailed: uiUtilsWrapAsTemplate( "reasonFailed" )
};

/**
 * Why a lobby was not made, split or called back - posted as a notice of its own, since a refusal
 * changes nothing on the screen that was pressed.
 *
 * Mapped from the refusal codes written out, rather than through anything imported: a preview runs
 * this with nothing but its arguments and these vars.
 */
const TeamLobbyRefusedEmbed = new EmbedBuilder<UIArgs, typeof TEAM_LOBBY_REFUSED_EMBED_VARS>(
    "VertixBot/UI-V3/TeamLobbyRefusedEmbed",
    TEAM_LOBBY_REFUSED_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( () => "🎮  Team Lobby" )
    .setDescription( ( vars ) => vars.reason )
    .setOptions( ( vars ) => ( {
        reason: {
            [ vars.reasonNotCovered ]:
                "This server has more generators than its plan allows - a lobby counts as one - and this lobby is " +
                "one of the extra ones, so it does not split at the moment. **↩️ Recall** still works.\n\n" +
                "The ones set up first are still working. A server admin can upgrade the plan to switch this one " +
                "back on, or delete a generator it no longer uses.",
            [ vars.reasonNotHost ]:
                "This lobby is run by its hosts - or, when it names none, by whoever is in it.",
            [ vars.reasonAlreadySplit ]:
                "This lobby is split already. Press **↩️ Recall** first.",
            [ vars.reasonNotSplit ]:
                "There is nothing to call back - everyone is in the lobby.",
            [ vars.reasonNobodyToSplit ]:
                "Nobody is in the lobby to split.",
            [ vars.reasonTooFewMembers ]:
                "There are not enough people in the lobby for that.",
            [ vars.reasonInvalidCount ]:
                "That is not a number of teams or a group size this lobby takes.",
            [ vars.reasonTooManyRooms ]:
                `That would open more than **${ vars.roomsLimit }** rooms at once. Pick bigger groups.`,
            [ vars.reasonMissingPermissions ]:
                `The bot is missing **${ vars.missingPermissions }** on this lobby.`,
            [ vars.reasonFailed ]:
                "Discord refused to make a room. Try again in a moment."
        }
    } ) )
    .setLogic( ( args: UIArgs, vars ) => {
        const byCode: Record<string, string> = {
            "not-covered": vars.reasonNotCovered,
            "not-host": vars.reasonNotHost,
            "already-split": vars.reasonAlreadySplit,
            "not-split": vars.reasonNotSplit,
            "nobody-to-split": vars.reasonNobodyToSplit,
            "too-few-members": vars.reasonTooFewMembers,
            "invalid-count": vars.reasonInvalidCount,
            "too-many-rooms": vars.reasonTooManyRooms,
            "missing-permissions": vars.reasonMissingPermissions,
            "failed": vars.reasonFailed
        };

        return {
            reason: byCode[ String( args?.refusalCode ) ] ?? vars.reasonFailed,
            roomsLimit: String( args?.roomsLimit ?? "" ),
            missingPermissions: ( args?.missingPermissions ?? [] ).join( ", " )
        };
    } )
    .build();

export { TeamLobbyRefusedEmbed };
