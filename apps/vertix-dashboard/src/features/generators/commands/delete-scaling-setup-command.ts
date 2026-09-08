import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

export class DeleteScalingSetupCommand extends GeneratorsCommandBase<{ masterChannelId: string }> {
    public static getName(): string {
        return "Dashboard/Generators/DeleteScalingSetup";
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

            await queryModule.request( "Dashboard/Generators/DeleteScalingSetup", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            const updatedScalingMasters = generatorsDetails.scalingMasterChannels.filter(
                ( channel ) => channel.id !== args.masterChannelId
            );

            return this.setState( {
                generatorsDetails: { ...generatorsDetails, scalingMasterChannels: updatedScalingMasters },
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
