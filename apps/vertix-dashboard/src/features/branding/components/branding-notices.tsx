import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { RefreshCw, X } from "lucide-react";

import { BrandingNoticeLine } from "@vertix.gg/dashboard/src/features/branding/components/branding-notice-line";
import { BrandingUpsell } from "@vertix.gg/dashboard/src/features/branding/components/branding-upsell";
import { hasBrandingProfile } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";
import { describeBrandingReport } from "@vertix.gg/dashboard/src/features/branding/lib/describe-branding-report";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands";
import type { BrandingReport, GuildBranding } from "@vertix.gg/dashboard/src/features/branding/types";

interface BrandingNoticesSelectedState {
    guildId: string | null;
    branding: GuildBranding | null;
    report: BrandingReport | null;
    isLoading: boolean;
}

function selectNotices( state: BrandingState ): BrandingNoticesSelectedState {
    return {
        guildId: state.guildId,
        branding: state.branding,
        report: state.report,
        isLoading: state.isLoading
    };
}

/**
 * Everything the page has to say before the form: what the last save came to, and anything about
 * the server or the bot that stands in the form's way.
 */
export function BrandingNotices() {
    const [ state ] = useCommandState<BrandingState, BrandingNoticesSelectedState>( "Dashboard/Branding", selectNotices );

    const loadBranding = useCommand( "Dashboard/Branding/Load" );
    const dismissReport = useCommand( "Dashboard/Branding/DismissReport" );

    if ( ! state.branding ) {
        return null;
    }

    const { status, profile } = state.branding;

    const reportNotices = state.report ? describeBrandingReport( state.report ) : [];

    const handleRetry = () => {
        if ( state.guildId ) {
            loadBranding.run( { guildId: state.guildId } );
        }
    };

    return (
        <div className="space-y-3 empty:hidden">
            { reportNotices.map( ( notice, index ) => (
                <BrandingNoticeLine
                    key={ notice.text }
                    tone={ notice.tone }
                    action={ 0 === index ? (
                        <button
                            onClick={ () => dismissReport.run( {} ) }
                            title="Dismiss"
                            className="shrink-0 transition-colors hover:text-text-primary"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : undefined }
                >
                    { notice.text }
                </BrandingNoticeLine>
            ) ) }

            { ! status ? (
                <BrandingNoticeLine
                    tone="warning"
                    action={
                        <button
                            onClick={ handleRetry }
                            disabled={ state.isLoading }
                            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium
                                transition-colors hover:text-text-primary disabled:opacity-60"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try again
                        </button>
                    }
                >
                    The bot could not be reached, so saving is off for now. Try again in a minute.
                </BrandingNoticeLine>
            ) : (
                <>
                    { ! status.canBrand ? <BrandingUpsell hasSavedProfile={ hasBrandingProfile( profile ) } /> : null }

                    { ! status.isBotInGuild ? (
                        <BrandingNoticeLine tone="warning">
                            The bot is not in this server right now, so there is nothing to put a profile on.
                            What is saved here goes on once it is back.
                        </BrandingNoticeLine>
                    ) : null }

                    { /* The last save's own report already says this when it was the refusal. */ }
                    { status.lastError && ! state.report ? (
                        <BrandingNoticeLine tone="error">
                            The last change could not be applied: { status.lastError }
                        </BrandingNoticeLine>
                    ) : null }

                    { /* Said again after a reload, when the save's own report is gone. */ }
                    { status.nickPending && ! state.report?.apply?.skippedNick ? (
                        <BrandingNoticeLine tone="warning">
                            The name is waiting: the bot needs the Change Nickname permission in this server.
                            It is set by itself once the bot has it.
                        </BrandingNoticeLine>
                    ) : null }
                </>
            ) }
        </div>
    );
}

export default BrandingNotices;
