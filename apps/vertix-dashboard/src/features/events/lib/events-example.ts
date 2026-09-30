import { formatEventsClock, formatEventsMinutes } from "@vertix.gg/dashboard/src/features/events/lib/format-events-time";

import type { GuildEventsSettings } from "@vertix.gg/dashboard/src/features/events/types";

/**
 * The one evening every explanation on the page walks through: Raid Night at 9:00 PM, which Maya,
 * Leo, Sam and Noa said they would come to. Maya and Leo are there in time, Sam never comes, Noa
 * comes late, and Kai turns up without having said so.
 *
 * Worked out from the server's own settings, so the times the page shows are the times its board
 * would.
 */
const EXAMPLE_START_MINUTES = 21 * 60;

export const EVENTS_EXAMPLE_NAMES = {
    EVENT: "Raid Night",
    VOICE_CHANNEL: "Raid"
} as const;

/** What the preview can show, in the order an evening gets to them. */
export const EVENTS_PREVIEW_STATES = {
    CHECK_IN: "check-in",
    NEED_SUB: "need-sub",
    RUNNING: "running",
    ENDED: "ended"
} as const;

export type TEventsPreviewState = typeof EVENTS_PREVIEW_STATES[ keyof typeof EVENTS_PREVIEW_STATES ];

/** Names for the ids the settings hold, so the page can say `@Raid Team` rather than a number. */
export interface IEventsExampleNames {
    postChannel: string | null;
    logChannel: string | null;
    checkInRole: string | null;
    subRole: string | null;
}

export interface IEventsExampleStep {
    preview: TEventsPreviewState;
    /** The clock time of the step on the example evening, or null for one no clock decides. */
    at: string | null;
    /** When the step comes, relative to the event. */
    when: string;
    title: string;
    body: string;
}

export interface IEventsExamplePreview {
    componentName: string;
    variables: Record<string, string>;
    /** Who the message pings, as Discord shows it above the post. */
    mentions: string[];
    /** Said in place of the post when, with these settings, it would not go up at all. */
    notPosted: string | null;
    /** The join button, greyed once there is nothing left to join. */
    isJoinClosed: boolean;
}

function ago( minutes: number ) {
    return minutes ? `${ formatEventsMinutes( minutes ) } ago` : "just now";
}

/**
 * Function buildEventsExampleSteps() :: What happens on the example evening, step by step, with the
 * server's timing and pings in it.
 */
export function buildEventsExampleSteps( settings: GuildEventsSettings, names: IEventsExampleNames ): IEventsExampleStep[] {
    const postChannel = names.postChannel ? `#${ names.postChannel }` : "the Events channel",
        checkInPings = [
            ... ( names.checkInRole ? [ `@${ names.checkInRole }` ] : [] ),
            ... ( settings.checkInPingInterested ? [ "everyone on the list who is not in voice yet" ] : [] )
        ],
        subPost = settings.subPostsEnabled
            ? " A \"need a sub\" post asks for as many people as are missing" +
                ( settings.subMinMissing > 1 ? `, once at least ${ settings.subMinMissing } are` : "" ) +
                ( names.subRole ? `, and pings @${ names.subRole }.` : "." )
            : " \"Need a sub\" posts are off.";

    return [
        {
            preview: EVENTS_PREVIEW_STATES.CHECK_IN,
            at: formatEventsClock( EXAMPLE_START_MINUTES - settings.checkInLeadMinutes ),
            when: `${ formatEventsMinutes( settings.checkInLeadMinutes ) } before`,
            title: "The check-in board goes up",
            body: `Posted in ${ postChannel }, listing everyone who pressed Interested on the event.` +
                ( checkInPings.length ? ` It pings ${ checkInPings.join( " and " ) }.` : "" )
        },
        {
            preview: EVENTS_PREVIEW_STATES.CHECK_IN,
            at: formatEventsClock( EXAMPLE_START_MINUTES ),
            when: "The start",
            title: "Members check in by joining voice",
            body: "Joining the event's voice channel - or a room its generator opens - moves them to Here within " +
                "seconds. Nobody has to press Start in Discord."
        },
        {
            preview: EVENTS_PREVIEW_STATES.NEED_SUB,
            at: formatEventsClock( EXAMPLE_START_MINUTES + settings.lateAfterMinutes ),
            when: settings.lateAfterMinutes ? `${ formatEventsMinutes( settings.lateAfterMinutes ) } after` : "At the start",
            title: "Check-in closes",
            body: "Whoever from the list has not come is marked Didn't come; anybody arriving from now on is Late." + subPost
        },
        {
            preview: EVENTS_PREVIEW_STATES.ENDED,
            at: null,
            when: `Empty for ${ formatEventsMinutes( settings.endAfterEmptyMinutes ) }`,
            title: "The board becomes the attendance",
            body: `Once the voice channel has stayed empty that long - or ${ settings.maxDurationHours } h after the start ` +
                "at the latest - the board lists who came, who was late, who didn't come and who walked in, with " +
                "each member's time in voice." +
                ( settings.minVoiceMinutes ? ` Less than ${ settings.minVoiceMinutes } min in voice counts as Didn't come.` : "" ) +
                ( names.logChannel ? ` A copy goes to #${ names.logChannel }.` : "" )
        }
    ];
}

/**
 * Function buildEventsExamplePreview() :: The message a state of the example evening shows in
 * Discord, drawn from the bot's own exported screens.
 *
 * A board's times are Discord timestamps, which a page cannot draw, so its lines are written out the
 * way a member would read them; a value given as a token (`{stateCheckIn}`) is expanded by the
 * embed's own wording, and one given as a sentence is shown as it is.
 */
export function buildEventsExamplePreview(
    state: TEventsPreviewState,
    settings: GuildEventsSettings,
    names: IEventsExampleNames
): IEventsExamplePreview {
    const startsAt = formatEventsClock( EXAMPLE_START_MINUTES ),
        closesAt = formatEventsClock( EXAMPLE_START_MINUTES + settings.lateAfterMinutes ),
        voiceChannel = `<#${ EVENTS_EXAMPLE_NAMES.VOICE_CHANNEL }>`,
        hidden = "{blockHidden}";

    switch ( state ) {
        case EVENTS_PREVIEW_STATES.CHECK_IN:
            return {
                componentName: "VertixBot/UI-General/EventBoardComponent",
                variables: {
                    eventName: EVENTS_EXAMPLE_NAMES.EVENT,
                    stateTitle: "{stateCheckIn}",
                    stateLine: `Starts today at ${ startsAt } (in ${ formatEventsMinutes( settings.checkInLeadMinutes ) }) in ${ voiceChannel }.\n` +
                        `Said you're coming? Join the voice channel to check in - by ${ closesAt } to count as on time.`,
                    checkedInBlock: "\n\n**✅ Here (2)**\n<@Maya>\n<@Leo>",
                    waitingBlock: "\n\n**⏳ Not here yet (2)**\n<@Sam>\n<@Noa>",
                    onTimeBlock: hidden,
                    lateBlock: hidden,
                    noShowBlock: hidden,
                    walkInsBlock: hidden
                },
                mentions: [
                    ... ( names.checkInRole ? [ names.checkInRole ] : [] ),
                    ... ( settings.checkInPingInterested ? [ "Sam", "Noa" ] : [] )
                ],
                notPosted: null,
                isJoinClosed: false
            };

        case EVENTS_PREVIEW_STATES.NEED_SUB:
            return {
                componentName: "VertixBot/UI-General/EventNeedSubComponent",
                variables: {
                    stateTitle: `🙋  ${ EVENTS_EXAMPLE_NAMES.EVENT } needs 2 more`,
                    stateLine: `It started ${ ago( settings.lateAfterMinutes ) } and some who said they would come did not.\n` +
                        `Join ${ voiceChannel } to take a place.`
                },
                mentions: names.subRole ? [ names.subRole ] : [],
                notPosted: ! settings.subPostsEnabled
                    ? "\"Need a sub\" posts are off, so nothing is posted when people are missing."
                    : settings.subMinMissing > 2
                        ? `Only 2 are missing here, and a post goes up once at least ${ settings.subMinMissing } are - so this evening gets none.`
                        : null,
                isJoinClosed: false
            };

        case EVENTS_PREVIEW_STATES.RUNNING:
            return {
                componentName: "VertixBot/UI-General/EventBoardComponent",
                variables: {
                    eventName: EVENTS_EXAMPLE_NAMES.EVENT,
                    stateTitle: "{stateRunning}",
                    stateLine: `Started ${ ago( settings.lateAfterMinutes ) } in ${ voiceChannel }.\n` +
                        "Check-in is closed - anybody from the list who comes now is late.",
                    checkedInBlock: hidden,
                    waitingBlock: hidden,
                    onTimeBlock: "\n\n**✅ Came (2)**\n<@Maya>\n<@Leo>",
                    lateBlock: "\n\n**🕒 Late (1)**\n<@Noa>",
                    noShowBlock: "\n\n**❌ Didn't come (1)**\n<@Sam>",
                    walkInsBlock: "\n\n**👋 Walked in (1)**\n<@Kai>"
                },
                mentions: [],
                notPosted: null,
                isJoinClosed: false
            };

        case EVENTS_PREVIEW_STATES.ENDED:
            return {
                componentName: "VertixBot/UI-General/EventBoardComponent",
                variables: {
                    eventName: EVENTS_EXAMPLE_NAMES.EVENT,
                    stateTitle: "{stateEnded}",
                    stateLine: `Held today at ${ startsAt } in ${ voiceChannel }.\nTimes are hours:minutes in voice.` +
                        ( settings.minVoiceMinutes ? `\nLess than ${ settings.minVoiceMinutes } min in voice counts as not coming.` : "" ),
                    checkedInBlock: hidden,
                    waitingBlock: hidden,
                    onTimeBlock: "\n\n**✅ Came (2)**\n<@Maya> · 2:05\n<@Leo> · 1:58",
                    lateBlock: "\n\n**🕒 Late (1)**\n<@Noa> · 1:32",
                    noShowBlock: "\n\n**❌ Didn't come (1)**\n<@Sam>",
                    walkInsBlock: "\n\n**👋 Walked in (1)**\n<@Kai> · 1:40"
                },
                mentions: [],
                notPosted: null,
                isJoinClosed: true
            };
    }
}
