import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GUILD_BRANDING_RECONCILE_INTERVAL_MS } from "@vertix.gg/definitions/src/guild-branding-definitions";

import { BrandingQuery } from "@vertix.gg/dashboard/src/features/branding/query/branding-query";

import {
    buildBrandingPatch,
    readBrandingDraft,
    readBrandingView,
    splitBrandingPatch
} from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";

import { QueryRequestError } from "@vertix.gg/dashboard/src/lib/query-request-error";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands/base";
import type { GuildBranding, GuildBrandingSaveResult } from "@vertix.gg/dashboard/src/features/branding/types";

const MILLISECONDS_PER_MINUTE = 60 * 1000;

/**
 * Command `Dashboard/Branding/Save` :: Saves what the form changed and asks the bot to wear it.
 *
 * Sent as one request, or as two when both images changed - see `splitBrandingPatch()`. Every
 * request but the last saves without applying, and the last applies everything saved by then.
 *
 * When the first of two lands and the second does not, the first half stays saved. The saved state
 * moves on to what it stored while the form keeps the banner as a change still to make, so saving
 * again sends the banner alone.
 */
export class SaveBrandingCommand extends CommandBase<BrandingState> {
    public static getName(): string {
        return "Dashboard/Branding/Save";
    }

    public async apply() {
        const { guildId, branding, pendingAction, preparingImage } = this.state;

        if ( ! guildId || ! branding || null !== pendingAction || null !== preparingImage ) {
            return;
        }

        const writes = splitBrandingPatch( buildBrandingPatch( branding.profile, this.state ) ),
            last = writes[ writes.length - 1 ];

        if ( ! Object.keys( last ).length ) {
            return;
        }

        this.setState( {
            pendingAction: "save",
            showRemoveConfirm: false,
            report: null,
            error: null,
            reasons: []
        } );

        const queryModule = getQueryModule( BrandingQuery );

        let stored: GuildBranding | null = null;

        try {
            for ( const write of writes.slice( 0, -1 ) ) {
                stored = readBrandingView( await queryModule.request<GuildBrandingSaveResult>(
                    "Dashboard/Branding/SaveWithoutApply",
                    { guildId, ... write }
                ) );
            }

            const result = await queryModule.request<GuildBrandingSaveResult>( "Dashboard/Branding/Save", {
                guildId,
                ... last
            } );

            return this.setState( {
                ... readBrandingDraft( result.profile ),
                branding: readBrandingView( result ),
                report: { action: "save", apply: result.apply },
                pendingAction: null
            } );
        } catch( error ) {
            const reason = error instanceof Error ? error.message : "Failed to save the branding";

            return this.setState( {
                branding: stored ?? branding,
                error: stored
                    ? "Everything but the banner was saved, and the bot puts it on within "
                        + `${ GUILD_BRANDING_RECONCILE_INTERVAL_MS / MILLISECONDS_PER_MINUTE } minutes. `
                        + `The banner was refused: ${ reason }`
                    : reason,
                reasons: error instanceof QueryRequestError ? error.reasons : [],
                pendingAction: null
            } );
        }
    }
}
