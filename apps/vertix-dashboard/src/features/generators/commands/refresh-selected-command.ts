import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { ScalingMasterDetails, DynamicMasterDetails } from "@vertix.gg/dashboard/src/features/generators/types";

export class RefreshSelectedCommand extends GeneratorsCommandBase {
    public static getName(): string {
        return "Dashboard/Generators/RefreshSelected";
    }

    protected async run() {
        const { selectedMasterChannelId, selectedMasterChannelType } = this.state;
        const generatorsDetails = this.generatorsDetails;

        if ( !selectedMasterChannelId || !selectedMasterChannelType || !generatorsDetails ) {
            return;
        }

        this.setState( {
            isRefreshing: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildGeneratorsQuery );

            if ( selectedMasterChannelType === "scaling" ) {
                const data = await queryModule.request<ScalingMasterDetails>( "Dashboard/Generators/GetScalingDetails", {
                    guildId: this.guildId,
                    masterChannelId: selectedMasterChannelId
                } );

                const updatedScalingMasters = generatorsDetails.scalingMasterChannels.map( ( master ) =>
                    master.id === selectedMasterChannelId
                        ? { ...master, ...data.master, scalingChannels: data.scalingChannels, discord: data.discord }
                        : master
                );

                return this.setState( {
                    generatorsDetails: { ...generatorsDetails, scalingMasterChannels: updatedScalingMasters },
                    isRefreshing: false,
                    lastRefreshTimestamp: Date.now()
                } );
            } else {
                const data = await queryModule.request<DynamicMasterDetails>( "Dashboard/Generators/GetDynamicDetails", {
                    guildId: this.guildId,
                    masterChannelId: selectedMasterChannelId
                } );

                const updatedDynamicMasters = generatorsDetails.dynamicMasterChannels.map( ( master ) =>
                    master.id === selectedMasterChannelId
                        ? { ...master, ...data.master, dynamicChannels: data.dynamicChannels, discord: data.discord }
                        : master
                );

                return this.setState( {
                    generatorsDetails: { ...generatorsDetails, dynamicMasterChannels: updatedDynamicMasters },
                    isRefreshing: false,
                    lastRefreshTimestamp: Date.now()
                } );
            }
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to refresh",
                isRefreshing: false
            } );
        }
    }
}
