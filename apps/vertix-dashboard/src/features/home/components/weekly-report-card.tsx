import { useCallback, useEffect, useState } from "react";

import { AlertTriangle, Check, Loader2 } from "lucide-react";

import {
    GUILD_WEEKLY_REPORT_ERRORS,
    GUILD_WEEKLY_REPORT_SAVE_REFUSALS,
    GUILD_WEEKLY_REPORT_TIMINGS,
    resolveReportedWeekStart
} from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import {
    fetchTextChannels,
    fetchWeeklyReport,
    saveWeeklyReport
} from "@vertix.gg/dashboard/src/features/home/lib/weekly-report-api";

import type {
    IGuildWeeklyReportView,
    TGuildWeeklyReportError,
    TGuildWeeklyReportSaveRefusal
} from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import type { IWeeklyReportChannel } from "@vertix.gg/dashboard/src/features/home/lib/weekly-report-api";

/** What the picker holds for "no channel" - the summary is off. */
const OFF = "";

const MS_PER_MINUTE = 60 * 1000;

/**
 * Function formatWeek() :: The Monday a week starts on, as the summary itself names it - in UTC, where
 * the week is cut, so nobody reads it as the Sunday before.
 */
function formatWeek( iso: string ) {
    return new Date( iso ).toLocaleDateString( undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" } );
}

/**
 * Function describeSaved() :: What happens next, now that a channel is saved.
 *
 * A server that has not had last week's summary gets it at the bot's next look - which is the first
 * thing anybody turning this on wants to see - and every Monday after.
 */
function describeSaved( view: IGuildWeeklyReportView ) {
    if ( ! view.channelId ) {
        return "Turned off.";
    }

    const isLastWeekOwed = ! view.lastWeekStart ||
        new Date( view.lastWeekStart ).getTime() < resolveReportedWeekStart( new Date() ).getTime();

    return isLastWeekOwed
        ? `Saved. Last week's summary is posted within ${ GUILD_WEEKLY_REPORT_TIMINGS.SWEEP_INTERVAL_MS / MS_PER_MINUTE } minutes, then one every Monday.`
        : "Saved. The next summary is posted on Monday.";
}

/**
 * Function describeLastError() :: Why the last week did not go out, in words an admin can act on.
 */
function describeLastError( error: TGuildWeeklyReportError ): string {
    switch ( error ) {
        case GUILD_WEEKLY_REPORT_ERRORS.CHANNEL_MISSING:
            return "Last week's summary was not posted: the channel is gone, or the bot can no longer see it. Pick another.";

        case GUILD_WEEKLY_REPORT_ERRORS.CHANNEL_FORBIDDEN:
            return "Last week's summary was not posted: the bot may not post there any more. Let it view the channel, " +
                "send messages and embed links, or pick another.";
    }
}

/**
 * Function describeRefusal() :: Why the bot would not take a channel, in words an admin can act on.
 */
function describeRefusal( refusal: TGuildWeeklyReportSaveRefusal, missingPermissions: string[] | null ): string {
    switch ( refusal ) {
        case GUILD_WEEKLY_REPORT_SAVE_REFUSALS.BOT_UNREACHABLE:
            return "The bot could not be reached to check the channel. Try again in a minute.";

        case GUILD_WEEKLY_REPORT_SAVE_REFUSALS.BOT_NOT_IN_GUILD:
            return "The bot is not in this server.";

        case GUILD_WEEKLY_REPORT_SAVE_REFUSALS.CHANNEL_UNUSABLE:
            return missingPermissions?.length
                ? `The bot cannot post there - it needs ${ missingPermissions.join( ", " ) } in that channel.`
                : "That is not a text channel the bot can see.";
    }
}

/**
 * Where the server's weekly summary is posted, picked here - or nowhere, which is how it starts.
 *
 * Saved only on the bot's word that it can post in the channel, so a summary that would fail every
 * Monday is refused now, with the reason, rather than saved and left to fail in silence.
 */
export function WeeklyReportCard( { guildId }: { guildId: string } ) {
    const [ view, setView ] = useState<IGuildWeeklyReportView | null>( null );
    const [ channels, setChannels ] = useState<IWeeklyReportChannel[]>( [] );
    const [ picked, setPicked ] = useState( OFF );
    const [ isSaving, setIsSaving ] = useState( false );
    const [ loadFailed, setLoadFailed ] = useState( false );
    const [ notice, setNotice ] = useState<{ isError: boolean; text: string } | null>( null );

    const load = useCallback( async() => {
        try {
            const [ loaded, textChannels ] = await Promise.all( [ fetchWeeklyReport( guildId ), fetchTextChannels( guildId ) ] );

            setView( loaded );
            setChannels( textChannels );
            setPicked( loaded.channelId ?? OFF );
            setLoadFailed( false );
        } catch {
            setLoadFailed( true );
        }
    }, [ guildId ] );

    useEffect( () => {
        setNotice( null );
        void load();
    }, [ load ] );

    const save = useCallback( async() => {
        setIsSaving( true );
        setNotice( null );

        try {
            const result = await saveWeeklyReport( guildId, OFF === picked ? null : picked );

            if ( result.view ) {
                setView( result.view );
                setNotice( { isError: false, text: describeSaved( result.view ) } );
            } else {
                setNotice( { isError: true, text: describeRefusal( result.refusal, result.missingPermissions ) } );
            }
        } catch {
            setNotice( { isError: true, text: "Could not save. Please try again in a moment." } );
        } finally {
            setIsSaving( false );
        }
    }, [ guildId, picked ] );

    if ( loadFailed ) {
        return <div className="text-text-muted text-center py-8">Failed to load the weekly summary</div>;
    }

    if ( ! view ) {
        return <div className="bg-surface border border-border rounded-lg h-32 animate-pulse" />;
    }

    const isChanged = ( view.channelId ?? OFF ) !== picked,
        // A saved channel the bot no longer lists stays pickable, under its id, so it is not dropped by accident.
        isSavedChannelListed = ! view.channelId || channels.some( ( channel ) => channel.id === view.channelId );

    return (
        <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-sm text-text-secondary mb-3">
                Every Monday, the bot posts last week&apos;s rooms, members, busiest hour and busiest generator - each beside
                the week before - in a channel you pick. Free on every plan.
            </p>

            <div className="flex flex-wrap items-center gap-3">
                <select
                    value={ picked }
                    onChange={ ( event ) => setPicked( event.target.value ) }
                    disabled={ isSaving }
                    className="min-w-[14rem] px-3 py-2 rounded-lg text-sm bg-surface-elevated border border-border
                        text-text-primary"
                    aria-label="Channel for the weekly summary"
                >
                    <option value={ OFF }>Off</option>
                    { ! isSavedChannelListed && view.channelId && (
                        <option value={ view.channelId }>{ view.channelId }</option>
                    ) }
                    { channels.map( ( channel ) => (
                        <option key={ channel.id } value={ channel.id }>#{ channel.name }</option>
                    ) ) }
                </select>

                <button
                    type="button"
                    onClick={ () => void save() }
                    disabled={ ! isChanged || isSaving }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white
                        disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                    { isSaving && <Loader2 className="w-4 h-4 animate-spin" /> }
                    Save
                </button>
            </div>

            { notice && (
                <div className={ `mt-3 flex items-start gap-2 text-sm ${ notice.isError ? "text-error" : "text-text-secondary" }` }>
                    { notice.isError ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <Check className="w-4 h-4 shrink-0 mt-0.5" /> }
                    <span>{ notice.text }</span>
                </div>
            ) }

            { ! notice && view.lastError && (
                <div className="mt-3 flex items-start gap-2 text-sm text-warning">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{ describeLastError( view.lastError ) }</span>
                </div>
            ) }

            { view.channelId && view.lastWeekStart && ! view.lastError && (
                <p className="text-xs text-text-muted mt-3 mb-0">
                    Last posted: the week of { formatWeek( view.lastWeekStart ) } (UTC).
                </p>
            ) }
        </div>
    );
}

export default WeeklyReportCard;
