import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

export class DeleteScalingSetupCommand extends ManagementCommandBase<{ masterChannelId: string }> {
    public static getName(): string {
        return "Dashboard/Management/DeleteScalingSetup";
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

            await queryModule.request( "Dashboard/Management/DeleteScalingSetup", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            const updatedScalingMasters = managementDetails.scalingMasterChannels.filter(
                ( channel ) => channel.id !== args.masterChannelId
            );

            return this.setState( {
                managementDetails: { ...managementDetails, scalingMasterChannels: updatedScalingMasters },
                selectedMasterChannelId: null,
                selectedMasterChannelType: null,
                isSaving: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to delete scaling setup",
                isSaving: false
            } );
        }
    }
}
