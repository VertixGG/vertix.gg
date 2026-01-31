import { useEffect, useState } from "react";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";

import { Layers, Radio, Loader2, Plus, RefreshCw, ChevronDown } from "lucide-react";

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
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
        );
    }

    if ( state.error ) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="text-red-400 mb-2">{ state.error }</div>
                <button
                    onClick={ () => clearError.run( {} ) }
                    className="text-sm text-zinc-400 hover:text-white"
                >
                    Dismiss
                </button>
            </div>
        );
    }

    const { managementDetails, selectedMasterChannelId, selectedMasterChannelType } = state;

    if ( !managementDetails ) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
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
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Layers className="w-12 h-12 opacity-50" />
                        <Radio className="w-12 h-12 opacity-50" />
                    </div>
                    <h2 className="text-lg font-medium text-white mb-2">No Channel Setups Found</h2>
                    <p className="text-sm text-center max-w-md mb-4">
                        This guild doesn't have any auto-scaling or dynamic channel setups yet.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={ () => handleShowCreateModal( "scaling" ) }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                        >
                            <Layers className="w-4 h-4" />
                            Create Auto-Scaling
                        </button>
                        <button
                            onClick={ () => handleShowCreateModal( "dynamic" ) }
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                        >
                            <Radio className="w-4 h-4" />
                            Create Dynamic
                        </button>
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

    return (
        <>
            <div className="flex-1 flex overflow-hidden">
                <div className="w-80 border-r border-zinc-700 flex flex-col bg-zinc-800/50">
                    <div className="p-3 border-b border-zinc-700 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-white">Master Channels</h2>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={ handleRefreshList }
                                disabled={ state.isLoading }
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                                title="Refresh List"
                            >
                                <RefreshCw className={ `w-4 h-4 ${ state.isLoading ? "animate-spin" : "" }` } />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={ () => setShowCreateDropdown( !showCreateDropdown ) }
                                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors flex items-center"
                                    title="Create Setup"
                                >
                                    <Plus className="w-4 h-4" />
                                    <ChevronDown className="w-3 h-3 ml-0.5" />
                                </button>
                                { showCreateDropdown && (
                                    <div className="absolute right-0 mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                                        <button
                                            onClick={ () => handleShowCreateModal( "scaling" ) }
                                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-700 flex items-center gap-2 rounded-t-lg"
                                        >
                                            <Layers className="w-4 h-4 text-blue-400" />
                                            Auto-Scaling Setup
                                        </button>
                                        <button
                                            onClick={ () => handleShowCreateModal( "dynamic" ) }
                                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-700 flex items-center gap-2 rounded-b-lg"
                                        >
                                            <Radio className="w-4 h-4 text-green-400" />
                                            Dynamic Channel Setup
                                        </button>
                                    </div>
                                ) }
                            </div>
                        </div>
                    </div>
                    <MasterChannelList
                        scalingMasters={ managementDetails.scalingMasterChannels }
                        dynamicMasters={ managementDetails.dynamicMasterChannels }
                        selectedId={ selectedMasterChannelId }
                        onSelect={ handleSelectChannel }
                    />
                </div>

                <div className="flex-1 flex flex-col bg-zinc-900">
                    { !selectedMasterChannelId ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            <div className="text-center">
                                <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Select a master channel to view details</p>
                            </div>
                        </div>
                    ) : state.isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
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
            <div className="flex-1 flex items-center justify-center text-zinc-500">
                No guild selected
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-700">
                <h1 className="text-xl font-bold text-white">Channel Management</h1>
                <p className="text-sm text-zinc-400">
                    Manage your auto-scaling and dynamic channel setups
                </p>
            </div>
            <ManagementContent guildId={ authState.selectedGuild.id } />
        </div>
    );
}
