import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { ManagementState } from "./base";
import type { GuildManagementDetails } from "@vertix.gg/dashboard/src/features/management/types";

export class LoadGuildCommand extends CommandBase<ManagementState, { guildId: string }> {
    public static getName(): string {
        return "Dashboard/Management/LoadGuildManagement";
    }

    public async apply( args: { guildId: string } ) {
        this.setState( {
            guildId: args.guildId,
            isLoading: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildManagementQuery );
            const data = await queryModule.request<GuildManagementDetails>( "Dashboard/Management", {
                guildId: args.guildId
            } );

            return this.setState( {
                managementDetails: data,
                isLoading: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to load management data",
                isLoading: false
            } );
        }
    }
}
