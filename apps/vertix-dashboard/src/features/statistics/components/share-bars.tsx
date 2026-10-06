import { formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { formatPartOf } from "@vertix.gg/dashboard/src/features/statistics/lib/format";

export interface IShareBar {
    label: string;
    count: number;
    /** What the bar is a share of. */
    total: number;
    /** A few words after the figures, when the share alone does not say enough. */
    detail?: string;
}

/**
 * Parts of a whole as bars, one under another - each saying its count and its share.
 */
export function ShareBars( { bars }: { bars: IShareBar[] } ) {
    return (
        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            { bars.map( ( bar ) => (
                <div key={ bar.label }>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm mb-1">
                        <span className="text-text-secondary">{ bar.label }</span>
                        <span className="text-text-primary tabular-nums">
                            { formatPartOf( bar.count, bar.total ) }
                            { bar.detail && <span className="text-xs text-text-muted"> · { bar.detail }</span> }
                        </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                        <div className="h-full rounded-full bg-accent" style={ { width: `${ formatShare( bar.count, bar.total ) }%` } } />
                    </div>
                </div>
            ) ) }
        </div>
    );
}

export default ShareBars;
