import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

export class DeleteLobbySetupCommand extends GeneratorsCommandBase<{ masterChannelId: string }> {
    public static getName(): string {
        return "Dashboard/Generators/DeleteLobbySetup";
    }

    protected async perform( args: { masterChannelId: string } ) {
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

            await queryModule.request( "Dashboard/Generators/DeleteLobbySetup", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            const updatedLobbyMasters = ( generatorsDetails.lobbyMasterChannels ?? [] ).filter(
                ( channel ) => channel.id !== args.masterChannelId
            );

            return this.setState( {
                generatorsDetails: { ...generatorsDetails, lobbyMasterChannels: updatedLobbyMasters },
                selectedMasterChannelId: null,
                selectedMasterChannelType: null,
                isSaving: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to delete team lobby",
                isSaving: false
            } );
        }
    }
}
