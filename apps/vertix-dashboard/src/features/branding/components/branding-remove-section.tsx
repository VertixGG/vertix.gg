import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

import { hasBrandingProfile } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands";
import type { TBrandingAction } from "@vertix.gg/dashboard/src/features/branding/types";

interface BrandingRemoveSectionSelectedState {
    hasSavedProfile: boolean;
    showRemoveConfirm: boolean;
    pendingAction: TBrandingAction | null;
}

function selectRemoveSection( state: BrandingState ): BrandingRemoveSectionSelectedState {
    return {
        hasSavedProfile: null !== state.branding && hasBrandingProfile( state.branding.profile ),
        showRemoveConfirm: state.showRemoveConfirm,
        pendingAction: state.pendingAction
    };
}

/**
 * Taking the profile away again, behind a second press.
 *
 * Offered whether or not the server is on Pro: a server whose plan ended can still clear what it
 * saved. Only drawn when something is saved, since removing nothing has nothing to confirm.
 */
export function BrandingRemoveSection() {
    const [ state ] = useCommandState<BrandingState, BrandingRemoveSectionSelectedState>(
        "Dashboard/Branding",
        selectRemoveSection
    );

    const showRemoveConfirm = useCommand( "Dashboard/Branding/ShowRemoveConfirm" );
    const hideRemoveConfirm = useCommand( "Dashboard/Branding/HideRemoveConfirm" );
    const removeBranding = useCommand( "Dashboard/Branding/Remove" );

    if ( ! state.hasSavedProfile && "remove" !== state.pendingAction ) {
        return null;
    }

    const isBusy = null !== state.pendingAction;

    return (
        <section className="border border-error/30 rounded-lg px-4 py-3">
            { state.showRemoveConfirm ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                        <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                        <p className="text-sm text-text-secondary mb-0">
                            This deletes the saved name, avatar, banner and bio, and the bot goes back to its
                            own profile in this server.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <DiscordButton
                            variant="danger"
                            size="sm"
                            onClick={ () => removeBranding.run( {} ) }
                            disabled={ isBusy }
                        >
                            Remove branding
                        </DiscordButton>
                        <DiscordButton
                            size="sm"
                            onClick={ () => hideRemoveConfirm.run( {} ) }
                            disabled={ isBusy }
                        >
                            Cancel
                        </DiscordButton>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-text-muted">
                        Removing clears the saved profile and gives the bot its own back in this server.
                    </span>
                    <DiscordButton
                        variant="danger"
                        size="sm"
                        className="shrink-0"
                        onClick={ () => showRemoveConfirm.run( {} ) }
                        disabled={ isBusy }
                        icon={ "remove" === state.pendingAction
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" /> }
                    >
                        { "remove" === state.pendingAction ? "Removing..." : "Remove branding" }
                    </DiscordButton>
                </div>
            ) }
        </section>
    );
}

export default BrandingRemoveSection;
