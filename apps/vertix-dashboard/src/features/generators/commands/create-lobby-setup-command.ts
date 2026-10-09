import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

/**
 * Asks for a team lobby. It takes nothing - a lobby asks nothing before it is made, as `/setup` asks
 * nothing - and spends one of the server's setups, like a generator or a pool.
 */
export class CreateLobbySetupCommand extends GeneratorsCommandBase {
    public static getName(): string {
        return "Dashboard/Generators/CreateLobbySetup";
    }

    protected async perform() {
        const initialCount = this.generatorsDetails?.lobbyMasterChannels?.length ?? 0;

        this.setState( {
            isCreating: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildGeneratorsQuery );

            await queryModule.request( "Dashboard/Generators/CreateLobbySetup", {
                guildId: this.guildId
            } );

            const updatedDetails = await this.pollForSetupCompletion( "lobby", initialCount );

            return this.setState( {
                generatorsDetails: updatedDetails ?? this.generatorsDetails,
                isCreating: false,
                showCreateModal: false,
                createModalType: null
            } );
        } catch( error ) {
            // Closed on the way out, as the other two forms are, so the refusal is said over the page.
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to create team lobby",
                isCreating: false,
                showCreateModal: false,
                createModalType: null
            } );
        }
    }
}
