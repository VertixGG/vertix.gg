import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { BrandingQuery } from "@vertix.gg/dashboard/src/features/branding/query/branding-query";

import { readBrandingDraft, readBrandingView } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands/base";
import type { GuildBrandingSaveResult } from "@vertix.gg/dashboard/src/features/branding/types";

export class ShowRemoveConfirmCommand extends CommandBase<BrandingState> {
    public static getName(): string {
        return "Dashboard/Branding/ShowRemoveConfirm";
    }

    public apply() {
        return this.setState( { showRemoveConfirm: true } );
    }
}

export class HideRemoveConfirmCommand extends CommandBase<BrandingState> {
    public static getName(): string {
        return "Dashboard/Branding/HideRemoveConfirm";
    }

    public apply() {
        return this.setState( { showRemoveConfirm: false } );
    }
}

/**
 * Command `Dashboard/Branding/Remove` :: Gives the bot its own profile back in this server.
 *
 * Allowed whether or not the server still pays - taking a profile off is never something to sell -
 * and it clears what is saved as well as what the bot wears, so the form empties with it.
 */
export class RemoveBrandingCommand extends CommandBase<BrandingState> {
    public static getName(): string {
        return "Dashboard/Branding/Remove";
    }

    public async apply() {
        const { guildId, pendingAction } = this.state;

        if ( ! guildId || null !== pendingAction ) {
            return;
        }

        this.setState( {
            pendingAction: "remove",
            showRemoveConfirm: false,
            imageError: null,
            report: null,
            error: null,
            reasons: []
        } );

        try {
            const result = await getQueryModule( BrandingQuery ).request<GuildBrandingSaveResult>( "Dashboard/Branding/Remove", {
                guildId
            } );

            return this.setState( {
                ... readBrandingDraft( result.profile ),
                branding: readBrandingView( result ),
                report: { action: "remove", apply: result.apply },
                pendingAction: null
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to remove the branding",
                pendingAction: null
            } );
        }
    }
}
