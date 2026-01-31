import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Radio, RefreshCw, Trash2, Settings, Hash, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

import { DynamicChannelCard } from "./dynamic-channel-card";
import DynamicConfigForm from "./dynamic-config-form";

import {
    DYNAMIC_DETAILS_PANEL_INITIAL_STATE,
    DYNAMIC_DETAILS_PANEL_COMMANDS
} from "@vertix.gg/dashboard/src/features/management/commands/dynamic-details-panel/dynamic-details-panel-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { DynamicDetailsPanelState } from "@vertix.gg/dashboard/src/features/management/commands/dynamic-details-panel/dynamic-details-panel-commands";
import type { DynamicMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

export interface DynamicDetailsPanelProps {
    details: DynamicMasterDetails;
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

const DynamicDetailsPanelComponent: DCommandFunctionComponent<DynamicDetailsPanelProps, DynamicDetailsPanelState> = ( {
    details,
    isSaving,
    isRefreshing,
    lastRefreshTime
} ) => {
    const [ state ] = useCommandState<DynamicDetailsPanelState, Pick<DynamicDetailsPanelState, "isEditing" | "showDeleteConfirm" | "tick">>(
        "Dashboard/Management/DynamicDetailsPanel",
        ( state ) => ( {
            isEditing: state.isEditing,
            showDeleteConfirm: state.showDeleteConfirm,
            tick: state.tick
        } )
    );

    const panelCommands = useComponent( "Dashboard/Management/DynamicDetailsPanel" );

    // Page-level commands via useCommand
    const refreshSelected = useCommand( "Dashboard/Management/RefreshSelected" );
    const deleteDynamicSetup = useCommand( "Dashboard/Management/DeleteDynamicSetup" );

    const { master, dynamicChannels } = details;

    // Update the "X ago" display every 10 seconds
    useEffect( () => {
        const intervalId = setInterval( () => {
            panelCommands.run( "Dashboard/Management/DynamicDetailsPanel/Tick", {} );
        }, 10000 );

        return () => clearInterval( intervalId );
    }, [] );

    const handleRefresh = () => {
        refreshSelected.run( {} );
    };

    const handleDelete = () => {
        deleteDynamicSetup.run( { masterChannelId: master.id } );
    };

    const handleStartEditing = () => {
        panelCommands.run( "Dashboard/Management/DynamicDetailsPanel/StartEditing", {
            settings: master.settings
        } );
    };

    const handleShowDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Management/DynamicDetailsPanel/ShowDeleteConfirm", {} );
    };

    const handleHideDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Management/DynamicDetailsPanel/HideDeleteConfirm", {} );
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                { details.discord?.masterChannel?.name || "Dynamic Master" }
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
                        <div className="text-2xl font-bold text-white">{ dynamicChannels.length }</div>
                        <div className="text-xs text-zinc-400">Active Channels</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            { master.settings?.dynamicChannelAutoSave ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-zinc-500" />
                            ) }
                            <span className="text-sm font-medium text-white">
                                { master.settings?.dynamicChannelAutoSave ? "On" : "Off" }
                            </span>
                        </div>
                        <div className="text-xs text-zinc-400">Auto-Save</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            { master.settings?.dynamicChannelMentionable ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-zinc-500" />
                            ) }
                            <span className="text-sm font-medium text-white">
                                { master.settings?.dynamicChannelMentionable ? "On" : "Off" }
                            </span>
                        </div>
                        <div className="text-xs text-zinc-400">Mentionable</div>
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
                                className="text-xs text-blue-500 hover:text-blue-400"
                            >
                                Edit
                            </button>
                        ) }
                    </div>

                    { state.isEditing ? (
                        <DynamicConfigForm
                            masterChannelId={ master.id }
                            settings={ master.settings }
                            isSaving={ isSaving }
                        />
                    ) : (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Name Template:</span>
                                <span className="text-white font-mono">
                                    { master.settings?.dynamicChannelNameTemplate || "{username}'s Channel" }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Auto-Save:</span>
                                <span className="text-white">
                                    { master.settings?.dynamicChannelAutoSave ? "Enabled" : "Disabled" }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Mentionable:</span>
                                <span className="text-white">
                                    { master.settings?.dynamicChannelMentionable ? "Enabled" : "Disabled" }
                                </span>
                            </div>
                        </div>
                    ) }
                </div>

                <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                        <Hash className="w-4 h-4" />
                        Active Dynamic Channels ({ dynamicChannels.length })
                    </h3>

                    { dynamicChannels.length === 0 ? (
                        <div className="bg-zinc-800/50 rounded-lg p-4 text-center text-zinc-500 text-sm">
                            No active dynamic channels. Users can create channels by joining the master channel.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            { dynamicChannels.map( ( channel ) => (
                                <DynamicChannelCard
                                    key={ channel.id }
                                    channel={ channel }
                                />
                            ) ) }
                        </div>
                    ) }
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-400 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Danger Zone
                    </h3>
                    <p className="text-xs text-zinc-400 mb-3">
                        Deleting this setup will remove the master channel and all associated dynamic channels from Discord.
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
                            Delete Dynamic Setup
                        </button>
                    ) }
                </div>
            </div>
        </div>
    );
};

const DynamicDetailsPanel = withCommands(
    "Dashboard/Management/DynamicDetailsPanel",
    DynamicDetailsPanelComponent,
    DYNAMIC_DETAILS_PANEL_INITIAL_STATE,
    [ ...DYNAMIC_DETAILS_PANEL_COMMANDS ]
);

export { DynamicDetailsPanel };
export default DynamicDetailsPanel;
