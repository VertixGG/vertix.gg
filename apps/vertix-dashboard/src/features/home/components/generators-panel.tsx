import { Link } from "react-router-dom";

import { Radio, Plus, ArrowRight } from "lucide-react";

import { formatDate, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { MasterChannelInfo } from "@vertix.gg/dashboard/src/features/home/types";

interface GeneratorsPanelProps {
    masterChannels: MasterChannelInfo[];
}

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
 * The generators of the guild, each with the channels standing under it right now.
 *
 * Ordered by how busy they are, since the question a reader brings here is which generator the
 * server actually lives in - the quiet ones are the candidates for retiring.
 */
export function GeneratorsPanel( { masterChannels }: GeneratorsPanelProps ) {
    if ( ! masterChannels.length ) {
        return <EmptyState />;
    }

    const total = masterChannels.reduce( ( sum, master ) => sum + master.dynamicChannelsCount, 0 );

    const ordered = [ ...masterChannels ].sort( ( a, b ) => b.dynamicChannelsCount - a.dynamicChannelsCount );

    return (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border-muted">
            { ordered.map( ( master ) => {
                const share = formatShare( master.dynamicChannelsCount, total );
                const created = formatDate( master.createdAt );

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
                            <div
                                className="h-full bg-accent-muted rounded-full"
                                style={ { width: `${ share }%` } }
                            />
                        </div>

                        <div className="flex flex-wrap gap-x-4 text-xs text-text-muted">
                            <span>Created { created ?? "at an unknown date" }</span>
                            <span>{ master.categoryId ? `Category ${ master.categoryId }` : "No category" }</span>
                            <span>{ share }% of this server's live channels</span>
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
