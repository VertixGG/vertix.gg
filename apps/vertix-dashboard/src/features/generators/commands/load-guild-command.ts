import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { GeneratorsState } from "./base";
import type {
    GuildGeneratorsDetails,
    GuildDiscordOptions
} from "@vertix.gg/dashboard/src/features/generators/types";

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

            // The roles and channels the forms offer come from Discord, so they are fetched
            // beside the guild rather than when a form opens - a form that has to wait for them
            // renders its selects empty first.
            const [ data, discordOptions ] = await Promise.all( [
                queryModule.request<GuildGeneratorsDetails>( "Dashboard/Generators", {
                    guildId: args.guildId
                } ),
                queryModule
                    .request<GuildDiscordOptions>( "Dashboard/Generators/GetDiscordOptions", {
                        guildId: args.guildId
                    } )
                    .catch( () => null )
            ] );

            return this.setState( {
                generatorsDetails: data,
                // An endpoint that failed answers with an error body, which resolves like any
                // other response; only something carrying both lists is the options.
                discordOptions: Array.isArray( discordOptions?.roles ) && Array.isArray( discordOptions?.textChannels )
                    ? discordOptions
                    : null,
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
