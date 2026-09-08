import { Hash } from "lucide-react";

import type { ScalingChannelInfo } from "@vertix.gg/dashboard/src/features/generators/types";

interface ScalingChannelCardProps {
    channel: ScalingChannelInfo;
    index: number;
    maxMembers?: number;
}

export function ScalingChannelCard( { channel, index, maxMembers = 0 }: ScalingChannelCardProps ) {
    const memberCount = channel.discord?.memberCount ?? 0;
    const channelName = channel.discord?.name;
    const isUnlimited = maxMembers <= 0;
    const fillPercentage = isUnlimited ? 0 : Math.min( ( memberCount / maxMembers ) * 100, 100 );

    const getStatusColor = () => {
        if ( memberCount === 0 ) {
            return "bg-surface-hover";
        }

        if ( isUnlimited || memberCount < maxMembers ) {
            return "bg-success";
        }

        return "bg-warning";
    };

    const getStatusText = () => {
        if ( memberCount === 0 ) {
            return "Empty";
        }

        if ( isUnlimited ) {
            return `${ memberCount } members`;
        }

        if ( memberCount >= maxMembers ) {
            return "Full";
        }

        return `${ memberCount }/${ maxMembers }`;
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                        { channelName || `Channel #${ index + 1 }` }
                    </span>
                </div>
                <div className={ `px-2 py-0.5 rounded text-xs font-medium ${ getStatusColor() } text-text-primary` }>
                    { getStatusText() }
                </div>
            </div>

            <div className="text-xs text-text-muted mb-2 truncate" title={ channel.channelId }>
                ID: { channel.channelId }
            </div>

            { !isUnlimited && (
                <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                        className={ `h-full transition-all ${ memberCount >= maxMembers ? "bg-warning" : "bg-success" }` }
                        style={ { width: `${ fillPercentage }%` } }
                    />
                </div>
            ) }
        </div>
    );
}
