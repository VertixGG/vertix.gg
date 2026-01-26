import { CommandBase } from "@zenflux/react-commander/command-base";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";

import type {
    GuildManagementDetails,
    ScalingMasterDetails,
    UpdateScalingSettingsInput,
    CreateScalingSetupInput,
    MasterChannelType
} from "@vertix.gg/dashboard/src/features/management/types";

export interface ConfigFormState {
    prefix: string;
    maxMembers: number;
    minAvailable: number;
}

export interface ManagementState {
    managementDetails: GuildManagementDetails | null;
    selectedMasterChannelId: string | null;
    selectedMasterChannelType: MasterChannelType | null;
    scalingMasterDetails: ScalingMasterDetails | null;
    isSaving: boolean;
    isCreating: boolean;
    isLoading: boolean;
    error: string | null;
    lastRefreshTimestamp: number;
    showCreateModal: boolean;
    isEditingConfig: boolean;
    showDeleteConfirm: boolean;
    configForm: ConfigFormState;
}

export const MANAGEMENT_INITIAL_STATE: ManagementState = {
    managementDetails: null,
    selectedMasterChannelId: null,
    selectedMasterChannelType: null,
    scalingMasterDetails: null,
    isSaving: false,
    isCreating: false,
    isLoading: false,
    error: null,
    lastRefreshTimestamp: 0,
    showCreateModal: false,
    isEditingConfig: false,
    showDeleteConfirm: false,
    configForm: {
        prefix: "",
        maxMembers: 0,
        minAvailable: 1
    }
};

export class LoadGuildManagementCommand extends CommandBase<ManagementState, { guildId: string }> {
    public static getName(): string {
        return "Dashboard/Management/LoadGuildManagement";
    }

    public async apply( args: { guildId: string } ) {
        this.setState( { isLoading: true, error: null } );

        try {
            const response = await apiClient.get<GuildManagementDetails>(
                `/management/guild/${ args.guildId }`
            );

            return this.setState( {
                managementDetails: response.data,
                isLoading: false
            } );
        } catch ( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to load management details",
                isLoading: false
            } );
        }
    }
}

export class CreateScalingSetupCommand extends CommandBase<ManagementState, {
    guildId: string;
    input: CreateScalingSetupInput;
}> {
    public static getName(): string {
        return "Dashboard/Management/CreateScalingSetup";
    }

    public async apply( args: { guildId: string; input: CreateScalingSetupInput } ) {
        this.setState( { isCreating: true, error: null } );

        try {
            await apiClient.post(
                `/management/guild/${ args.guildId }/scaling`,
                args.input
            );

            // Wait a moment for the bot to create the setup, then reload
            await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );

            const response = await apiClient.get<GuildManagementDetails>(
                `/management/guild/${ args.guildId }`
            );

            return this.setState( {
                managementDetails: response.data,
                isCreating: false,
                showCreateModal: false
            } );
        } catch ( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to create scaling setup",
                isCreating: false
            } );
        }
    }
}

export class SelectMasterChannelCommand extends CommandBase<ManagementState, {
    guildId: string;
    masterChannelId: string | null;
    type: MasterChannelType | null;
}> {
    public static getName(): string {
        return "Dashboard/Management/SelectMasterChannel";
    }

    public async apply( args: { guildId: string; masterChannelId: string | null; type: MasterChannelType | null } ) {
        if ( !args.masterChannelId ) {
            return this.setState( {
                selectedMasterChannelId: null,
                selectedMasterChannelType: null,
                scalingMasterDetails: null,
                isEditingConfig: false,
                showDeleteConfirm: false
            } );
        }

        this.setState( {
            selectedMasterChannelId: args.masterChannelId,
            selectedMasterChannelType: args.type,
            scalingMasterDetails: null,
            isLoading: true,
            error: null,
            isEditingConfig: false,
            showDeleteConfirm: false
        } );

        if ( args.type === "scaling" ) {
            try {
                const response = await apiClient.get<ScalingMasterDetails>(
                    `/management/guild/${ args.guildId }/scaling/${ args.masterChannelId }`
                );

                return this.setState( {
                    scalingMasterDetails: response.data,
                    isLoading: false,
                    lastRefreshTimestamp: Date.now()
                } );
            } catch ( error ) {
                return this.setState( {
                    error: error instanceof Error ? error.message : "Failed to load scaling master details",
                    isLoading: false
                } );
            }
        }

        return this.setState( { isLoading: false } );
    }
}

export class UpdateScalingSettingsCommand extends CommandBase<ManagementState, {
    guildId: string;
    masterChannelId: string;
    settings: UpdateScalingSettingsInput;
}> {
    public static getName(): string {
        return "Dashboard/Management/UpdateScalingSettings";
    }

    public async apply( args: { guildId: string; masterChannelId: string; settings: UpdateScalingSettingsInput } ) {
        this.setState( { isSaving: true, error: null } );

        try {
            await apiClient.put(
                `/management/guild/${ args.guildId }/scaling/${ args.masterChannelId }`,
                args.settings
            );

            // Reload the scaling master details
            const response = await apiClient.get<ScalingMasterDetails>(
                `/management/guild/${ args.guildId }/scaling/${ args.masterChannelId }`
            );

            return this.setState( {
                scalingMasterDetails: response.data,
                isSaving: false,
                isEditingConfig: false
            } );
        } catch ( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to update scaling settings",
                isSaving: false
            } );
        }
    }
}

export class TriggerReindexCommand extends CommandBase<ManagementState, {
    guildId: string;
    masterChannelId: string;
}> {
    public static getName(): string {
        return "Dashboard/Management/TriggerReindex";
    }

    public async apply( args: { guildId: string; masterChannelId: string } ) {
        this.setState( { isSaving: true, error: null } );

        try {
            await apiClient.post(
                `/management/guild/${ args.guildId }/scaling/${ args.masterChannelId }/reindex`
            );

            return this.setState( { isSaving: false } );
        } catch ( error: unknown ) {
            let errorMessage = "Failed to trigger reindex";

            if ( error && typeof error === "object" ) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };

                if ( axiosError.response?.data?.message ) {
                    errorMessage = axiosError.response.data.message;
                } else if ( axiosError.message ) {
                    errorMessage = axiosError.message;
                }
            }

            return this.setState( {
                error: errorMessage,
                isSaving: false
            } );
        }
    }
}

export class TriggerCleanupCommand extends CommandBase<ManagementState, {
    guildId: string;
    masterChannelId: string;
}> {
    public static getName(): string {
        return "Dashboard/Management/TriggerCleanup";
    }

    public async apply( args: { guildId: string; masterChannelId: string } ) {
        this.setState( { isSaving: true, error: null } );

        try {
            await apiClient.post(
                `/management/guild/${ args.guildId }/scaling/${ args.masterChannelId }/cleanup`
            );

            return this.setState( { isSaving: false } );
        } catch ( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to trigger cleanup",
                isSaving: false
            } );
        }
    }
}

export class DeleteScalingSetupCommand extends CommandBase<ManagementState, {
    guildId: string;
    masterChannelId: string;
}> {
    public static getName(): string {
        return "Dashboard/Management/DeleteScalingSetup";
    }

    public async apply( args: { guildId: string; masterChannelId: string } ) {
        this.setState( { isSaving: true, error: null } );

        try {
            await apiClient.delete(
                `/management/guild/${ args.guildId }/scaling/${ args.masterChannelId }`
            );

            // Optimistic update - remove the deleted item from the list immediately
            // The bot processes the delete asynchronously via IPC, so refetching would show stale data
            const currentDetails = this.getState().managementDetails;
            const updatedDetails = currentDetails ? {
                ...currentDetails,
                scalingMasterChannels: currentDetails.scalingMasterChannels.filter(
                    ( channel ) => channel.id !== args.masterChannelId
                )
            } : null;

            return this.setState( {
                managementDetails: updatedDetails,
                selectedMasterChannelId: null,
                selectedMasterChannelType: null,
                scalingMasterDetails: null,
                isSaving: false,
                showDeleteConfirm: false,
                isEditingConfig: false
            } );
        } catch ( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to delete scaling setup",
                isSaving: false
            } );
        }
    }
}

export class ClearErrorCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/ClearError";
    }

    public apply() {
        return this.setState( { error: null } );
    }
}

export class ShowCreateModalCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/ShowCreateModal";
    }

    public apply() {
        return this.setState( { showCreateModal: true } );
    }
}

export class HideCreateModalCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/HideCreateModal";
    }

    public apply() {
        return this.setState( { showCreateModal: false } );
    }
}

export class StartEditingConfigCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/StartEditingConfig";
    }

    public apply() {
        const settings = this.getState().scalingMasterDetails?.master.settings;

        return this.setState( {
            isEditingConfig: true,
            configForm: {
                prefix: settings?.scalingChannelPrefix || "",
                maxMembers: settings?.scalingChannelMaxMembersPerChannel || 0,
                minAvailable: settings?.scalingChannelMinAvailableChannels || 1
            }
        } );
    }
}

export class StopEditingConfigCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/StopEditingConfig";
    }

    public apply() {
        return this.setState( { isEditingConfig: false } );
    }
}

export class ShowDeleteConfirmCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/ShowDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: true } );
    }
}

export class HideDeleteConfirmCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/HideDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: false } );
    }
}

export class UpdateConfigPrefixCommand extends CommandBase<ManagementState, { value: string }> {
    public static getName(): string {
        return "Dashboard/Management/UpdateConfigPrefix";
    }

    public apply( args: { value: string } ) {
        return this.setState( {
            configForm: {
                ...this.getState().configForm,
                prefix: args.value
            }
        } );
    }
}

export class UpdateConfigMaxMembersCommand extends CommandBase<ManagementState, { value: number }> {
    public static getName(): string {
        return "Dashboard/Management/UpdateConfigMaxMembers";
    }

    public apply( args: { value: number } ) {
        return this.setState( {
            configForm: {
                ...this.getState().configForm,
                maxMembers: Math.max( 0, args.value )
            }
        } );
    }
}

export class UpdateConfigMinAvailableCommand extends CommandBase<ManagementState, { value: number }> {
    public static getName(): string {
        return "Dashboard/Management/UpdateConfigMinAvailable";
    }

    public apply( args: { value: number } ) {
        return this.setState( {
            configForm: {
                ...this.getState().configForm,
                minAvailable: Math.max( 1, args.value )
            }
        } );
    }
}

export class ResetConfigFormCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/ResetConfigForm";
    }

    public apply() {
        const settings = this.getState().scalingMasterDetails?.master.settings;

        return this.setState( {
            configForm: {
                prefix: settings?.scalingChannelPrefix || "",
                maxMembers: settings?.scalingChannelMaxMembersPerChannel || 0,
                minAvailable: settings?.scalingChannelMinAvailableChannels || 1
            }
        } );
    }
}
