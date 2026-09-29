import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { BrandingQuery } from "@vertix.gg/dashboard/src/features/branding/query/branding-query";
import { readBrandingDraft } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands/base";
import type { GuildBranding } from "@vertix.gg/dashboard/src/features/branding/types";

/**
 * Command `Dashboard/Branding/Load` :: Reads a server's profile and fills the form from it.
 *
 * Also what "try again" runs, so it starts the page over: whatever the last visit reported belongs
 * to the profile as it was then.
 */
export class LoadBrandingCommand extends CommandBase<BrandingState, { guildId: string }> {
    public static getName(): string {
        return "Dashboard/Branding/Load";
    }

    public async apply( args: { guildId: string } ) {
        this.setState( {
            guildId: args.guildId,
            isLoading: true,
            loadFailed: false,
            imageError: null,
            showRemoveConfirm: false,
            report: null,
            error: null,
            reasons: []
        } );

        try {
            // A read that fails answers null rather than throwing - see `AuthenticatedQueryClient`.
            const branding = await getQueryModule( BrandingQuery ).request<GuildBranding | null>( "Dashboard/Branding", {
                guildId: args.guildId
            } );

            if ( ! branding?.profile ) {
                return this.setState( { branding: null, isLoading: false, loadFailed: true } );
            }

            return this.setState( {
                ... readBrandingDraft( branding.profile ),
                branding,
                isLoading: false
            } );
        } catch {
            return this.setState( { branding: null, isLoading: false, loadFailed: true } );
        }
    }
}
