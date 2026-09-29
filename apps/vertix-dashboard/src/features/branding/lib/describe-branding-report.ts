import {
    GUILD_BRANDING_APPLY_COOLDOWN_MAX,
    GUILD_BRANDING_APPLY_COOLDOWN_WINDOW_MS,
    GUILD_BRANDING_APPLY_OUTCOMES,
    GUILD_BRANDING_RECONCILE_INTERVAL_MS
} from "@vertix.gg/definitions/src/guild-branding-definitions";

import type {
    ApplyGuildBrandingResponse,
    BrandingReport,
    TBrandingAction
} from "@vertix.gg/dashboard/src/features/branding/types";

export type TBrandingNoticeTone = "success" | "info" | "warning" | "error";

export interface BrandingNotice {
    tone: TBrandingNoticeTone;
    text: string;
}

const MILLISECONDS_PER_MINUTE = 60 * 1000;

/** How often the bot looks over every profile by itself, and so the longest a stored save waits. */
const SWEEP_MINUTES = GUILD_BRANDING_RECONCILE_INTERVAL_MS / MILLISECONDS_PER_MINUTE;

const COOLDOWN_WINDOW_MINUTES = GUILD_BRANDING_APPLY_COOLDOWN_WINDOW_MS / MILLISECONDS_PER_MINUTE;

function formatMinutes( minutes: number ): string {
    return 1 === minutes ? "1 minute" : `${ minutes } minutes`;
}

/**
 * Function describeOutcome() :: What the bot said about a write, in words.
 *
 * A removal is worded apart from a save: "not on Pro" is a refusal for a save, and for a removal it
 * is simply done - a server off Pro wears the bot's own profile, which is what removing asks for.
 */
function describeOutcome( action: TBrandingAction, apply: ApplyGuildBrandingResponse ): BrandingNotice {
    const done = "remove" === action ? "Removed" : "Saved";

    switch ( apply.outcome ) {
        case GUILD_BRANDING_APPLY_OUTCOMES.APPLIED:
            return {
                tone: "success",
                text: "remove" === action
                    ? "Removed. The bot is back to its own profile in this server."
                    : "Applied. This is how the bot looks in your server now."
            };

        case GUILD_BRANDING_APPLY_OUTCOMES.PENDING:
            return { tone: "info", text: `${ done }. Sent to Discord, it may take a moment.` };

        case GUILD_BRANDING_APPLY_OUTCOMES.COOLDOWN: {
            const minutes = Math.max( 1, Math.ceil( ( apply.retryAfterMs ?? 0 ) / MILLISECONDS_PER_MINUTE ) );

            return {
                tone: "warning",
                text: `${ done }, but the bot's profile here can only change ${ GUILD_BRANDING_APPLY_COOLDOWN_MAX } `
                    + `times in ${ formatMinutes( COOLDOWN_WINDOW_MINUTES ) }. Save again in about `
                    + `${ formatMinutes( minutes ) }, or leave it - the bot catches up by itself within `
                    + `${ formatMinutes( minutes + SWEEP_MINUTES ) }.`
            };
        }

        case GUILD_BRANDING_APPLY_OUTCOMES.INVALID_IMAGE:
            return {
                tone: "error",
                text: `${ done }, but the bot could not use one of the saved images. Pick it again and save.`
            };

        case GUILD_BRANDING_APPLY_OUTCOMES.DISCORD_REFUSED:
            return {
                tone: "error",
                text: apply.message
                    ? `${ done }, but Discord refused the change: ${ apply.message }`
                    : `${ done }, but Discord refused the change.`
            };

        case GUILD_BRANDING_APPLY_OUTCOMES.NOT_ENTITLED:
            return "remove" === action
                ? { tone: "success", text: "Removed. The bot wears its own profile in this server." }
                : { tone: "warning", text: "Saved, but this server is not on Pro, so the bot keeps its own profile here." };

        case GUILD_BRANDING_APPLY_OUTCOMES.GUILD_NOT_AVAILABLE:
            return {
                tone: "warning",
                text: `${ done }, but the bot could not reach this server just now. It catches up by itself once it can.`
            };

        case GUILD_BRANDING_APPLY_OUTCOMES.FAILED:
            return {
                tone: "warning",
                text: `${ done }, but something went wrong on our side while applying it. The bot tries again `
                    + `by itself within ${ formatMinutes( SWEEP_MINUTES ) }.`
            };
    }
}

/**
 * Function describeBrandingReport() :: What the last save or removal came to, as the screen says it.
 *
 * Null from the bot is not a failure: the profile is stored, and the bot's own sweep puts it on.
 */
export function describeBrandingReport( report: BrandingReport ): BrandingNotice[] {
    const { action, apply } = report;

    if ( ! apply ) {
        return [ {
            tone: "info",
            text: "remove" === action
                ? `Removed - the bot goes back to its own profile within ${ formatMinutes( SWEEP_MINUTES ) }.`
                : `Saved - the bot will apply it within ${ formatMinutes( SWEEP_MINUTES ) }.`
        } ];
    }

    const notices = [ describeOutcome( action, apply ) ];

    if ( apply.skippedNick ) {
        notices.push( {
            tone: "warning",
            text: "The name was left as it was: the bot needs the Change Nickname permission in this server to change it."
        } );
    }

    return notices;
}
