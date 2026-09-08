import { useEffect } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent, useCommand } from "@zenflux/react-commander/hooks";

import { Layers, RefreshCw, Trash2, Settings, Hash, AlertTriangle, Pencil } from "lucide-react";

import { ScalingChannelCard } from "./scaling-channel-card";
import ScalingConfigForm from "./scaling-config-form";

import {
    SCALING_DETAILS_PANEL_INITIAL_STATE,
    SCALING_DETAILS_PANEL_COMMANDS
} from "../../commands/scaling-details-panel/scaling-details-panel-commands";

import { SettingRow, SettingsGroup } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { ScalingDetailsPanelState } from "../../commands/scaling-details-panel/scaling-details-panel-commands";
import type { ScalingMasterDetails } from "@vertix.gg/dashboard/src/features/generators/types";

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
        "Dashboard/Generators/ScalingDetailsPanel",
        ( state ) => ( {
            isEditing: state.isEditing,
            showDeleteConfirm: state.showDeleteConfirm,
            tick: state.tick
        } )
    );

    const panelCommands = useComponent( "Dashboard/Generators/ScalingDetailsPanel" );

    // Page-level commands via useCommand
    const refreshSelected = useCommand( "Dashboard/Generators/RefreshSelected" );
    const triggerReindex = useCommand( "Dashboard/Generators/TriggerReindex" );
    const triggerCleanup = useCommand( "Dashboard/Generators/TriggerCleanup" );
    const deleteScalingSetup = useCommand( "Dashboard/Generators/DeleteScalingSetup" );

    const { master, scalingChannels } = details;

    // Update the "X ago" display every 10 seconds
    useEffect( () => {
        const intervalId = setInterval( () => {
            panelCommands.run( "Dashboard/Generators/ScalingDetailsPanel/Tick", {} );
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
        panelCommands.run( "Dashboard/Generators/ScalingDetailsPanel/StartEditing", {
            settings: master.settings
        } );
    };

    const handleShowDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Generators/ScalingDetailsPanel/ShowDeleteConfirm", {} );
    };

    const handleHideDeleteConfirm = () => {
        panelCommands.run( "Dashboard/Generators/ScalingDetailsPanel/HideDeleteConfirm", {} );
    };

    const settings = master.settings;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border">
                <div className="max-w-4xl w-full px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5 text-success" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-text-primary truncate">
                                { details.discord?.masterChannel?.name || "Auto-Scaling Master" }
                            </h2>
                            <p className="text-sm text-text-secondary mb-0 truncate">
                                { details.discord?.category?.name ? (
                                    <span>in <span className="text-text-primary">{ details.discord.category.name }</span></span>
                                ) : (
                                    <span title={ master.channelId }>{ master.channelId }</span>
                                ) }
                                { " · " }
                                { scalingChannels.length }
                                { 1 === scalingChannels.length ? " channel" : " channels" }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-text-muted">
                            { isRefreshing ? "Refreshing..." : formatLastRefresh( lastRefreshTime ) }
                        </span>
                        <button
                            onClick={ handleRefresh }
                            disabled={ isRefreshing || isSaving }
                            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={ `w-5 h-5 ${ isRefreshing ? "animate-spin" : "" }` } />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl w-full px-6 py-6 space-y-6">
                    <section className="bg-surface border border-border rounded-lg">
                        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 mb-0">
                                <Settings className="w-4 h-4 text-accent-muted" />
                                Configuration
                            </h3>
                            { !state.isEditing && (
                                <button
                                    onClick={ handleStartEditing }
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-success bg-success/15
                                        hover:bg-success/25 border border-success/40 rounded-md transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            ) }
                        </header>

                        <div className="p-4">
                            { state.isEditing ? (
                                <ScalingConfigForm
                                    masterChannelId={ master.id }
                                    settings={ settings }
                                    isSaving={ isSaving }
                                />
                            ) : (
                                <SettingsGroup title="Channel pool">
                                    <SettingRow
                                        label="Prefix"
                                        value={ settings?.scalingChannelPrefix || "Not set" }
                                        mono
                                    />
                                    <SettingRow
                                        label="Max members"
                                        value={ String( settings?.scalingChannelMaxMembersPerChannel || "Unlimited" ) }
                                    />
                                    <SettingRow
                                        label="Min available"
                                        value={ String( settings?.scalingChannelMinAvailableChannels || 1 ) }
                                    />
                                </SettingsGroup>
                            ) }
                        </div>
                    </section>

                    <section>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 mb-0">
                                <Hash className="w-4 h-4 text-accent-muted" />
                                Channels ({ scalingChannels.length })
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={ handleReindex }
                                    disabled={ isSaving }
                                    className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-hover
                                        border border-border disabled:opacity-50 text-text-secondary hover:text-text-primary
                                        rounded-md text-sm transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reindex
                                </button>
                                <button
                                    onClick={ handleCleanup }
                                    disabled={ isSaving }
                                    className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-hover
                                        border border-border disabled:opacity-50 text-text-secondary hover:text-text-primary
                                        rounded-md text-sm transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Cleanup empty
                                </button>
                            </div>
                        </div>

                        { scalingChannels.length === 0 ? (
                            <p className="text-sm text-text-muted mb-0">
                                None yet. The pool fills itself as members arrive.
                            </p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                { scalingChannels.map( ( channel, index ) => (
                                    <ScalingChannelCard
                                        key={ channel.id }
                                        channel={ channel }
                                        index={ index }
                                        maxMembers={ settings?.scalingChannelMaxMembersPerChannel }
                                    />
                                ) ) }
                            </div>
                        ) }
                    </section>

                    <section className="border border-error/30 rounded-lg px-4 py-3">
                        { state.showDeleteConfirm ? (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-start gap-2 min-w-0">
                                    <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                                    <p className="text-sm text-text-secondary mb-0">
                                        This removes the generator and every channel under it from Discord.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={ handleDelete }
                                        disabled={ isSaving }
                                        className="px-3 py-1.5 bg-error/20 hover:bg-error/30 disabled:opacity-50
                                            text-error rounded-md text-sm font-medium transition-colors"
                                    >
                                        Delete everything
                                    </button>
                                    <button
                                        onClick={ handleHideDeleteConfirm }
                                        disabled={ isSaving }
                                        className="px-3 py-1.5 bg-surface-elevated hover:bg-surface-hover
                                            text-text-primary rounded-md text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm text-text-muted">
                                    Deleting the setup removes the generator and its channels from Discord.
                                </span>
                                <button
                                    onClick={ handleShowDeleteConfirm }
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-error
                                        hover:bg-error/15 rounded-md transition-colors shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete setup
                                </button>
                            </div>
                        ) }
                    </section>
                </div>
            </div>
        </div>
    );
};

const ScalingDetailsPanel = withCommands(
    "Dashboard/Generators/ScalingDetailsPanel",
    ScalingDetailsPanelComponent,
    SCALING_DETAILS_PANEL_INITIAL_STATE,
    [ ...SCALING_DETAILS_PANEL_COMMANDS ]
);

export { ScalingDetailsPanel };
export default ScalingDetailsPanel;
