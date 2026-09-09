import { useEffect } from "react";

import { Navigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";

import { Loader2, AlertTriangle, X } from "lucide-react";

import {
    SERVER_CONFIG_COMMANDS,
    SERVER_CONFIG_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/server-config/commands";

import ServerConfigForm from "@vertix.gg/dashboard/src/features/server-config/components/server-config-form";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { ServerConfigState } from "@vertix.gg/dashboard/src/features/server-config/commands";

interface ServerConfigContentProps {
    guildId: string;
}

const ServerConfigContentComponent: DCommandFunctionComponent<ServerConfigContentProps, ServerConfigState> = ( {
    guildId
} ) => {
    const [ state ] = useCommandState<ServerConfigState, ServerConfigState>(
        "Dashboard/ServerConfig",
        ( state ) => ( {
            guildId: state.guildId,
            config: state.config,
            discordOptions: state.discordOptions,
            isLoading: state.isLoading,
            isSaving: state.isSaving,
            error: state.error
        } )
    );

    const loadServerConfig = useCommand( "Dashboard/ServerConfig/Load" );
    const clearError = useCommand( "Dashboard/ServerConfig/ClearError" );

    useEffect( () => {
        loadServerConfig.run( { guildId } );
    }, [ guildId ] );

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Server Options</h1>
                <p className="text-sm text-text-muted mb-0">
                    Settings that apply across the whole server
                </p>
            </div>

            { state.error && (
                <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2 bg-error/10 border border-error/40
                    rounded-lg text-sm text-error">
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
            ) }

            <div className="flex-1 overflow-y-auto p-6">
                { state.isLoading || !state.config ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-3xl">
                        <ServerConfigForm
                            config={ state.config }
                            discordOptions={ state.discordOptions }
                            guildId={ guildId }
                            isSaving={ state.isSaving }
                        />
                    </div>
                ) }
            </div>
        </div>
    );
};

const ServerConfigContent = withCommands<ServerConfigContentProps, ServerConfigState>(
    "Dashboard/ServerConfig",
    ServerConfigContentComponent,
    SERVER_CONFIG_INITIAL_STATE,
    [ ...SERVER_CONFIG_COMMANDS ]
);

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

export function ServerConfigPage() {
    const [ authState ] = useCommandState<AuthState, AuthSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AuthSelectedState => ( {
            selectedGuild: state.selectedGuild
        } )
    );

    if ( !authState.selectedGuild ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No guild selected
            </div>
        );
    }

    if ( authState.selectedGuild.id === "__default__" ) {
        return <Navigate to="/interface-editor" replace />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ServerConfigContent guildId={ authState.selectedGuild.id } />
        </div>
    );
}

export default ServerConfigPage;
