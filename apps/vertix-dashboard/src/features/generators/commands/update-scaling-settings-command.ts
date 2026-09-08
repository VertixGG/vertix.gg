import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { ScalingMasterDetails } from "@vertix.gg/dashboard/src/features/generators/types";

export class UpdateScalingSettingsCommand extends GeneratorsCommandBase<{
    masterChannelId: string;
    settings: {
        scalingChannelPrefix?: string;
        scalingChannelMaxMembersPerChannel?: number;
        scalingChannelMinAvailableChannels?: number;
    };
}> {
    public static getName(): string {
        return "Dashboard/Generators/UpdateScalingSettings";
    }

    protected async run( args: {
        masterChannelId: string;
        settings: {
            scalingChannelPrefix?: string;
            scalingChannelMaxMembersPerChannel?: number;
            scalingChannelMinAvailableChannels?: number;
        };
    } ) {
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

            await queryModule.request( "Dashboard/Generators/UpdateScalingSettings", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId,
                ...args.settings
            } );

            // Reload the scaling master details
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
                isSaving: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to update scaling settings",
                isSaving: false
            } );
        }
    }
}
