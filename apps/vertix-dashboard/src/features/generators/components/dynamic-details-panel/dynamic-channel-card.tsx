import { Hash, User } from "lucide-react";

import type { DynamicChannelInfo } from "@vertix.gg/dashboard/src/features/generators/types";

interface DynamicChannelCardProps {
    channel: DynamicChannelInfo;
}

export function DynamicChannelCard( { channel }: DynamicChannelCardProps ) {
    const memberCount = channel.discord?.memberCount ?? 0;
    const channelName = channel.discord?.name;

    const getStatusColor = () => {
        if ( memberCount === 0 ) {
            return "bg-surface-hover";
        }

        return "bg-accent/15";
    };

    const getStatusText = () => {
        if ( memberCount === 0 ) {
            return "Empty";
        }

        return `${ memberCount } member${ memberCount === 1 ? "" : "s" }`;
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                        { channelName || "Dynamic Channel" }
                    </span>
                </div>
                <div className={ `px-2 py-0.5 rounded text-xs font-medium ${ getStatusColor() } text-text-primary` }>
                    { getStatusText() }
                </div>
            </div>

            { channel.userOwnerId && (
                <div className="flex items-center gap-1 text-xs text-text-secondary mb-2">
                    <User className="w-3 h-3" />
                    <span className="truncate" title={ channel.userOwnerId }>
                        Owner: { channel.userOwnerId }
                    </span>
                </div>
            ) }

            <div className="text-xs text-text-muted truncate" title={ channel.channelId }>
                ID: { channel.channelId }
            </div>
        </div>
    );
}
