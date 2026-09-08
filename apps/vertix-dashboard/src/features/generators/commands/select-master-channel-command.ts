import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { MasterChannelType, ScalingMasterDetails, DynamicMasterDetails } from "@vertix.gg/dashboard/src/features/generators/types";

export class SelectMasterChannelCommand extends GeneratorsCommandBase<{
    masterChannelId: string | null;
    type: MasterChannelType | null;
}> {
    public static getName(): string {
        return "Dashboard/Generators/SelectMasterChannel";
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
            const queryModule = getQueryModule( GuildGeneratorsQuery );
            const generatorsDetails = this.generatorsDetails;

            if ( !generatorsDetails ) {
                return this.setState( {
                    error: "No generator details loaded",
                    isLoading: false
                } );
            }

            if ( args.type === "scaling" ) {
                const data = await queryModule.request<ScalingMasterDetails>( "Dashboard/Generators/GetScalingDetails", {
                    guildId: this.guildId,
                    masterChannelId: args.masterChannelId
                } );

                const updatedScalingMasters = generatorsDetails.scalingMasterChannels.map( ( master ) =>
                    master.id === args.masterChannelId
                        ? { ...master, ...data.master, scalingChannels: data.scalingChannels, discord: data.discord }
                        : master
                );

                return this.setState( {
                    generatorsDetails: { ...generatorsDetails, scalingMasterChannels: updatedScalingMasters },
                    isLoading: false,
                    lastRefreshTimestamp: Date.now()
                } );
            } else {
                const data = await queryModule.request<DynamicMasterDetails>( "Dashboard/Generators/GetDynamicDetails", {
                    guildId: this.guildId,
                    masterChannelId: args.masterChannelId
                } );

                const updatedDynamicMasters = generatorsDetails.dynamicMasterChannels.map( ( master ) =>
                    master.id === args.masterChannelId
                        ? { ...master, ...data.master, dynamicChannels: data.dynamicChannels, discord: data.discord }
                        : master
                );

                return this.setState( {
                    generatorsDetails: { ...generatorsDetails, dynamicMasterChannels: updatedDynamicMasters },
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
