import { useState } from "react";

import { GUILD_EVENT_ATTENDANCE_KINDS } from "@vertix.gg/definitions/src/guild-events-definitions";

import { EventsPreview } from "@vertix.gg/dashboard/src/features/events/components/events-preview";
import { findName, useEventsSettings } from "@vertix.gg/dashboard/src/features/events/components/use-events-settings";

import { EVENTS_ATTENDANCE_SECTIONS } from "@vertix.gg/dashboard/src/features/events/lib/constants";
import {
    buildEventsExampleSteps,
    EVENTS_PREVIEW_STATES
} from "@vertix.gg/dashboard/src/features/events/lib/events-example";

import type { TGuildEventAttendanceKind } from "@vertix.gg/definitions/src/guild-events-definitions";

import type { TEventsPreviewState } from "@vertix.gg/dashboard/src/features/events/lib/events-example";

/** The preview's tabs, in the order an evening reaches them. */
const PREVIEW_TABS: readonly { state: TEventsPreviewState; label: string }[] = [
    { state: EVENTS_PREVIEW_STATES.CHECK_IN, label: "Check-in" },
    { state: EVENTS_PREVIEW_STATES.NEED_SUB, label: "Sub post" },
    { state: EVENTS_PREVIEW_STATES.RUNNING, label: "Under way" },
    { state: EVENTS_PREVIEW_STATES.ENDED, label: "Attendance" }
];

/** What each mark on the attendance means, in a line. */
const ATTENDANCE_MEANINGS: Record<TGuildEventAttendanceKind, string> = {
    [ GUILD_EVENT_ATTENDANCE_KINDS.CAME ]: "said they'd come, and were there before check-in closed",
    [ GUILD_EVENT_ATTENDANCE_KINDS.LATE ]: "said they'd come, and arrived after it closed",
    [ GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW ]: "said they'd come, and never did",
    [ GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN ]: "came without pressing Interested"
};

/**
 * What Events does, told as one evening with this server's own settings - and what members see at
 * each step of it.
 *
 * The steps are the settings' own order, so reading down the page and down the steps meet; pressing
 * a step shows the message it posts.
 */
export function EventsExplainer() {
    const { settings, channels, roles } = useEventsSettings();

    const [ previewState, setPreviewState ] = useState<TEventsPreviewState>( EVENTS_PREVIEW_STATES.CHECK_IN );

    // The step pressed, apart from the preview it shows: two steps show the same board, and only the
    // one pressed should light up. A tab shows the first step with its preview, or none at all.
    const [ shownStepIndex, setShownStepIndex ] = useState<number | null>( 0 );

    if ( ! settings ) {
        return null;
    }

    const names = {
            postChannel: findName( channels, settings.channelId ),
            logChannel: findName( channels, settings.logChannelId ),
            checkInRole: findName( roles, settings.checkInRoleId ),
            subRole: findName( roles, settings.subRoleId )
        },
        steps = buildEventsExampleSteps( settings, names );

    const showStep = ( index: number ) => {
        setPreviewState( steps[ index ].preview );
        setShownStepIndex( index );
    };

    const showTab = ( state: TEventsPreviewState ) => {
        const firstStepIndex = steps.findIndex( ( step ) => step.preview === state );

        setPreviewState( state );
        setShownStepIndex( -1 === firstStepIndex ? null : firstStepIndex );
    };

    return (
        <div className="space-y-5 min-w-0">
            <section className="bg-surface border border-border rounded-lg p-5">
                <h2 className="text-lg font-semibold text-text-primary mb-1">How it works</h2>
                <p className="text-xs text-text-muted mb-4">
                    Schedule an event in Discord with a voice or stage channel as its location. Everyone who presses
                    { " " }<strong className="text-text-secondary">Interested</strong> is on the list Events checks in -
                    nobody has to press Start. With your settings, an event at 9:00 PM goes like this:
                </p>

                <ol className="list-none pl-0 mb-4 space-y-1">
                    { steps.map( ( step, index ) => {
                        const isShown = index === shownStepIndex;

                        return (
                            <li key={ step.title } className="relative">
                                { index < steps.length - 1 && (
                                    <span aria-hidden="true" className="absolute left-[11px] top-7 bottom-[-4px] w-px bg-border" />
                                ) }

                                <button
                                    type="button"
                                    onClick={ () => showStep( index ) }
                                    className={ `w-full text-left flex gap-3 rounded-md px-1 py-1.5 transition-colors
                                        ${ isShown ? "bg-surface-elevated" : "hover:bg-surface-hover" }` }
                                >
                                    <span
                                        className={ `relative z-10 mt-0.5 w-4 h-4 ml-[4px] rounded-full border-2 shrink-0
                                            ${ isShown ? "border-accent bg-accent" : "border-border-accent bg-surface" }` }
                                    />

                                    <span className="min-w-0">
                                        <span className="block text-xs text-text-accent tabular-nums">
                                            { step.at ? `${ step.at } · ${ step.when }` : step.when }
                                        </span>
                                        <span className="block text-sm font-medium text-text-primary">{ step.title }</span>
                                        <span className="block text-xs text-text-muted">{ step.body }</span>
                                    </span>
                                </button>
                            </li>
                        );
                    } ) }
                </ol>

                <ul className="list-none pl-0 mb-0 space-y-0.5 text-xs text-text-muted border-t border-border-muted pt-3">
                    { EVENTS_ATTENDANCE_SECTIONS.map( ( section ) => (
                        <li key={ section.kind }>
                            { section.mark } <strong className="text-text-secondary">{ section.title }</strong>
                            { " - " }{ ATTENDANCE_MEANINGS[ section.kind ] }
                            { GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW === section.kind && settings.minVoiceMinutes
                                ? `, or stayed less than ${ settings.minVoiceMinutes } min`
                                : "" }
                        </li>
                    ) ) }
                </ul>
            </section>

            <section className="bg-surface border border-border rounded-lg p-5">
                <h2 className="text-lg font-semibold text-text-primary mb-1">What members see</h2>
                <p className="text-xs text-text-muted mb-3">
                    The messages the bot posts on that evening, as they will look in Discord.
                </p>

                <div role="tablist" className="flex flex-wrap gap-1 mb-3">
                    { PREVIEW_TABS.map( ( tab ) => {
                        const isShown = tab.state === previewState,
                            look = isShown ? "bg-surface-elevated text-text-primary font-medium" : "text-text-muted hover:text-text-primary";

                        return (
                            <button
                                key={ tab.state }
                                type="button"
                                role="tab"
                                aria-selected={ isShown }
                                onClick={ () => showTab( tab.state ) }
                                className={ `px-2.5 py-1 rounded-md text-xs transition-colors ${ look }` }
                            >
                                { tab.label }
                            </button>
                        );
                    } ) }
                </div>

                <EventsPreview state={ previewState } settings={ settings } names={ names } />
            </section>
        </div>
    );
}

export default EventsExplainer;
