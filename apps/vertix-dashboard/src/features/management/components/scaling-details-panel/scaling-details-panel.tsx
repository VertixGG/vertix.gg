import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Layers, RefreshCw, Trash2, Settings, Hash, AlertTriangle } from "lucide-react";

import { ScalingChannelCard } from "./scaling-channel-card";
import ScalingConfigForm from "./scaling-config-form";

import {
    SCALING_DETAILS_PANEL_INITIAL_STATE,
    SCALING_DETAILS_PANEL_COMMANDS
} from "../../commands/scaling-details-panel/scaling-details-panel-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { ScalingDetailsPanelState } from "../../commands/scaling-details-panel/scaling-details-panel-commands";
import type { ScalingMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

export interface ScalingDetailsPanelProps {
    details: ScalingMasterDetails;
    isSaving: boolean;
    isRefreshing: boolean;
    lastRefreshTime: Date | null;
}

function formatLastRefresh( date: Date | null ): string {
    if ( !date ) {
        return "Never";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor( diffMs / 1000 );

    if ( diffSec < 5 ) {
        return "Just now";
    }

    if ( diffSec < 60 ) {
        return `${ diffSec }s ago`;
    }

    const diffMin = Math.floor( diffSec / 60 );

    if ( diffMin < 60 ) {
        return `${ diffMin }m ago`;
    }

    return date.toLocaleTimeString();
}

const ScalingDetailsPanelComponent: DCommandFunctionComponent<ScalingDetailsPanelProps, ScalingDetailsPanelState> = ( {
    details,
    isSaving,
    isRefreshing,
    lastRefreshTime
} ) => {
    const [ state ] = useCommandState<ScalingDetailsPanelState, Pick<ScalingDetailsPanelState, "isEditing" | "showDeleteConfirm" | "tick">>(
        "Dashboard/Management/ScalingDetailsPanel",
        ( state ) => ( {
            isEditing: state.isEditing,
            showDeleteConfirm: state.showDeleteConfirm,
            tick: state.tick
        } )
    );

    const panelCommands = useComponent( "Dashboard/Management/ScalingDetailsPanel" );

    // Page-level commands via useCommand
    const refreshSelected = useCommand( "Dashboard/Management/RefreshSelected" );
    const triggerReindex = useCommand( "Dashboard/Management/TriggerReindex" );
    const triggerCleanup = useCommand( "Dashboard/Management/TriggerCleanup" );
    const deleteScalingSetup = useCommand( "Dashboard/Management/DeleteScalingSetup" );

    const { master, scalingChannels } = details;

    // Update the "X ago" display every 10 seconds
    useEffect( () => {
        const intervalId = setInterval( () => {
            panelCommands.run( "Dashboard/Management/ScalingDetailsPanel/Tick" );
        }, 10000 );

        return () => clearInterval( intervalId );
    }, [] );

    const handleRefresh = () => {
        refreshSelected.run( {} );
    };

    const handleReindex = () => {
        triggerReindex.run( { masterChannelId: master.id } );
    };

    const handleCleanup = () => {
        triggerCleanup.run( { masterChannelId: master.id } );
    };

    const handleDelete = () => {
        deleteScalingSetup.run( { masterChannelId: master.id } );
    };

    const handleStartEditing = () => {
        panelCommands.run( "Dashboard/Management/ScalingDetailsPanel/StartEditing", {
            settings: master.settings
        } );
    };

    const handleShowDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Management/ScalingDetailsPanel/ShowDeleteConfirm" );
    };

    const handleHideDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Management/ScalingDetailsPanel/HideDeleteConfirm" );
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                { details.discord?.masterChannel?.name || "Auto-Scaling Master" }
                            </h2>
                            <p className="text-sm text-zinc-400">
                                { details.discord?.category?.name ? (
                                    <span>in <span className="text-zinc-300">{ details.discord.category.name }</span></span>
                                ) : (
                                    <span className="truncate" title={ master.channelId }>{ master.channelId }</span>
                                ) }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                            { isRefreshing ? "Refreshing..." : formatLastRefresh( lastRefreshTime ) }
                        </span>
                        <button
                            onClick={ handleRefresh }
                            disabled={ isRefreshing || isSaving }
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={ `w-5 h-5 ${ isRefreshing ? "animate-spin" : "" }` } />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-2xl font-bold text-white">{ scalingChannels.length }</div>
                        <div className="text-xs text-zinc-400">Scaling Channels</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-2xl font-bold text-white">
                            { master.settings?.scalingChannelMaxMembersPerChannel || "Unlimited" }
                        </div>
                        <div className="text-xs text-zinc-400">Max Members/Channel</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-2xl font-bold text-white">
                            { master.settings?.scalingChannelMinAvailableChannels || 1 }
                        </div>
                        <div className="text-xs text-zinc-400">Min Available</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Configuration
                        </h3>
                        { !state.isEditing && (
                            <button
                                onClick={ handleStartEditing }
                                className="text-xs text-emerald-500 hover:text-emerald-400"
                            >
                                Edit
                            </button>
                        ) }
                    </div>

                    { state.isEditing ? (
                        <ScalingConfigForm
                            masterChannelId={ master.id }
                            settings={ master.settings }
                            isSaving={ isSaving }
                        />
                    ) : (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Prefix:</span>
                                <span className="text-white font-mono">
                                    { master.settings?.scalingChannelPrefix || "Not set" }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Max Members:</span>
                                <span className="text-white">
                                    { master.settings?.scalingChannelMaxMembersPerChannel || "Unlimited" }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Min Available:</span>
                                <span className="text-white">
                                    { master.settings?.scalingChannelMinAvailableChannels || 1 }
                                </span>
                            </div>
                        </div>
                    ) }
                </div>

                <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                        <Hash className="w-4 h-4" />
                        Scaling Channels ({ scalingChannels.length })
                    </h3>

                    { scalingChannels.length === 0 ? (
                        <div className="bg-zinc-800/50 rounded-lg p-4 text-center text-zinc-500 text-sm">
                            No scaling channels created yet
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            { scalingChannels.map( ( channel, index ) => (
                                <ScalingChannelCard
                                    key={ channel.id }
                                    channel={ channel }
                                    index={ index }
                                    maxMembers={ master.settings?.scalingChannelMaxMembersPerChannel }
                                />
                            ) ) }
                        </div>
                    ) }
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-white mb-3">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={ handleReindex }
                            disabled={ isSaving }
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white rounded text-sm transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reindex Channels
                        </button>
                        <button
                            onClick={ handleCleanup }
                            disabled={ isSaving }
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white rounded text-sm transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Cleanup Empty
                        </button>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-400 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Danger Zone
                    </h3>
                    <p className="text-xs text-zinc-400 mb-3">
                        Deleting this setup will remove the master channel and all associated scaling channels from Discord.
                    </p>

                    { state.showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={ handleDelete }
                                disabled={ isSaving }
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-sm font-medium transition-colors"
                            >
                                Yes, Delete Everything
                            </button>
                            <button
                                onClick={ handleHideDeleteConfirm }
                                disabled={ isSaving }
                                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={ handleShowDeleteConfirm }
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Scaling Setup
                        </button>
                    ) }
                </div>
            </div>
        </div>
    );
};

const ScalingDetailsPanel = withCommands(
    "Dashboard/Management/ScalingDetailsPanel",
    ScalingDetailsPanelComponent,
    SCALING_DETAILS_PANEL_INITIAL_STATE,
    [ ...SCALING_DETAILS_PANEL_COMMANDS ]
);

export { ScalingDetailsPanel };
export default ScalingDetailsPanel;
