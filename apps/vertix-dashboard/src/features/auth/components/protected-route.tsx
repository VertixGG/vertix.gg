import { Navigate, useLocation } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { toReturnPathState } from "@vertix.gg/dashboard/src/features/auth/lib/return-path";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

interface ProtectedRouteSelectedState {
    isAuthenticated: AuthState[ "isAuthenticated" ];
    isLoading: AuthState[ "isLoading" ];
    selectedGuild: AuthState[ "selectedGuild" ];
}

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireGuild?: boolean;
}

export function ProtectedRoute( { children, requireGuild = true }: ProtectedRouteProps ) {
    const location = useLocation();

    const [ state ] = useCommandState<AuthState, ProtectedRouteSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): ProtectedRouteSelectedState => ( {
            isAuthenticated: state.isAuthenticated,
            isLoading: state.isLoading,
            selectedGuild: state.selectedGuild
        } )
    );

    if ( state.isLoading ) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        );
    }

    // Both carry the page being turned away from, so signing in and picking a server end on it
    // rather than on the front page - see `return-path.ts`.
    if ( !state.isAuthenticated ) {
        return <Navigate to="/login" replace state={ toReturnPathState( location ) } />;
    }

    if ( requireGuild && !state.selectedGuild ) {
        return <Navigate to="/select-server" replace state={ toReturnPathState( location ) } />;
    }

    return <>{ children }</>;
}
