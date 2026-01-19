import { Navigate } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

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

    if ( !state.isAuthenticated ) {
        return <Navigate to="/login" replace />;
    }

    if ( requireGuild && !state.selectedGuild ) {
        return <Navigate to="/select-server" replace />;
    }

    return <>{ children }</>;
}
