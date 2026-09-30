import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GUILD_EVENTS_DASHBOARD } from "@vertix.gg/definitions/src/guild-events-definitions";

import { EventsQuery } from "@vertix.gg/dashboard/src/features/events/query/events-query";

import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands/base";
import type {
    GuildDiscordOptions,
    GuildEventRunsPage,
    GuildEventsSettings
} from "@vertix.gg/dashboard/src/features/events/types";

/**
 * Command `Dashboard/Events/Load` :: Reads a server's Events settings, the channels it can post in,
 * and the first page of its history.
 *
 * Also what "try again" runs, so it starts the page over.
 */
export class LoadEventsCommand extends CommandBase<EventsState, { guildId: string }> {
    public static getName(): string {
        return "Dashboard/Events/Load";
    }

    public async apply( args: { guildId: string } ) {
        this.setState( {
            guildId: args.guildId,
            isLoading: true,
            loadFailed: false,
            error: null,
            reasons: [],
            runs: [],
            nextCursor: null,
            openRunId: null,
            openRun: null
        } );

        const queryModule = getQueryModule( EventsQuery );

        try {
            // A read that fails answers null rather than throwing - see `AuthenticatedQueryClient`.
            const [ settings, options, page ] = await Promise.all( [
                queryModule.request<GuildEventsSettings | null>( "Dashboard/Events/Settings", { guildId: args.guildId } ),
                queryModule.request<GuildDiscordOptions | null>( "Dashboard/Events/GetDiscordOptions", { guildId: args.guildId } )
                    .catch( () => null ),
                queryModule.request<GuildEventRunsPage | null>( "Dashboard/Events/Runs", {
                    guildId: args.guildId,
                    cursor: GUILD_EVENTS_DASHBOARD.FIRST_PAGE_CURSOR
                } ).catch( () => null )
            ] );

            if ( ! settings ) {
                return this.setState( { settings: null, isLoading: false, loadFailed: true } );
            }

            return this.setState( {
                settings,
                channels: Array.isArray( options?.textChannels )
                    ? options.textChannels.filter( ( channel ) => ! channel.isAnnouncement )
                    : null,
                runs: page?.runs ?? [],
                nextCursor: page?.nextCursor ?? null,
                isLoading: false
            } );
        } catch {
            return this.setState( { settings: null, isLoading: false, loadFailed: true } );
        }
    }
}
