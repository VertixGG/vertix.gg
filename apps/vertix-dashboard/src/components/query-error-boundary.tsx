import { Component } from "react";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

import type { ErrorInfo, ReactNode } from "react";

export interface QueryErrorBoundaryProps {
    /** What could not be loaded, named the way the screen names it. */
    title: string;
    /** What the reader can do about it, when there is something. */
    hint?: ReactNode;
    children: ReactNode;
}

interface QueryErrorBoundaryState {
    error: Error | null;
}

/**
 * A screen whose data would not load, saying so.
 *
 * `QueryComponent` reads its resource through suspense, so a request that rejects throws during
 * render rather than arriving as a value a component could check. With nothing catching it the
 * whole tree unmounts - the dashboard has no boundary of its own, so a failing query took the page
 * to a blank white screen with only the console to say why.
 *
 * A class because `componentDidCatch` has no hook equivalent; there is no other reason for one here.
 */
export class QueryErrorBoundary extends Component<QueryErrorBoundaryProps, QueryErrorBoundaryState> {
    public constructor( props: QueryErrorBoundaryProps ) {
        super( props );

        this.state = { error: null };
    }

    public static getDerivedStateFromError( error: Error ): QueryErrorBoundaryState {
        return { error };
    }

    public componentDidCatch( error: Error, info: ErrorInfo ) {
        // Kept in the console as well as on screen: the message below is what a reader can act on,
        // and the stack is what whoever they ask will want.
        console.error( "Query failed to load", error, info.componentStack );
    }

    public render() {
        if ( ! this.state.error ) {
            return this.props.children;
        }

        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md text-center space-y-3">
                    <AlertTriangle className="w-8 h-8 mx-auto text-text-muted" />

                    <h2 className="text-base font-semibold text-text-primary mb-0">{ this.props.title }</h2>

                    { this.props.hint ? (
                        <p className="text-sm text-text-muted mb-0">{ this.props.hint }</p>
                    ) : null }

                    <p className="text-xs text-text-muted font-mono break-words mb-0">
                        { this.state.error.message }
                    </p>

                    { /* The button is inline-flex, which `text-center` does not reach - it centres
                         text in a line box and the button is not one. */ }
                    <div className="flex justify-center">
                        <DiscordButton
                            variant="primary"
                            onClick={ () => window.location.reload() }
                            icon={ <RefreshCw className="w-4 h-4" /> }
                        >
                            Try again
                        </DiscordButton>
                    </div>
                </div>
            </div>
        );
    }
}
