import { Link } from "react-router-dom";

import { Radio, Plus, ArrowRight } from "lucide-react";

import { DISCORD_CATEGORY_CHANNELS_LIMIT } from "@vertix.gg/definitions/src/discord-limits-definitions";

import { formatDate, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { MasterChannelInfo } from "@vertix.gg/dashboard/src/features/home/types";

interface GeneratorsPanelProps {
    masterChannels: MasterChannelInfo[];
}

/**
 * How full a category has to be before its bar stops reading as ordinary - crowded is still
 * something a reader can act on, full is where Discord starts refusing the next channel.
 */
const CATEGORY_FILL_THRESHOLDS = {
    CROWDED_PERCENT: 80,
    FULL_PERCENT: 100
} as const;

function EmptyState() {
    return (
        <div className="bg-surface border border-border border-dashed rounded-lg p-8 text-center">
            <Radio className="w-8 h-8 text-accent-muted mx-auto mb-3" />
            <h3 className="text-text-accent font-semibold mb-1">No generators yet</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto mb-4">
                A generator is the voice channel members join to get a channel of their own. Create
                one here, or run <code className="text-text-secondary">/setup</code> in Discord.
            </p>
            <Link
                to="/generators"
                className="inline-flex items-center gap-2 bg-surface-elevated hover:bg-surface-hover
                    border border-border hover:border-border-accent text-text-accent text-sm
                    rounded-md px-4 py-2 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Create a generator
            </Link>
        </div>
    );
}

/**
 * Function getCategoryFillColorClassName() :: The bar's colour for how full the category is.
 *
 * A full category is the moment members stop getting channels, so it is worth reading as an error
 * rather than as a shade of the usual accent.
 */
function getCategoryFillColorClassName( fillPercent: number ): string {
    if ( fillPercent >= CATEGORY_FILL_THRESHOLDS.FULL_PERCENT ) {
        return "bg-error";
    }

    if ( fillPercent >= CATEGORY_FILL_THRESHOLDS.CROWDED_PERCENT ) {
        return "bg-warning";
    }

    return "bg-accent-muted";
}

/**
 * Function readCategoryOccupancy() :: The category's channel count, or null when there is none to read.
 *
 * The count arrives over HTTP from an API that may be older than this build, so anything that is
 * not a number reads as "not reported" rather than being paraded as one.
 */
function readCategoryOccupancy( master: MasterChannelInfo ): number | null {
    return "number" === typeof master.categoryChannelsCount ? master.categoryChannelsCount : null;
}

/**
 * Function describeCategoryFill() :: The generator's category in words - what it holds of what it may.
 *
 * Returns null when there is nothing truthful to say, so the caller leaves the line out rather than
 * printing a count it had to invent.
 */
function describeCategoryFill( master: MasterChannelInfo, occupancy: number | null ): string | null {
    if ( null === occupancy ) {
        return master.categoryId ? "Category occupancy unavailable" : null;
    }

    return `${ occupancy } of ${ DISCORD_CATEGORY_CHANNELS_LIMIT } channels in ` +
        `this category (${ master.dynamicChannelsCount } live)`;
}

/**
 * The generators of the guild, each with the channels standing under it right now.
 *
 * Ordered by how busy they are, since the question a reader brings here is which generator the
 * server actually lives in - the quiet ones are the candidates for retiring.
 *
 * The bar measures the generator's category against Discord's limit of
 * DISCORD_CATEGORY_CHANNELS_LIMIT channels, counting everything in there rather than only the
 * channels we made: that is the number members run into when a category stops handing out channels.
 *
 * Its track stays drawn even when that count never arrived - an empty track next to the words
 * saying so reads as "nothing to report", where a missing one reads as a broken panel.
 */
export function GeneratorsPanel( { masterChannels }: GeneratorsPanelProps ) {
    if ( ! masterChannels.length ) {
        return <EmptyState />;
    }

    const ordered = [ ...masterChannels ].sort( ( a, b ) => b.dynamicChannelsCount - a.dynamicChannelsCount );

    return (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border-muted">
            { ordered.map( ( master ) => {
                const created = formatDate( master.createdAt );

                const occupancy = readCategoryOccupancy( master );
                const fill = describeCategoryFill( master, occupancy );

                const fillPercent = null === occupancy
                    ? null
                    : formatShare( occupancy, DISCORD_CATEGORY_CHANNELS_LIMIT );

                return (
                    <div key={ master.channelId } className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <Radio className="w-4 h-4 text-accent-muted shrink-0" />
                                <span className="text-text-primary font-medium truncate">
                                    { master.channelId }
                                </span>
                            </div>

                            <span className="text-sm text-text-secondary shrink-0">
                                { master.dynamicChannelsCount } live
                                { master.dynamicChannelsCount === 1 ? " channel" : " channels" }
                            </span>
                        </div>

                        <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden mb-2">
                            { null !== fillPercent && (
                                <div
                                    className={ `h-full rounded-full ${ getCategoryFillColorClassName( fillPercent ) }` }
                                    style={ { width: `${ Math.min( fillPercent, CATEGORY_FILL_THRESHOLDS.FULL_PERCENT ) }%` } }
                                />
                            ) }
                        </div>

                        <div className="flex flex-wrap gap-x-4 text-xs text-text-muted">
                            <span>Created { created ?? "at an unknown date" }</span>
                            <span>{ master.categoryId ? `Category ${ master.categoryId }` : "No category" }</span>
                            { fill && <span>{ fill }</span> }
                        </div>
                    </div>
                );
            } ) }

            <div className="p-3 text-right">
                <Link
                    to="/generators"
                    className="inline-flex items-center gap-1 text-sm text-text-accent hover:text-accent-hover
                        transition-colors"
                >
                    Manage generators
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
