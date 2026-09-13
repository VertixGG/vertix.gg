import * as React from "react";

import "@vertix.gg/discord-ui/src/styles/discord-date-divider.css";

/** How Discord writes the day on a divider. */
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };

export interface DiscordDateDividerProps {
    /**
     * The day, worded the way Discord words it - "September 13, 2026".
     *
     * Left out, it is today: a demonstration is a channel being read now, and every message in one
     * is stamped "Today at", so a date that stayed where it was written would disagree with them.
     */
    date?: string;
}

/**
 * Function DiscordDateDivider() :: The day a run of messages belongs to.
 *
 * A rule across the channel with the date sitting on it, punched out of the line by a scrap of the
 * chat's own background rather than by a gap - so the line meets the text on both sides however
 * long the date is.
 */
export const DiscordDateDivider: React.FC<DiscordDateDividerProps> = ( { date } ) => (
    <div className="discord-date-divider">
        <span className="discord-date-divider-label">
            { date ?? new Date().toLocaleDateString( "en-US", DATE_FORMAT ) }
        </span>
    </div>
);

export default DiscordDateDivider;
