import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { ScalingMasterDetails, DynamicMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

export class RefreshSelectedCommand extends ManagementCommandBase {
    public static getName(): string {
        return "Dashboard/Management/RefreshSelected";
    }

    protected async run() {
        const { selectedMasterChannelId, selectedMasterChannelType } = this.state;
        const managementDetails = this.managementDetails;

        if ( !selectedMasterChannelId || !selectedMasterChannelType || !managementDetails ) {
            return;
        }

        this.setState( {
            isLoading: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildManagementQuery );

            if ( selectedMasterChannelType === "scaling" ) {
                const data = await queryModule.request<ScalingMasterDetails>( "Dashboard/Management/GetScalingDetails", {
                    guildId: this.guildId,
                    masterChannelId: selectedMasterChannelId
                } );

                const updatedScalingMasters = managementDetails.scalingMasterChannels.map( ( master ) =>
                    master.id === selectedMasterChannelId
                        ? { ...master, ...data.master, scalingChannels: data.scalingChannels, discord: data.discord }
                        : master
                );

                return this.setState( {
                    managementDetails: { ...managementDetails, scalingMasterChannels: updatedScalingMasters },
                    isLoading: false,
                    lastRefreshTimestamp: Date.now()
                } );
            } else {
                const data = await queryModule.request<DynamicMasterDetails>( "Dashboard/Management/GetDynamicDetails", {
                    guildId: this.guildId,
                    masterChannelId: selectedMasterChannelId
                } );

                const updatedDynamicMasters = managementDetails.dynamicMasterChannels.map( ( master ) =>
                    master.id === selectedMasterChannelId
                        ? { ...master, ...data.master, dynamicChannels: data.dynamicChannels, discord: data.discord }
                        : master
                );

                return this.setState( {
                    managementDetails: { ...managementDetails, dynamicMasterChannels: updatedDynamicMasters },
                    isLoading: false,
                    lastRefreshTimestamp: Date.now()
                } );
            }
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to refresh",
                isLoading: false
            } );
        }
    }
}
