import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ServerConfigQuery } from "@vertix.gg/dashboard/src/features/server-config/query/server-config-query";

import type { ServerConfigState } from "./base";
import type { ServerConfigInput } from "@vertix.gg/dashboard/src/features/server-config/types";

/**
 * Command `Dashboard/ServerConfig/Update` :: Saves the server wide defaults.
 *
 * The api hands these to the bot rather than writing them itself - it has to work out which
 * generators were following the old value before the new one lands - so the answer says nothing
 * about the rows. The state is updated from what was sent, which is what the form already shows.
 */
export class UpdateServerConfigCommand extends CommandBase<ServerConfigState, { settings: ServerConfigInput }> {
    public static getName(): string {
        return "Dashboard/ServerConfig/Update";
    }

    public async apply( args: { settings: ServerConfigInput } ) {
        const { guildId, config } = this.state;

        if ( !guildId || !config ) {
            return this.setState( { error: "No server config loaded" } );
        }

        this.setState( {
            isSaving: true,
            error: null
        } );

        try {
            await getQueryModule( ServerConfigQuery ).request( "Dashboard/ServerConfig/Update", {
                guildId,
                ...args.settings
            } );

            return this.setState( {
                config: { ...config, ...args.settings },
                isSaving: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to save server config",
                isSaving: false
            } );
        }
    }
}
