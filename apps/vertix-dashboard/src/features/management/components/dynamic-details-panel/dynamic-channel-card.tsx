import { Hash, User } from "lucide-react";

import type { DynamicChannelInfo } from "@vertix.gg/dashboard/src/features/management/types";

interface DynamicChannelCardProps {
    channel: DynamicChannelInfo;
}

export function DynamicChannelCard( { channel }: DynamicChannelCardProps ) {
    const memberCount = channel.discord?.memberCount ?? 0;
    const channelName = channel.discord?.name;

    const getStatusColor = () => {
        if ( memberCount === 0 ) {
            return "bg-zinc-600";
        }

        return "bg-blue-500";
    };

    const getStatusText = () => {
        if ( memberCount === 0 ) {
            return "Empty";
        }

        return `${ memberCount } member${ memberCount === 1 ? "" : "s" }`;
    };

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-white">
                        { channelName || "Dynamic Channel" }
                    </span>
                </div>
                <div className={ `px-2 py-0.5 rounded text-xs font-medium ${ getStatusColor() } text-white` }>
                    { getStatusText() }
                </div>
            </div>

            { channel.userOwnerId && (
                <div className="flex items-center gap-1 text-xs text-zinc-400 mb-2">
                    <User className="w-3 h-3" />
                    <span className="truncate" title={ channel.userOwnerId }>
                        Owner: { channel.userOwnerId }
                    </span>
                </div>
            ) }

            <div className="text-xs text-zinc-500 truncate" title={ channel.channelId }>
                ID: { channel.channelId }
            </div>
        </div>
    );
}
