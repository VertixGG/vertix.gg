import { useEffect, useRef, useState } from "react";

import { Navigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";

import { Layers, Radio, Loader2, Plus, RefreshCw, ChevronDown, AlertTriangle, X } from "lucide-react";

import {
    MANAGEMENT_COMMANDS,
    MANAGEMENT_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/management/commands";

import MasterChannelList from "@vertix.gg/dashboard/src/features/management/components/master-channel-list/master-channel-list";
import ScalingDetailsPanel from "@vertix.gg/dashboard/src/features/management/components/scaling-details-panel/scaling-details-panel";
import DynamicDetailsPanel from "@vertix.gg/dashboard/src/features/management/components/dynamic-details-panel/dynamic-details-panel";
import CreateScalingForm from "@vertix.gg/dashboard/src/features/management/components/create-scaling-form/create-scaling-form";
import CreateDynamicForm from "@vertix.gg/dashboard/src/features/management/components/create-dynamic-form/create-dynamic-form";

import type { ManagementState, CreateModalType } from "@vertix.gg/dashboard/src/features/management/commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { MasterChannelType } from "@vertix.gg/dashboard/src/features/management/types";

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

interface ManagementSelectedState {
    managementDetails: ManagementState[ "managementDetails" ];
    selectedMasterChannelId: ManagementState[ "selectedMasterChannelId" ];
    selectedMasterChannelType: ManagementState[ "selectedMasterChannelType" ];
    isSaving: ManagementState[ "isSaving" ];
    isCreating: ManagementState[ "isCreating" ];
    isLoading: ManagementState[ "isLoading" ];
    error: ManagementState[ "error" ];
    lastRefreshTimestamp: ManagementState[ "lastRefreshTimestamp" ];
    showCreateModal: ManagementState[ "showCreateModal" ];
    createModalType: ManagementState[ "createModalType" ];
}

interface ManagementContentProps {
    guildId: string;
}

const ManagementContentComponent: DCommandFunctionComponent<ManagementContentProps, ManagementState> = ( { guildId } ) => {
    const [ state ] = useCommandState<ManagementState, ManagementSelectedState>(
        "Dashboard/Management",
        ( state: ManagementState ): ManagementSelectedState => ( {
            managementDetails: state.managementDetails,
            selectedMasterChannelId: state.selectedMasterChannelId,
            selectedMasterChannelType: state.selectedMasterChannelType,
            isSaving: state.isSaving,
            isCreating: state.isCreating,
            isLoading: state.isLoading,
            error: state.error,
            lastRefreshTimestamp: state.lastRefreshTimestamp,
            showCreateModal: state.showCreateModal,
            createModalType: state.createModalType
        } )
    );

    // Derive selected master from managementDetails - single source of truth
    const selectedScalingMaster = state.selectedMasterChannelType === "scaling" && state.managementDetails
        ? state.managementDetails.scalingMasterChannels.find( ( m ) => m.id === state.selectedMasterChannelId )
        : null;

    const selectedDynamicMaster = state.selectedMasterChannelType === "dynamic" && state.managementDetails
        ? state.managementDetails.dynamicMasterChannels.find( ( m ) => m.id === state.selectedMasterChannelId )
        : null;

    const [ showCreateDropdown, setShowCreateDropdown ] = useState( false );

    const createMenuRef = useRef<HTMLDivElement>( null );

    const loadGuildManagement = useCommand( "Dashboard/Management/LoadGuildManagement" );
    const selectMasterChannel = useCommand( "Dashboard/Management/SelectMasterChannel" );
    const clearError = useCommand( "Dashboard/Management/ClearError" );
    const showCreateModalCmd = useCommand( "Dashboard/Management/ShowCreateModal" );

    useEffect( () => {
        loadGuildManagement.run( { guildId } );
    }, [ guildId ] );

    // Poll for updates every minute when a master channel is selected
    useEffect( () => {
        if ( !state.selectedMasterChannelId || !state.selectedMasterChannelType ) {
            return;
        }

        const intervalId = setInterval( () => {
            selectMasterChannel.run( {
                masterChannelId: state.selectedMasterChannelId!,
                type: state.selectedMasterChannelType!
            } );
        }, 60000 ); // 1 minute

        return () => clearInterval( intervalId );
    }, [ state.selectedMasterChannelId, state.selectedMasterChannelType ] );

    // A menu that only closes by pressing its own button reads as stuck.
    useEffect( () => {
        if ( !showCreateDropdown ) {
            return;
        }

        const handlePointerDown = ( event: MouseEvent ) => {
            if ( createMenuRef.current && !createMenuRef.current.contains( event.target as Node ) ) {
                setShowCreateDropdown( false );
            }
        };

        document.addEventListener( "mousedown", handlePointerDown );

        return () => document.removeEventListener( "mousedown", handlePointerDown );
    }, [ showCreateDropdown ] );

    const handleSelectChannel = ( id: string, type: MasterChannelType ) => {
        selectMasterChannel.run( { masterChannelId: id, type } );
    };

    const handleShowCreateModal = ( type: CreateModalType ) => {
        setShowCreateDropdown( false );
        showCreateModalCmd.run( { type } );
    };

    const handleRefreshList = () => {
        loadGuildManagement.run( { guildId } );
    };

    if ( state.isLoading && !state.managementDetails ) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
            </div>
        );
    }

    // Only an error that left nothing on screen takes the page; one that arrives with data still
    // in hand is a banner over it, so a failed save does not throw the list away.
    if ( state.error && !state.managementDetails ) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <AlertTriangle className="w-8 h-8 text-error mb-3" />
                <div className="text-error mb-2">{ state.error }</div>
                <button
                    onClick={ () => {
                        clearError.run( {} );
                        loadGuildManagement.run( { guildId } );
                    } }
                    className="text-sm text-text-secondary hover:text-text-primary"
                >
                    Try again
                </button>
            </div>
        );
    }

    const { managementDetails, selectedMasterChannelId, selectedMasterChannelType } = state;

    if ( !managementDetails ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No management data available
            </div>
        );
    }

    const hasNoChannels =
        managementDetails.scalingMasterChannels.length === 0 &&
        managementDetails.dynamicMasterChannels.length === 0;

    if ( hasNoChannels ) {
        return (
            <>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full">
                        <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">Management</h1>
                        <p className="text-text-muted text-center mb-8">
                            Nothing is set up in this server yet. Pick the kind of setup you want, or run
                            <code className="text-text-secondary"> /setup </code>
                            in Discord.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={ () => handleShowCreateModal( "dynamic" ) }
                                className="text-left bg-surface border border-border hover:border-border-accent
                                    rounded-lg p-5 transition-colors"
                            >
                                <Radio className="w-6 h-6 text-success mb-3" />
                                <h2 className="text-text-primary font-semibold mb-1">Dynamic channels</h2>
                                <p className="text-sm text-text-muted mb-0">
                                    Members join one generator channel and get a channel of their own, with a
                                    control panel to run it.
                                </p>
                            </button>

                            <button
                                onClick={ () => handleShowCreateModal( "scaling" ) }
                                className="text-left bg-surface border border-border hover:border-border-accent
                                    rounded-lg p-5 transition-colors"
                            >
                                <Layers className="w-6 h-6 text-text-accent mb-3" />
                                <h2 className="text-text-primary font-semibold mb-1">Auto-scaling channels</h2>
                                <p className="text-sm text-text-muted mb-0">
                                    A pool of channels that grows and shrinks with demand, so a busy server
                                    never runs out of room.
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
                { state.showCreateModal && state.createModalType === "scaling" && (
                    <CreateScalingForm isCreating={ state.isCreating } />
                ) }
                { state.showCreateModal && state.createModalType === "dynamic" && (
                    <CreateDynamicForm isCreating={ state.isCreating } />
                ) }
            </>
        );
    }

    const scalingCount = managementDetails.scalingMasterChannels.length;
    const dynamicCount = managementDetails.dynamicMasterChannels.length;

    return (
        <>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary mb-1">Management</h1>
                        <p className="text-sm text-text-muted mb-0">
                            { dynamicCount } dynamic
                            { 1 === dynamicCount ? " setup" : " setups" }
                            { " · " }
                            { scalingCount } auto-scaling
                            { 1 === scalingCount ? " setup" : " setups" }
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={ handleRefreshList }
                            disabled={ state.isLoading }
                            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary
                                hover:text-text-primary bg-surface hover:bg-surface-hover border border-border
                                rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={ `w-4 h-4 ${ state.isLoading ? "animate-spin" : "" }` } />
                            Refresh
                        </button>

                        <div className="relative" ref={ createMenuRef }>
                            <button
                                onClick={ () => setShowCreateDropdown( !showCreateDropdown ) }
                                className="flex items-center gap-2 px-3 py-2 text-sm text-text-accent bg-accent/15
                                    hover:bg-accent/25 border border-border-accent rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                New setup
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            { showCreateDropdown && (
                                <div className="absolute right-0 mt-1 w-56 bg-surface border border-border
                                    rounded-lg shadow-lg z-10 overflow-hidden">
                                    <button
                                        onClick={ () => handleShowCreateModal( "dynamic" ) }
                                        className="w-full px-3 py-2 text-left text-sm text-text-primary
                                            hover:bg-surface-elevated flex items-center gap-2"
                                    >
                                        <Radio className="w-4 h-4 text-success" />
                                        Dynamic Channel Setup
                                    </button>
                                    <button
                                        onClick={ () => handleShowCreateModal( "scaling" ) }
                                        className="w-full px-3 py-2 text-left text-sm text-text-primary
                                            hover:bg-surface-elevated flex items-center gap-2"
                                    >
                                        <Layers className="w-4 h-4 text-text-accent" />
                                        Auto-Scaling Setup
                                    </button>
                                </div>
                            ) }
                        </div>
                    </div>
                </div>

                { state.error && (
                    <div className="mx-6 mt-4 flex items-start gap-3 bg-error/10 border border-error/30
                        rounded-lg px-4 py-3">
                        <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                        <span className="flex-1 text-sm text-error">{ state.error }</span>
                        <button
                            onClick={ () => clearError.run( {} ) }
                            className="text-error hover:text-text-primary transition-colors"
                            title="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) }

                <div className="flex-1 flex overflow-hidden">
                    <div className="w-80 border-r border-border flex flex-col bg-surface/50">
                        <MasterChannelList
                            scalingMasters={ managementDetails.scalingMasterChannels }
                            dynamicMasters={ managementDetails.dynamicMasterChannels }
                            selectedId={ selectedMasterChannelId }
                            onSelect={ handleSelectChannel }
                        />
                    </div>

                    <div className="flex-1 flex flex-col bg-background">
                        { !selectedMasterChannelId ? (
                            <div className="flex-1 flex items-center justify-center text-text-muted">
                                <div className="text-center">
                                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Select a master channel to view details</p>
                                </div>
                            </div>
                        ) : state.isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
                            </div>
                        ) : selectedMasterChannelType === "scaling" && selectedScalingMaster?.scalingChannels ? (
                            <ScalingDetailsPanel
                                details={ {
                                    master: selectedScalingMaster,
                                    scalingChannels: selectedScalingMaster.scalingChannels,
                                    discord: selectedScalingMaster.discord
                                } }
                                isSaving={ state.isSaving }
                                isRefreshing={ state.isLoading }
                                lastRefreshTime={ state.lastRefreshTimestamp ? new Date( state.lastRefreshTimestamp ) : null }
                            />
                        ) : selectedMasterChannelType === "dynamic" && selectedDynamicMaster?.dynamicChannels ? (
                            <DynamicDetailsPanel
                                details={ {
                                    master: selectedDynamicMaster,
                                    dynamicChannels: selectedDynamicMaster.dynamicChannels,
                                    discord: selectedDynamicMaster.discord
                                } }
                                isSaving={ state.isSaving }
                                isRefreshing={ state.isLoading }
                                lastRefreshTime={ state.lastRefreshTimestamp ? new Date( state.lastRefreshTimestamp ) : null }
                            />
                        ) : null }
                    </div>
                </div>
            </div>
            { state.showCreateModal && state.createModalType === "scaling" && (
                <CreateScalingForm isCreating={ state.isCreating } />
            ) }
            { state.showCreateModal && state.createModalType === "dynamic" && (
                <CreateDynamicForm isCreating={ state.isCreating } />
            ) }
        </>
    );
};

const ManagementContent = withCommands<ManagementContentProps, ManagementState>(
    "Dashboard/Management",
    ManagementContentComponent,
    MANAGEMENT_INITIAL_STATE,
    [ ...MANAGEMENT_COMMANDS ]
);

export function ManagementPage() {
    const [ authState ] = useCommandState<AuthState, AuthSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AuthSelectedState => ( {
            selectedGuild: state.selectedGuild
        } )
    );

    if ( !authState.selectedGuild ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No guild selected
            </div>
        );
    }

    if ( authState.selectedGuild.id === "__default__" ) {
        return <Navigate to="/interface-editor" replace />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ManagementContent guildId={ authState.selectedGuild.id } />
        </div>
    );
}
