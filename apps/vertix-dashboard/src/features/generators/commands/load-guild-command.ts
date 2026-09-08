import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { GeneratorsState } from "./base";
import type { GuildGeneratorsDetails } from "@vertix.gg/dashboard/src/features/generators/types";

export class LoadGuildCommand extends CommandBase<GeneratorsState, { guildId: string }> {
    public static getName(): string {
        return "Dashboard/Generators/LoadGuildGenerators";
    }

    public async apply( args: { guildId: string } ) {
        this.setState( {
            guildId: args.guildId,
            isLoading: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildGeneratorsQuery );
            const data = await queryModule.request<GuildGeneratorsDetails>( "Dashboard/Generators", {
                guildId: args.guildId
            } );

            return this.setState( {
                generatorsDetails: data,
                isLoading: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to load generators",
                isLoading: false
            } );
        }
    }
}
