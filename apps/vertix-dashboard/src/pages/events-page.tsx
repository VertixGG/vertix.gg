import { useEffect } from "react";

import { Navigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";

import { Loader2, AlertTriangle, RefreshCw, X } from "lucide-react";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import {
    EVENTS_COMMANDS,
    EVENTS_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/events/commands";

import { EventsSettings } from "@vertix.gg/dashboard/src/features/events/components/events-settings";
import { EventsHistory } from "@vertix.gg/dashboard/src/features/events/components/events-history";
import { EventRunDetails } from "@vertix.gg/dashboard/src/features/events/components/event-run-details";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands";

interface EventsContentProps {
    guildId: string;
}

interface EventsContentSelectedState {
    isLoading: boolean;
    loadFailed: boolean;
    isLoaded: boolean;
    error: string | null;
    reasons: string[];
}

function selectContent( state: EventsState ): EventsContentSelectedState {
    return {
        isLoading: state.isLoading,
        loadFailed: state.loadFailed,
        isLoaded: null !== state.settings,
        error: state.error,
        reasons: state.reasons
    };
}

const EventsContentComponent: DCommandFunctionComponent<EventsContentProps, EventsState> = ( {
    guildId
} ) => {
    const [ state ] = useCommandState<EventsState, EventsContentSelectedState>( "Dashboard/Events", selectContent );

    const loadEvents = useCommand( "Dashboard/Events/Load" );
    const clearError = useCommand( "Dashboard/Events/ClearError" );

    useEffect( () => {
        loadEvents.run( { guildId } );
    }, [ guildId ] );

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Events</h1>
                <p className="text-sm text-text-muted mb-0">
                    A check-in board before each scheduled voice event, the members who said they would come and
                    did not, a post asking for subs, and the attendance. The same settings as /setup → Events in Discord.
                </p>
            </div>

            { state.error && (
                <div className="mx-6 mt-4 px-3 py-2 bg-error/10 border border-error/40 rounded-lg text-sm text-error">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{ state.error }</span>
                        <button
                            onClick={ () => clearError.run( {} ) }
                            className="text-error hover:text-text-primary transition-colors"
                            title="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    { state.reasons.length ? (
                        <ul className="mt-1 mb-0 pl-10 list-disc space-y-0.5">
                            { state.reasons.map( ( reason ) => <li key={ reason }>{ reason }</li> ) }
                        </ul>
                    ) : null }
                </div>
            ) }

            <div className="flex-1 overflow-y-auto p-6">
                { state.loadFailed ? (
                    <div className="max-w-md mx-auto py-16 text-center">
                        <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" />
                        <p className="text-sm text-text-muted mb-4">
                            Could not load Events for this server.
                        </p>
                        <button
                            onClick={ () => loadEvents.run( { guildId } ) }
                            className="inline-flex items-center gap-2 bg-surface-elevated hover:bg-surface-hover border
                                border-border hover:border-border-accent text-text-accent text-sm rounded-md px-4 py-2
                                transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try again
                        </button>
                    </div>
                ) : state.isLoading || ! state.isLoaded ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-6xl grid gap-6 items-start lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
                        <EventsSettings />
                        <EventsHistory />
                    </div>
                ) }
            </div>

            <EventRunDetails />
        </div>
    );
};

const EventsContent = withCommands<EventsContentProps, EventsState>(
    "Dashboard/Events",
    EventsContentComponent,
    EVENTS_INITIAL_STATE,
    [ ...EVENTS_COMMANDS ]
);

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

/**
 * Where a server sets up Events and reads the attendance of every event it ran.
 *
 * Only ever for the server that is open: the settings are that server's, and so is the history.
 */
export function EventsPage() {
    const [ authState ] = useCommandState<AuthState, AuthSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AuthSelectedState => ( {
            selectedGuild: state.selectedGuild
        } )
    );

    if ( ! authState.selectedGuild ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No server selected
            </div>
        );
    }

    // The customization guild is not a real server - it has no events to run.
    if ( authState.selectedGuild.id === DEFAULT_CUSTOMIZATION_GUILD_ID ) {
        return <Navigate to="/interface-editor" replace />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <EventsContent guildId={ authState.selectedGuild.id } />
        </div>
    );
}

export default EventsPage;
