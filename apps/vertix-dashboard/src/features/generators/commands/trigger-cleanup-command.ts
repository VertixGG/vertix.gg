import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { ScalingMasterDetails } from "@vertix.gg/dashboard/src/features/generators/types";

export class TriggerCleanupCommand extends GeneratorsCommandBase<{ masterChannelId: string }> {
    public static getName(): string {
        return "Dashboard/Generators/TriggerCleanup";
    }

    protected async run( args: { masterChannelId: string } ) {
        const generatorsDetails = this.generatorsDetails;

        if ( !generatorsDetails ) {
            return this.setState( { error: "No generator details loaded" } );
        }

        this.setState( {
            isSaving: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildGeneratorsQuery );

            await queryModule.request( "Dashboard/Generators/TriggerCleanup", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            // Refresh the scaling master details
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
