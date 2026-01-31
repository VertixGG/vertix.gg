import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { ScalingMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

export class UpdateScalingSettingsCommand extends ManagementCommandBase<{
    masterChannelId: string;
    settings: {
        scalingChannelPrefix?: string;
        scalingChannelMaxMembersPerChannel?: number;
        scalingChannelMinAvailableChannels?: number;
    };
}> {
    public static getName(): string {
        return "Dashboard/Management/UpdateScalingSettings";
    }

    protected async run( args: {
        masterChannelId: string;
        settings: {
            scalingChannelPrefix?: string;
            scalingChannelMaxMembersPerChannel?: number;
            scalingChannelMinAvailableChannels?: number;
        };
    } ) {
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

            await queryModule.request( "Dashboard/Management/UpdateScalingSettings", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId,
                ...args.settings
            } );

            // Reload the scaling master details
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
