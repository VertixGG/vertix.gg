import { useEffect } from "react";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";

import { Layers, Radio, Loader2, Plus, RefreshCw } from "lucide-react";

import {
    LoadGuildManagementCommand,
    CreateScalingSetupCommand,
    SelectMasterChannelCommand,
    UpdateScalingSettingsCommand,
    TriggerReindexCommand,
    TriggerCleanupCommand,
    DeleteScalingSetupCommand,
    ClearErrorCommand,
    ShowCreateModalCommand,
    HideCreateModalCommand,
    StartEditingConfigCommand,
    StopEditingConfigCommand,
    ShowDeleteConfirmCommand,
    HideDeleteConfirmCommand,
    UpdateConfigPrefixCommand,
    UpdateConfigMaxMembersCommand,
    UpdateConfigMinAvailableCommand,
    ResetConfigFormCommand,
    MANAGEMENT_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/management/commands/management-commands";
import { MasterChannelList } from "@vertix.gg/dashboard/src/features/management/components/master-channel-list";
import { ScalingDetailsPanel } from "@vertix.gg/dashboard/src/features/management/components/scaling-details-panel";
import { CreateScalingForm } from "@vertix.gg/dashboard/src/features/management/components/create-scaling-form";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { ManagementState } from "@vertix.gg/dashboard/src/features/management/commands/management-commands";
import type { MasterChannelType, CreateScalingSetupInput } from "@vertix.gg/dashboard/src/features/management/types";

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

interface ManagementSelectedState {
    managementDetails: ManagementState[ "managementDetails" ];
    selectedMasterChannelId: ManagementState[ "selectedMasterChannelId" ];
    selectedMasterChannelType: ManagementState[ "selectedMasterChannelType" ];
    scalingMasterDetails: ManagementState[ "scalingMasterDetails" ];
    isSaving: ManagementState[ "isSaving" ];
    isCreating: ManagementState[ "isCreating" ];
    isLoading: ManagementState[ "isLoading" ];
    error: ManagementState[ "error" ];
    lastRefreshTimestamp: ManagementState[ "lastRefreshTimestamp" ];
    showCreateModal: ManagementState[ "showCreateModal" ];
    isEditingConfig: ManagementState[ "isEditingConfig" ];
    showDeleteConfirm: ManagementState[ "showDeleteConfirm" ];
    configForm: ManagementState[ "configForm" ];
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
            scalingMasterDetails: state.scalingMasterDetails,
            isSaving: state.isSaving,
            isCreating: state.isCreating,
            isLoading: state.isLoading,
            error: state.error,
            lastRefreshTimestamp: state.lastRefreshTimestamp,
            showCreateModal: state.showCreateModal,
            isEditingConfig: state.isEditingConfig,
            showDeleteConfirm: state.showDeleteConfirm,
            configForm: state.configForm
        } )
    );

    const loadGuildManagement = useCommand( "Dashboard/Management/LoadGuildManagement" );
    const createScalingSetup = useCommand( "Dashboard/Management/CreateScalingSetup" );
    const selectMasterChannel = useCommand( "Dashboard/Management/SelectMasterChannel" );
    const updateScalingSettings = useCommand( "Dashboard/Management/UpdateScalingSettings" );
    const triggerReindex = useCommand( "Dashboard/Management/TriggerReindex" );
    const triggerCleanup = useCommand( "Dashboard/Management/TriggerCleanup" );
    const deleteScalingSetup = useCommand( "Dashboard/Management/DeleteScalingSetup" );
    const clearError = useCommand( "Dashboard/Management/ClearError" );
    const showCreateModalCmd = useCommand( "Dashboard/Management/ShowCreateModal" );
    const hideCreateModalCmd = useCommand( "Dashboard/Management/HideCreateModal" );
    const startEditingConfig = useCommand( "Dashboard/Management/StartEditingConfig" );
    const stopEditingConfig = useCommand( "Dashboard/Management/StopEditingConfig" );
    const showDeleteConfirmCmd = useCommand( "Dashboard/Management/ShowDeleteConfirm" );
    const hideDeleteConfirmCmd = useCommand( "Dashboard/Management/HideDeleteConfirm" );
    const updateConfigPrefix = useCommand( "Dashboard/Management/UpdateConfigPrefix" );
    const updateConfigMaxMembers = useCommand( "Dashboard/Management/UpdateConfigMaxMembers" );
    const updateConfigMinAvailable = useCommand( "Dashboard/Management/UpdateConfigMinAvailable" );
    const resetConfigForm = useCommand( "Dashboard/Management/ResetConfigForm" );

    useEffect( () => {
        loadGuildManagement.run( { guildId } );
    }, [ guildId ] );

    // Poll for updates every minute when a scaling channel is selected
    useEffect( () => {
        if ( !state.selectedMasterChannelId || state.selectedMasterChannelType !== "scaling" ) {
            return;
        }

        const intervalId = setInterval( () => {
            selectMasterChannel.run( {
                guildId,
                masterChannelId: state.selectedMasterChannelId!,
                type: "scaling"
            } );
        }, 60000 ); // 1 minute

        return () => clearInterval( intervalId );
    }, [ guildId, state.selectedMasterChannelId, state.selectedMasterChannelType ] );

    const handleSelectChannel = ( id: string, type: MasterChannelType ) => {
        selectMasterChannel.run( { guildId, masterChannelId: id, type } );
    };

    const handleCreateScalingSetup = ( input: CreateScalingSetupInput ) => {
        createScalingSetup.run( { guildId, input } );
    };

    const handleSaveSettings = () => {
        if ( state.selectedMasterChannelId ) {
            updateScalingSettings.run( {
                guildId,
                masterChannelId: state.selectedMasterChannelId,
                settings: {
                    scalingChannelPrefix: state.configForm.prefix,
                    scalingChannelMaxMembersPerChannel: state.configForm.maxMembers,
                    scalingChannelMinAvailableChannels: state.configForm.minAvailable
                }
            } );
        }
    };

    const handleStopEditing = () => {
        resetConfigForm.run( {} );
        stopEditingConfig.run( {} );
    };

    const handleReindex = () => {
        if ( state.selectedMasterChannelId ) {
            triggerReindex.run( { guildId, masterChannelId: state.selectedMasterChannelId } );
        }
    };

    const handleCleanup = () => {
        if ( state.selectedMasterChannelId ) {
            triggerCleanup.run( { guildId, masterChannelId: state.selectedMasterChannelId } );
        }
    };

    const handleDelete = () => {
        if ( state.selectedMasterChannelId ) {
            deleteScalingSetup.run( { guildId, masterChannelId: state.selectedMasterChannelId } );
        }
    };

    const handleRefresh = () => {
        if ( state.selectedMasterChannelId && state.selectedMasterChannelType ) {
            selectMasterChannel.run( {
                guildId,
                masterChannelId: state.selectedMasterChannelId,
                type: state.selectedMasterChannelType
            } );
        }
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

    const { managementDetails, selectedMasterChannelId, selectedMasterChannelType, scalingMasterDetails } = state;

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
                    <button
                        onClick={ () => showCreateModalCmd.run( {} ) }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Auto-Scaling Setup
                    </button>
                </div>
                { state.showCreateModal && (
                    <CreateScalingForm
                        isCreating={ state.isCreating }
                        onSubmit={ handleCreateScalingSetup }
                        onCancel={ () => hideCreateModalCmd.run( {} ) }
                    />
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
                            <button
                                onClick={ () => showCreateModalCmd.run( {} ) }
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                                title="Create Auto-Scaling Setup"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
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
                ) : selectedMasterChannelType === "scaling" && scalingMasterDetails ? (
                    <ScalingDetailsPanel
                        details={ scalingMasterDetails }
                        isSaving={ state.isSaving }
                        isRefreshing={ state.isLoading }
                        isEditing={ state.isEditingConfig }
                        showDeleteConfirm={ state.showDeleteConfirm }
                        configForm={ state.configForm }
                        lastRefreshTime={ state.lastRefreshTimestamp ? new Date( state.lastRefreshTimestamp ) : null }
                        onSaveSettings={ handleSaveSettings }
                        onRefresh={ handleRefresh }
                        onReindex={ handleReindex }
                        onCleanup={ handleCleanup }
                        onDelete={ handleDelete }
                        onStartEditing={ () => startEditingConfig.run( {} ) }
                        onStopEditing={ handleStopEditing }
                        onShowDeleteConfirm={ () => showDeleteConfirmCmd.run( {} ) }
                        onHideDeleteConfirm={ () => hideDeleteConfirmCmd.run( {} ) }
                        onUpdatePrefix={ ( value ) => updateConfigPrefix.run( { value } ) }
                        onUpdateMaxMembers={ ( value ) => updateConfigMaxMembers.run( { value } ) }
                        onUpdateMinAvailable={ ( value ) => updateConfigMinAvailable.run( { value } ) }
                    />
                ) : selectedMasterChannelType === "dynamic" ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-500">
                        <div className="text-center">
                            <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Dynamic channel management coming soon</p>
                        </div>
                    </div>
                ) : null }
            </div>
        </div>
        { state.showCreateModal && (
            <CreateScalingForm
                isCreating={ state.isCreating }
                onSubmit={ handleCreateScalingSetup }
                onCancel={ () => hideCreateModalCmd.run( {} ) }
            />
        ) }
        </>
    );
};

const ManagementContent = withCommands<ManagementContentProps, ManagementState>(
    "Dashboard/Management",
    ManagementContentComponent,
    MANAGEMENT_INITIAL_STATE,
    [
        LoadGuildManagementCommand,
        CreateScalingSetupCommand,
        SelectMasterChannelCommand,
        UpdateScalingSettingsCommand,
        TriggerReindexCommand,
        TriggerCleanupCommand,
        DeleteScalingSetupCommand,
        ClearErrorCommand,
        ShowCreateModalCommand,
        HideCreateModalCommand,
        StartEditingConfigCommand,
        StopEditingConfigCommand,
        ShowDeleteConfirmCommand,
        HideDeleteConfirmCommand,
        UpdateConfigPrefixCommand,
        UpdateConfigMaxMembersCommand,
        UpdateConfigMinAvailableCommand,
        ResetConfigFormCommand
    ]
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
