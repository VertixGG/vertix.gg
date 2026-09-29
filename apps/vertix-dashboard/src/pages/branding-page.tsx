import { useEffect } from "react";

import { Navigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";

import { Loader2, AlertTriangle, RefreshCw, X } from "lucide-react";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import {
    BRANDING_COMMANDS,
    BRANDING_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/branding/commands";

import { BrandingForm } from "@vertix.gg/dashboard/src/features/branding/components/branding-form";
import { BrandingLiveState } from "@vertix.gg/dashboard/src/features/branding/components/branding-live-state";
import { BrandingNotices } from "@vertix.gg/dashboard/src/features/branding/components/branding-notices";
import { BrandingPreview } from "@vertix.gg/dashboard/src/features/branding/components/branding-preview";
import { BrandingRemoveSection } from "@vertix.gg/dashboard/src/features/branding/components/branding-remove-section";
import { BRANDING_BOT_IDENTITY } from "@vertix.gg/dashboard/src/features/branding/lib/constants";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands";

interface BrandingContentProps {
    guildId: string;
}

interface BrandingContentSelectedState {
    isLoading: boolean;
    loadFailed: boolean;
    isLoaded: boolean;
    error: string | null;
    reasons: string[];
}

function selectContent( state: BrandingState ): BrandingContentSelectedState {
    return {
        isLoading: state.isLoading,
        loadFailed: state.loadFailed,
        isLoaded: null !== state.branding,
        error: state.error,
        reasons: state.reasons
    };
}

const BrandingContentComponent: DCommandFunctionComponent<BrandingContentProps, BrandingState> = ( {
    guildId
} ) => {
    const [ state ] = useCommandState<BrandingState, BrandingContentSelectedState>( "Dashboard/Branding", selectContent );

    const loadBranding = useCommand( "Dashboard/Branding/Load" );
    const clearError = useCommand( "Dashboard/Branding/ClearError" );

    useEffect( () => {
        loadBranding.run( { guildId } );
    }, [ guildId ] );

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Branding</h1>
                <p className="text-sm text-text-muted mb-0">
                    Changes only how the bot looks in this server. Every other server keeps the
                    normal { BRANDING_BOT_IDENTITY.NAME } bot.
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
                            Could not load the branding for this server.
                        </p>
                        <button
                            onClick={ () => loadBranding.run( { guildId } ) }
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
                    <div className="max-w-6xl grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-5 min-w-0">
                            <BrandingNotices />
                            <BrandingForm />
                            <BrandingRemoveSection />
                        </div>

                        <aside className="space-y-2 lg:sticky lg:top-0">
                            <div className="text-xs uppercase tracking-wide text-text-muted">Preview</div>
                            <BrandingLiveState />
                            <BrandingPreview />
                        </aside>
                    </div>
                ) }
            </div>
        </div>
    );
};

const BrandingContent = withCommands<BrandingContentProps, BrandingState>(
    "Dashboard/Branding",
    BrandingContentComponent,
    BRANDING_INITIAL_STATE,
    [ ...BRANDING_COMMANDS ]
);

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

/**
 * Where a server gives the bot its own name, avatar, banner and bio.
 *
 * Only ever for the server that is open: discord scopes the profile to one server, and so does the
 * plan that pays for it.
 */
export function BrandingPage() {
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

    if ( authState.selectedGuild.id === DEFAULT_CUSTOMIZATION_GUILD_ID ) {
        return <Navigate to="/interface-editor" replace />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <BrandingContent guildId={ authState.selectedGuild.id } />
        </div>
    );
}

export default BrandingPage;
