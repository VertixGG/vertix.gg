import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { ScalingMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

export class TriggerCleanupCommand extends ManagementCommandBase<{ masterChannelId: string }> {
    public static getName(): string {
        return "Dashboard/Management/TriggerCleanup";
    }

    protected async run( args: { masterChannelId: string } ) {
        const managementDetails = this.managementDetails;

        if ( !managementDetails ) {
            return this.setState( { error: "No management details loaded" } );
        }

        this.setState( {
            isSaving: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildManagementQuery );

            await queryModule.request( "Dashboard/Management/TriggerCleanup", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            // Refresh the scaling master details
            const data = await queryModule.request<ScalingMasterDetails>( "Dashboard/Management/GetScalingDetails", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            const updatedScalingMasters = managementDetails.scalingMasterChannels.map( ( master ) =>
                master.id === args.masterChannelId
                    ? { ...master, ...data.master, scalingChannels: data.scalingChannels, discord: data.discord }
                    : master
            );

            return this.setState( {
                managementDetails: { ...managementDetails, scalingMasterChannels: updatedScalingMasters },
                isSaving: false,
                lastRefreshTimestamp: Date.now()
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to trigger cleanup",
                isSaving: false
            } );
        }
    }
}
