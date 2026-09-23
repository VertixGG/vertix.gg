import { Link } from "react-router-dom";

import { Radio, Plus, ArrowRight } from "lucide-react";

import { formatDate, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { MasterChannelInfo } from "@vertix.gg/dashboard/src/features/home/types";

interface GeneratorsPanelProps {
    masterChannels: MasterChannelInfo[];
    maxActiveDynamicChannels?: number | null;
}

/**
 * How full a generator has to be before its bar stops reading as ordinary - crowded is still
 * something a reader can act on, full is where the bot starts refusing the next channel.
 */
const GENERATOR_FILL_THRESHOLDS = {
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
 * Function getGeneratorFillColorClassName() :: The bar's colour for how full the generator is.
 *
 * A full generator is the moment members stop getting channels, so it is worth reading as an error
 * rather than as a shade of the usual accent.
 */
function getGeneratorFillColorClassName( fillPercent: number ): string {
    if ( fillPercent >= GENERATOR_FILL_THRESHOLDS.FULL_PERCENT ) {
        return "bg-error";
    }

    if ( fillPercent >= GENERATOR_FILL_THRESHOLDS.CROWDED_PERCENT ) {
        return "bg-warning";
    }

    return "bg-accent-muted";
}

/**
 * Function readGeneratorLimit() :: The per-generator limit, or null when there is none to read.
 *
 * The limit arrives over HTTP from an API that may be older than this build, so anything that is
 * not a number reads as "not reported" rather than being paraded as one.
 */
function readGeneratorLimit( maxActiveDynamicChannels?: number | null ): number | null {
    return "number" === typeof maxActiveDynamicChannels ? maxActiveDynamicChannels : null;
}

/**
 * Function describeGeneratorLimit() :: The limit in words, and that it is held per generator.
 *
 * Said as a limit on each generator rather than as a share, because the count beside the name
 * already says how many are open - what the reader cannot see anywhere else is that the ceiling
 * belongs to the generator, not to its category or to the server.
 */
function describeGeneratorLimit( limit: number | null ): string {
    if ( null === limit ) {
        return "Channel limit unavailable";
    }

    return `Limit: ${ limit } dynamic channels per generator`;
}

/**
 * Function describeCategory() :: The generator's category by name, with its id beside it.
 *
 * The id stays because a name is not unique - a server can have two categories called "Voice" - and
 * it is what an admin searches Discord for. Without a name, the stored id is all there is to show.
 */
function describeCategory( master: MasterChannelInfo ): string {
    if ( master.category ) {
        return `Category ${ master.category.name } (${ master.category.id })`;
    }

    return master.categoryId ? `Category ${ master.categoryId }` : "No category";
}

/**
 * The generators of the guild, each with the channels standing under it right now.
 *
 * Ordered by how busy they are, since the question a reader brings here is which generator the
 * server actually lives in - the quiet ones are the candidates for retiring.
 *
 * The bar measures each generator's live channels against how many one generator may have open at
 * once - the number the bot refuses the next member at. Counted per generator rather than per
 * category: a category also holds the generator itself and whatever else an admin put there, and
 * two generators sharing one would each read the other's channels as their own.
 *
 * Its track stays drawn even when that limit never arrived - an empty track next to the words
 * saying so reads as "nothing to report", where a missing one reads as a broken panel.
 */
export function GeneratorsPanel( { masterChannels, maxActiveDynamicChannels }: GeneratorsPanelProps ) {
    if ( ! masterChannels.length ) {
        return <EmptyState />;
    }

    const ordered = [ ...masterChannels ].sort( ( a, b ) => b.dynamicChannelsCount - a.dynamicChannelsCount );

    const limit = readGeneratorLimit( maxActiveDynamicChannels );
    const limitDescription = describeGeneratorLimit( limit );

    return (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border-muted">
            { ordered.map( ( master ) => {
                const created = formatDate( master.createdAt );

                const fillPercent = null === limit
                    ? null
                    : formatShare( master.dynamicChannelsCount, limit );

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
                                    className={ `h-full rounded-full ${ getGeneratorFillColorClassName( fillPercent ) }` }
                                    style={ { width: `${ Math.min( fillPercent, GENERATOR_FILL_THRESHOLDS.FULL_PERCENT ) }%` } }
                                />
                            ) }
                        </div>

                        <div className="flex flex-wrap gap-x-4 text-xs text-text-muted">
                            <span>Created { created ?? "at an unknown date" }</span>
                            <span>{ describeCategory( master ) }</span>
                            <span>{ limitDescription }</span>
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
