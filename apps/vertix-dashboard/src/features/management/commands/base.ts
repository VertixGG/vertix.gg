import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type {
    GuildManagementDetails,
    MasterChannelType
} from "@vertix.gg/dashboard/src/features/management/types";

export type CreateModalType = "scaling" | "dynamic" | null;

export interface ManagementState {
    guildId: string | null;
    managementDetails: GuildManagementDetails | null;
    selectedMasterChannelId: string | null;
    selectedMasterChannelType: MasterChannelType | null;
    isSaving: boolean;
    isCreating: boolean;
    isLoading: boolean;
    error: string | null;
    lastRefreshTimestamp: number;
    showCreateModal: boolean;
    createModalType: CreateModalType;
}

export const MANAGEMENT_INITIAL_STATE: ManagementState = {
    guildId: null,
    managementDetails: null,
    selectedMasterChannelId: null,
    selectedMasterChannelType: null,
    isSaving: false,
    isCreating: false,
    isLoading: false,
    error: null,
    lastRefreshTimestamp: 0,
    showCreateModal: false,
    createModalType: null
};

/**
 * Base command for management commands that require a guild ID.
 * Automatically validates guildId before executing the command.
 */
export abstract class ManagementCommandBase<TArgs = void> extends CommandBase<ManagementState, TArgs> {
    protected get guildId(): string {
        return this.state.guildId!;
    }

    protected get managementDetails(): GuildManagementDetails | null {
        return this.state.managementDetails;
    }

    public apply( args: TArgs ) {
        if ( !this.state.guildId ) {
            return this.setState( { error: "No guild selected" } );
        }

        return this.run( args );
    }

    protected abstract run( args: TArgs ): unknown;

    protected async pollForSetupCompletion(
        type: "scaling" | "dynamic",
        initialCount: number,
        maxAttempts = 10,
        intervalMs = 500
    ): Promise<GuildManagementDetails | null> {
        const queryModule = getQueryModule( GuildManagementQuery );

        for ( let attempt = 0; attempt < maxAttempts; attempt++ ) {
            await new Promise( ( resolve ) => setTimeout( resolve, intervalMs ) );

            try {
                const data = await queryModule.request<GuildManagementDetails>( "Dashboard/Management", {
                    guildId: this.guildId
                } );

                const currentCount = type === "scaling"
                    ? data.scalingMasterChannels.length
                    : data.dynamicMasterChannels.length;

                if ( currentCount > initialCount ) {
                    return data;
                }
            } catch {
                // Continue polling on error
            }
        }

        return null;
    }
}
