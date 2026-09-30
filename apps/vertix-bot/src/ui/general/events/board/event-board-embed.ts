import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes, UI_IMAGE_BLUE_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { GUILD_EVENT_BOARD_STATES } from "@vertix.gg/bot/src/definitions/guild-events";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const vars = {
    value: uiUtilsWrapAsTemplate( "value" ),
    separator: uiUtilsWrapAsTemplate( "separator" ),

    eventName: uiUtilsWrapAsTemplate( "eventName" ),
    startsAt: uiUtilsWrapAsTemplate( "startsAt" ),
    movedToAt: uiUtilsWrapAsTemplate( "movedToAt" ),
    voiceChannelId: uiUtilsWrapAsTemplate( "voiceChannelId" ),

    stateTitle: uiUtilsWrapAsTemplate( "stateTitle" ),
    stateLine: uiUtilsWrapAsTemplate( "stateLine" ),
    stateCheckIn: uiUtilsWrapAsTemplate( "stateCheckIn" ),
    stateRunning: uiUtilsWrapAsTemplate( "stateRunning" ),
    stateEnded: uiUtilsWrapAsTemplate( "stateEnded" ),
    stateCanceled: uiUtilsWrapAsTemplate( "stateCanceled" ),
    stateMoved: uiUtilsWrapAsTemplate( "stateMoved" ),

    blockShown: uiUtilsWrapAsTemplate( "blockShown" ),
    blockHidden: uiUtilsWrapAsTemplate( "blockHidden" ),
    moreShown: uiUtilsWrapAsTemplate( "moreShown" ),
    moreHidden: uiUtilsWrapAsTemplate( "moreHidden" ),

    checkedIn: uiUtilsWrapAsTemplate( "checkedIn" ),
    checkedInCount: uiUtilsWrapAsTemplate( "checkedInCount" ),
    checkedInHidden: uiUtilsWrapAsTemplate( "checkedInHidden" ),
    checkedInBlock: uiUtilsWrapAsTemplate( "checkedInBlock" ),
    checkedInMore: uiUtilsWrapAsTemplate( "checkedInMore" ),

    waiting: uiUtilsWrapAsTemplate( "waiting" ),
    waitingCount: uiUtilsWrapAsTemplate( "waitingCount" ),
    waitingHidden: uiUtilsWrapAsTemplate( "waitingHidden" ),
    waitingBlock: uiUtilsWrapAsTemplate( "waitingBlock" ),
    waitingMore: uiUtilsWrapAsTemplate( "waitingMore" ),

    onTime: uiUtilsWrapAsTemplate( "onTime" ),
    onTimeCount: uiUtilsWrapAsTemplate( "onTimeCount" ),
    onTimeHidden: uiUtilsWrapAsTemplate( "onTimeHidden" ),
    onTimeBlock: uiUtilsWrapAsTemplate( "onTimeBlock" ),
    onTimeMore: uiUtilsWrapAsTemplate( "onTimeMore" ),

    late: uiUtilsWrapAsTemplate( "late" ),
    lateCount: uiUtilsWrapAsTemplate( "lateCount" ),
    lateHidden: uiUtilsWrapAsTemplate( "lateHidden" ),
    lateBlock: uiUtilsWrapAsTemplate( "lateBlock" ),
    lateMore: uiUtilsWrapAsTemplate( "lateMore" ),

    noShow: uiUtilsWrapAsTemplate( "noShow" ),
    noShowCount: uiUtilsWrapAsTemplate( "noShowCount" ),
    noShowHidden: uiUtilsWrapAsTemplate( "noShowHidden" ),
    noShowBlock: uiUtilsWrapAsTemplate( "noShowBlock" ),
    noShowMore: uiUtilsWrapAsTemplate( "noShowMore" ),

    walkIns: uiUtilsWrapAsTemplate( "walkIns" ),
    walkInsCount: uiUtilsWrapAsTemplate( "walkInsCount" ),
    walkInsHidden: uiUtilsWrapAsTemplate( "walkInsHidden" ),
    walkInsBlock: uiUtilsWrapAsTemplate( "walkInsBlock" ),
    walkInsMore: uiUtilsWrapAsTemplate( "walkInsMore" )
};

/** The lists a board can draw, each with the args and vars that make it up. */
const BOARD_LISTS = [ "checkedIn", "waiting", "onTime", "late", "noShow", "walkIns" ] as const;

type TBoardList = typeof BOARD_LISTS[ number ];

/** Which lists each state of a board draws; a canceled or moved board draws none. */
const BOARD_LISTS_BY_STATE: Record<string, readonly TBoardList[]> = {
    [ GUILD_EVENT_BOARD_STATES.CHECK_IN ]: [ "checkedIn", "waiting" ],
    [ GUILD_EVENT_BOARD_STATES.RUNNING ]: [ "onTime", "late", "noShow", "walkIns" ],
    [ GUILD_EVENT_BOARD_STATES.ENDED ]: [ "onTime", "late", "noShow", "walkIns" ]
};

const STATE_VARS: Record<string, string> = {
    [ GUILD_EVENT_BOARD_STATES.CHECK_IN ]: vars.stateCheckIn,
    [ GUILD_EVENT_BOARD_STATES.RUNNING ]: vars.stateRunning,
    [ GUILD_EVENT_BOARD_STATES.ENDED ]: vars.stateEnded,
    [ GUILD_EVENT_BOARD_STATES.CANCELED ]: vars.stateCanceled,
    [ GUILD_EVENT_BOARD_STATES.MOVED ]: vars.stateMoved
};

/**
 * The one message a run keeps up to date from check-in to attendance.
 *
 * Every wording is in the options, picked by the board's state, so the whole of it reaches the
 * translations - an args value carrying text would reach them only as its own name. The lists are
 * mentions and `h:mm` alone, which need none. Mentions inside an embed never ping, which is why a
 * board can name the whole roster.
 */
const EventBoardEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/EventBoardEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_BLUE_LINE_URL )
    .setTitle( () => `📅  ${ vars.eventName } · ${ vars.stateTitle }` )
    .setDescription( () =>
        `${ vars.stateLine }` +
        `${ vars.checkedInBlock }${ vars.waitingBlock }` +
        `${ vars.onTimeBlock }${ vars.lateBlock }${ vars.noShowBlock }${ vars.walkInsBlock }`
    )
    .setOptions( () => ( {
        stateTitle: {
            [ vars.stateCheckIn ]: "Check-in",
            [ vars.stateRunning ]: "Under way",
            [ vars.stateEnded ]: "Attendance",
            [ vars.stateCanceled ]: "Canceled",
            [ vars.stateMoved ]: "Moved"
        },
        stateLine: {
            [ vars.stateCheckIn ]:
                `Starts <t:${ vars.startsAt }:F> (<t:${ vars.startsAt }:R>) in <#${ vars.voiceChannelId }>.\n` +
                "Said you're coming? Join the voice channel to check in.",
            [ vars.stateRunning ]:
                `Started <t:${ vars.startsAt }:R> in <#${ vars.voiceChannelId }>.\n` +
                "Check-in is closed - anybody from the list who comes now is late.",
            [ vars.stateEnded ]:
                `Held <t:${ vars.startsAt }:F> in <#${ vars.voiceChannelId }>.\n` +
                "Times are hours:minutes in voice.",
            [ vars.stateCanceled ]:
                `Canceled - it was set for <t:${ vars.startsAt }:F>.`,
            [ vars.stateMoved ]:
                `Moved to <t:${ vars.movedToAt }:F>. A new board goes up before then.`
        },
        checkedInBlock: {
            [ vars.blockShown ]: `\n\n**✅ Here (${ vars.checkedInCount })**\n${ vars.checkedIn }${ vars.checkedInMore }`,
            [ vars.blockHidden ]: ""
        },
        waitingBlock: {
            [ vars.blockShown ]: `\n\n**⏳ Not here yet (${ vars.waitingCount })**\n${ vars.waiting }${ vars.waitingMore }`,
            [ vars.blockHidden ]: ""
        },
        onTimeBlock: {
            [ vars.blockShown ]: `\n\n**✅ Came (${ vars.onTimeCount })**\n${ vars.onTime }${ vars.onTimeMore }`,
            [ vars.blockHidden ]: ""
        },
        lateBlock: {
            [ vars.blockShown ]: `\n\n**🕒 Late (${ vars.lateCount })**\n${ vars.late }${ vars.lateMore }`,
            [ vars.blockHidden ]: ""
        },
        noShowBlock: {
            [ vars.blockShown ]: `\n\n**❌ Didn't come (${ vars.noShowCount })**\n${ vars.noShow }${ vars.noShowMore }`,
            [ vars.blockHidden ]: ""
        },
        walkInsBlock: {
            [ vars.blockShown ]: `\n\n**👋 Walked in (${ vars.walkInsCount })**\n${ vars.walkIns }${ vars.walkInsMore }`,
            [ vars.blockHidden ]: ""
        },
        checkedInMore: {
            [ vars.moreShown ]: `\n+${ vars.checkedInHidden } more`,
            [ vars.moreHidden ]: ""
        },
        waitingMore: {
            [ vars.moreShown ]: `\n+${ vars.waitingHidden } more`,
            [ vars.moreHidden ]: ""
        },
        onTimeMore: {
            [ vars.moreShown ]: `\n+${ vars.onTimeHidden } more`,
            [ vars.moreHidden ]: ""
        },
        lateMore: {
            [ vars.moreShown ]: `\n+${ vars.lateHidden } more`,
            [ vars.moreHidden ]: ""
        },
        noShowMore: {
            [ vars.moreShown ]: `\n+${ vars.noShowHidden } more`,
            [ vars.moreHidden ]: ""
        },
        walkInsMore: {
            [ vars.moreShown ]: `\n+${ vars.walkInsHidden } more`,
            [ vars.moreHidden ]: ""
        }
    } ) )
    .setArrayOptions( () => {
        const line = { format: `${ vars.value }${ vars.separator }`, separator: "\n" };

        return {
            checkedIn: line,
            waiting: line,
            onTime: line,
            late: line,
            noShow: line,
            walkIns: line
        };
    } )
    .setLogic( ( args: UIArgs ) => {
        const state = String( args.boardState ),
            shownLists = BOARD_LISTS_BY_STATE[ state ] ?? [],
            stateVar = STATE_VARS[ state ] ?? vars.stateCheckIn;

        const result: Record<string, JsonValue> = {
            eventName: args.eventName,
            startsAt: args.startsAt,
            movedToAt: args.movedToAt ?? args.startsAt,
            voiceChannelId: args.voiceChannelId,
            stateTitle: stateVar,
            stateLine: stateVar
        };

        for ( const list of BOARD_LISTS ) {
            const lines: string[] = args[ list ] ?? [],
                count = Number( args[ `${ list }Count` ] ?? lines.length ),
                hidden = Number( args[ `${ list }Hidden` ] ?? 0 );

            result[ list ] = lines;
            result[ `${ list }Count` ] = count;
            result[ `${ list }Hidden` ] = hidden;
            result[ `${ list }Block` ] = shownLists.includes( list ) && count > 0 ? vars.blockShown : vars.blockHidden;
            result[ `${ list }More` ] = hidden > 0 ? vars.moreShown : vars.moreHidden;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        eventName: "Raid Night",
        startsAt: 1791057600,
        voiceChannelId: "123456789"
    } ) )
    .build();

export { EventBoardEmbed };
