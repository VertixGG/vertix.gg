import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import {
    CheckAuthCommand,
    FetchGuildsCommand,
    SelectGuildCommand,
    ClearSelectedGuildCommand,
    LogoutCommand,
    ClearAuthErrorCommand,
    AUTH_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";

interface AuthProviderProps {
    children: React.ReactNode;
}

interface AuthProviderSelectedState {
    isLoading: AuthState[ "isLoading" ];
}

const AuthProviderComponent: DCommandFunctionComponent<AuthProviderProps, AuthState> = ( { children } ) => {
    const [ state ] = useCommandState<AuthState, AuthProviderSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AuthProviderSelectedState => ( {
            isLoading: state.isLoading
        } )
    );

    const checkAuth = useCommand( "Dashboard/Auth/CheckAuth" );

    useEffect( () => {
        checkAuth.run( {} );
    }, [] );

    if ( state.isLoading ) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-zinc-400">Checking authentication...</div>
            </div>
        );
    }

    return <>{ children }</>;
};

export const AuthProvider = withCommands<AuthProviderProps, AuthState>(
    "Dashboard/Auth",
    AuthProviderComponent,
    AUTH_INITIAL_STATE,
    [ CheckAuthCommand, FetchGuildsCommand, SelectGuildCommand, ClearSelectedGuildCommand, LogoutCommand, ClearAuthErrorCommand ]
);
