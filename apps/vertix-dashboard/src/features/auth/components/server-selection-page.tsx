import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";

import { Server, Loader2 } from "lucide-react";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { Guild } from "@vertix.gg/dashboard/src/features/auth/types";

interface ServerSelectionSelectedState {
    guilds: AuthState[ "guilds" ];
    isLoadingGuilds: AuthState[ "isLoadingGuilds" ];
    selectedGuild: AuthState[ "selectedGuild" ];
    error: AuthState[ "error" ];
}

export function ServerSelectionPage() {
    const navigate = useNavigate();

    const [ state ] = useCommandState<AuthState, ServerSelectionSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): ServerSelectionSelectedState => ( {
            guilds: state.guilds,
            isLoadingGuilds: state.isLoadingGuilds,
            selectedGuild: state.selectedGuild,
            error: state.error
        } )
    );

    const fetchGuilds = useCommand( "Dashboard/Auth/FetchGuilds" );
    const selectGuild = useCommand( "Dashboard/Auth/SelectGuild" );

    useEffect( () => {
        fetchGuilds.run( {} );
    }, [] );

    useEffect( () => {
        if ( state.selectedGuild ) {
            navigate( "/" );
        }
    }, [ state.selectedGuild, navigate ] );

    const handleSelectGuild = async ( guild: Guild ) => {
        await selectGuild.run( { guild } );
    };

    if ( state.isLoadingGuilds ) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-3 text-text-accent">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading servers...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-text-accent mb-2">
                        Select a Server
                    </h1>
                    <p className="text-text-secondary">
                        Choose which Discord server you want to manage
                    </p>
                </div>

                { state.error && (
                    <div className="mb-6 p-4 bg-error/20 border border-error/50 rounded-lg">
                        <p className="text-error text-sm text-center">{ state.error }</p>
                    </div>
                ) }

                <div className="grid gap-3">
                    { state.guilds.length === 0 ? (
                        <div className="text-center py-8 text-text-muted">
                            No servers found. You must be the owner of at least one Discord server.
                        </div>
                    ) : (
                        state.guilds.map( ( guild ) => (
                            <button
                                key={ guild.id }
                                onClick={ () => handleSelectGuild( guild ) }
                                className="flex items-center gap-4 p-4 bg-surface hover:bg-surface-elevated border border-border hover:border-border-accent rounded-lg transition-colors text-left"
                            >
                                { guild.icon ? (
                                    <img
                                        src={ guild.icon }
                                        alt={ guild.name }
                                        className="w-12 h-12 rounded-full ring-2 ring-border"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center ring-2 ring-border">
                                        <Server className="w-6 h-6 text-accent-muted" />
                                    </div>
                                ) }
                                <div className="flex-1 min-w-0">
                                    <div className="text-text-primary font-medium truncate">
                                        { guild.name }
                                    </div>
                                </div>
                            </button>
                        ) )
                    ) }
                </div>
            </div>
        </div>
    );
}
