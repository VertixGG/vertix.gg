import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { CreateDynamicSetupInput } from "@vertix.gg/dashboard/src/features/management/types";

export class CreateDynamicSetupCommand extends ManagementCommandBase<{ input: CreateDynamicSetupInput }> {
    public static getName(): string {
        return "Dashboard/Management/CreateDynamicSetup";
    }

    protected async run( args: { input: CreateDynamicSetupInput } ) {
        const initialCount = this.managementDetails?.dynamicMasterChannels.length ?? 0;

        this.setState( {
            isCreating: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildManagementQuery );

            await queryModule.request( "Dashboard/Management/CreateDynamicSetup", {
                guildId: this.guildId,
                ...args.input
            } );

            // Poll for setup completion
            const updatedDetails = await this.pollForSetupCompletion( "dynamic", initialCount );

            return this.setState( {
                managementDetails: updatedDetails ?? this.managementDetails,
                isCreating: false,
                showCreateModal: false,
                createModalType: null
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to create dynamic setup",
                isCreating: false
            } );
        }
    }
}
