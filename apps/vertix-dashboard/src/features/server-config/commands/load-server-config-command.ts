import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ServerConfigQuery } from "@vertix.gg/dashboard/src/features/server-config/query/server-config-query";

import type { ServerConfigState } from "./base";
import type { ServerConfig, GuildDiscordOptions } from "@vertix.gg/dashboard/src/features/server-config/types";

export class LoadServerConfigCommand extends CommandBase<ServerConfigState, { guildId: string }> {
    public static getName(): string {
        return "Dashboard/ServerConfig/Load";
    }

    public async apply( args: { guildId: string } ) {
        this.setState( {
            guildId: args.guildId,
            isLoading: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( ServerConfigQuery );

            // The roles come from Discord, so they are fetched beside the config rather than when
            // a form opens - a form that has to wait for them renders its selects empty first.
            const [ config, discordOptions ] = await Promise.all( [
                queryModule.request<ServerConfig>( "Dashboard/ServerConfig", {
                    guildId: args.guildId
                } ),
                queryModule
                    .request<GuildDiscordOptions>( "Dashboard/ServerConfig/GetDiscordOptions", {
                        guildId: args.guildId
                    } )
                    .catch( () => null )
            ] );

            return this.setState( {
                config,
                // An endpoint that failed answers with an error body, which resolves like any
                // other response; only something carrying both lists is the options.
                discordOptions: Array.isArray( discordOptions?.roles ) && Array.isArray( discordOptions?.textChannels )
                    ? discordOptions
                    : null,
                isLoading: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to load server config",
                isLoading: false
            } );
        }
    }
}
