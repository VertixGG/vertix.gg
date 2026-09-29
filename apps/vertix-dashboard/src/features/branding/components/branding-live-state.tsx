import { useCommandState } from "@zenflux/react-commander/hooks";

import { hasBrandingProfile } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands";
import type { GuildBranding } from "@vertix.gg/dashboard/src/features/branding/types";

function selectBranding( state: BrandingState ): { branding: GuildBranding | null } {
    return { branding: state.branding };
}

function formatDateTime( iso: string ): string {
    return new Date( iso ).toLocaleString( undefined, { dateStyle: "medium", timeStyle: "short" } );
}

/**
 * Function BrandingLiveState() :: Whether what is saved is what the bot is wearing.
 *
 * The preview draws the form, which is not necessarily what members see yet - a save can be waiting
 * on discord or on the cooldown. This says which, going by the revision the bot last applied.
 *
 * Silent where the notices above the form already explain: no plan, no bot, no answer - and nothing
 * saved at all, which is the bot's own profile and needs no comment.
 */
export function BrandingLiveState() {
    const [ { branding } ] = useCommandState<BrandingState, { branding: GuildBranding | null }>(
        "Dashboard/Branding",
        selectBranding
    );

    const status = branding?.status;

    if ( ! branding || ! status?.canBrand || ! status.isBotInGuild || ! hasBrandingProfile( branding.profile ) ) {
        return null;
    }

    const isLive = branding.revision === status.appliedRevision && null !== status.appliedAt;

    return (
        <p className="flex items-center gap-2 text-xs text-text-muted mb-0">
            <span className={ `w-2 h-2 rounded-full shrink-0 ${ isLive ? "bg-success" : "bg-warning" }` } />
            { isLive && status.appliedAt
                ? `Live in this server since ${ formatDateTime( status.appliedAt ) }`
                : "Saved, not on the bot yet" }
        </p>
    );
}

export default BrandingLiveState;
