import { CheckCircle2, AlertTriangle, CalendarDays, Clock } from "lucide-react";

import { formatDate, formatRelative } from "@vertix.gg/dashboard/src/features/dashboard/lib/format";

import type { GuildStats } from "@vertix.gg/dashboard/src/features/dashboard/types";

interface GuildHeaderProps {
    stats: GuildStats;
}

/**
 * Who this dashboard is about, and whether the bot is still in a position to act on it.
 *
 * The stats endpoint already answers all of this - the page simply never asked.
 */
export function GuildHeader( { stats }: GuildHeaderProps ) {
    const since = formatDate( stats.createdAt );
    const lastActive = formatRelative( stats.lastActiveAt );

    return (
        <div className="bg-surface border border-border rounded-lg p-5 mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-accent mb-1">{ stats.name }</h1>
                    <p className="text-text-muted text-sm mb-0">
                        Everything Vertix runs in this server, at a glance.
                    </p>
                </div>

                { stats.isInGuild ? (
                    <span className="flex items-center gap-2 text-sm text-success bg-surface-elevated
                        border border-border rounded-full px-3 py-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Bot connected
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-sm text-warning bg-surface-elevated
                        border border-border rounded-full px-3 py-1">
                        <AlertTriangle className="w-4 h-4" />
                        Bot is not in this server
                    </span>
                ) }
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm text-text-secondary">
                <span className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-accent-muted" />
                    Set up { since ?? "at an unknown date" }
                </span>
                <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-muted" />
                    Last channel activity { lastActive ?? "never" }
                </span>
            </div>
        </div>
    );
}
