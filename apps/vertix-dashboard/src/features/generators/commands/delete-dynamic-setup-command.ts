import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

export class DeleteDynamicSetupCommand extends GeneratorsCommandBase<{ masterChannelId: string }> {
    public static getName(): string {
        return "Dashboard/Generators/DeleteDynamicSetup";
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

            await queryModule.request( "Dashboard/Generators/DeleteDynamicSetup", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            const updatedDynamicMasters = generatorsDetails.dynamicMasterChannels.filter(
                ( channel ) => channel.id !== args.masterChannelId
            );

            return this.setState( {
                generatorsDetails: { ...generatorsDetails, dynamicMasterChannels: updatedDynamicMasters },
                selectedMasterChannelId: null,
                selectedMasterChannelType: null,
                isSaving: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to delete dynamic setup",
                isSaving: false
            } );
        }
    }
}
