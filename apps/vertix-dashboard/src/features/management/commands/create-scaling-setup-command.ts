import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { CreateScalingSetupInput } from "@vertix.gg/dashboard/src/features/management/types";

export class CreateScalingSetupCommand extends ManagementCommandBase<{ input: CreateScalingSetupInput }> {
    public static getName(): string {
        return "Dashboard/Management/CreateScalingSetup";
    }

    protected async run( args: { input: CreateScalingSetupInput } ) {
        const initialCount = this.managementDetails?.scalingMasterChannels.length ?? 0;

        this.setState( {
            isCreating: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildManagementQuery );

            await queryModule.request( "Dashboard/Management/CreateScalingSetup", {
                guildId: this.guildId,
                ...args.input
            } );

            // Poll for setup completion
            const updatedDetails = await this.pollForSetupCompletion( "scaling", initialCount );

            return this.setState( {
                managementDetails: updatedDetails ?? this.managementDetails,
                isCreating: false,
                showCreateModal: false,
                createModalType: null
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to create scaling setup",
                isCreating: false
            } );
        }
    }
}
