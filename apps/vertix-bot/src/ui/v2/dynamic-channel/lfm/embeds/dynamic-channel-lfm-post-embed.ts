import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import {
    DYNAMIC_CHANNEL_LFM_LIMITS,
    DYNAMIC_CHANNEL_LFM_PARTS
} from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    channelId: uiUtilsWrapAsTemplate( "channelId" ),
    channelName: uiUtilsWrapAsTemplate( "channelName" ),
    ownerId: uiUtilsWrapAsTemplate( "ownerId" ),
    ownerAvatarUrl: uiUtilsWrapAsTemplate( "ownerAvatarUrl" ),
    occupancy: uiUtilsWrapAsTemplate( "occupancy" ),
    elapsedTimeFormatFraction: uiUtilsWrapAsTemplate( "elapsedTimeFormatFraction" ),
    gameName: uiUtilsWrapAsTemplate( "gameName" ),
    gameLine: uiUtilsWrapAsTemplate( "gameLine" ),
    gameKnown: uiUtilsWrapAsTemplate( "gameKnown" ),
    gameUnknown: uiUtilsWrapAsTemplate( "gameUnknown" ),
    note: uiUtilsWrapAsTemplate( "note" ),
    noteLine: uiUtilsWrapAsTemplate( "noteLine" ),
    noteKnown: uiUtilsWrapAsTemplate( "noteKnown" ),
    noteUnknown: uiUtilsWrapAsTemplate( "noteUnknown" )
};

/**
 * Function composeOccupancy() :: The room's fullness as a glance and a number.
 *
 * Drawn out of symbols and digits alone so it needs no translating - the one part of this post
 * that has to read the same to everybody who might join.
 *
 * A channel with no limit has nothing to draw a bar against, so it gets the count by itself rather
 * than a bar that would have to invent a denominator.
 */
function composeOccupancy( memberCount: number, userLimit: number ) {
    if ( userLimit <= 0 ) {
        return String( memberCount );
    }

    const segments = Math.min( userLimit, DYNAMIC_CHANNEL_LFM_LIMITS.SLOTS_BAR_MAX_SEGMENTS );

    const taken = Math.min( segments, Math.round( ( memberCount / userLimit ) * segments ) );

    return DYNAMIC_CHANNEL_LFM_PARTS.SLOT_TAKEN.repeat( taken ) +
        DYNAMIC_CHANNEL_LFM_PARTS.SLOT_OPEN.repeat( segments - taken ) +
        `  ${ memberCount }/${ userLimit }`;
}

const DynamicChannelLfmPostEmbed = new ElapsedEmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelLfmPostEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( Number( args.expiresAt ) ) )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( () => vars.ownerAvatarUrl )
    .setTitle( () => `🔎  ${ vars.channelName } is looking for members` )
    .setDescription( () => (
        `${ vars.noteLine }` +
        `${ vars.gameLine }` +
        `**Members** ${ vars.occupancy }\n` +
        `**Host** <@${ vars.ownerId }>\n\n` +
        `Join them in <#${ vars.channelId }> · closes in \`${ vars.elapsedTimeFormatFraction }\``
    ) )
    .setOptions( () => ( {
        gameLine: {
            [ vars.gameKnown ]: `**Playing** ${ vars.gameName }\n`,
            [ vars.gameUnknown ]: ""
        },
        noteLine: {
            [ vars.noteKnown ]: `> ${ vars.note }\n\n`,
            [ vars.noteUnknown ]: ""
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string> = {
            channelId: args.channelId,
            channelName: args.channelName,
            ownerId: args.ownerId,
            ownerAvatarUrl: args.ownerAvatarUrl,
            occupancy: composeOccupancy( Number( args.memberCount ?? 0 ), Number( args.userLimit ?? 0 ) )
        };

        if ( args.gameName ) {
            result.gameName = args.gameName;
            result.gameLine = vars.gameKnown;
        } else {
            result.gameLine = vars.gameUnknown;
        }

        if ( args.note ) {
            result.note = args.note;
            result.noteLine = vars.noteKnown;
        } else {
            result.noteLine = vars.noteUnknown;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        channelName: "Leo's Channel",
        occupancy: "●●○○○  2/5",
        gameName: "Valorant",
        note: "Need 2 for ranked, mic required",
        elapsedTimeFormatFraction: "30.0 minutes"
    } ) )
    .build();

export { DynamicChannelLfmPostEmbed };
