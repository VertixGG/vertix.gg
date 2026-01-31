import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { MasterChannelType, ScalingMasterDetails, DynamicMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

export class SelectMasterChannelCommand extends ManagementCommandBase<{
    masterChannelId: string | null;
    type: MasterChannelType | null;
}> {
    public static getName(): string {
        return "Dashboard/Management/SelectMasterChannel";
    }

    public apply( args: { masterChannelId: string | null; type: MasterChannelType | null } ) {
        // Deselection doesn't require guild validation
        if ( !args.masterChannelId ) {
            return this.setState( {
                selectedMasterChannelId: null,
                selectedMasterChannelType: null
            } );
        }

        // Selection requires guild - delegate to base
        return super.apply( args );
    }

    protected async run( args: { masterChannelId: string | null; type: MasterChannelType | null } ) {
        this.setState( {
            selectedMasterChannelId: args.masterChannelId,
            selectedMasterChannelType: args.type,
            isLoading: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildManagementQuery );
            const managementDetails = this.managementDetails;

            if ( !managementDetails ) {
                return this.setState( {
                    error: "No management details loaded",
                    isLoading: false
                } );
            }

            if ( args.type === "scaling" ) {
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
                    isLoading: false,
                    lastRefreshTimestamp: Date.now()
                } );
            } else {
                const data = await queryModule.request<DynamicMasterDetails>( "Dashboard/Management/GetDynamicDetails", {
                    guildId: this.guildId,
                    masterChannelId: args.masterChannelId
                } );

                const updatedDynamicMasters = managementDetails.dynamicMasterChannels.map( ( master ) =>
                    master.id === args.masterChannelId
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
                error: error instanceof Error ? error.message : "Failed to load channel details",
                isLoading: false
            } );
        }
    }
}
