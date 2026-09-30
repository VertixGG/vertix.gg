import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";

import type {
    GuildDiscordOptions,
    GuildEventsSettings
} from "@vertix.gg/dashboard/src/features/events/types";

export class EventsQuery extends QueryModuleBase<GuildEventsSettings> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "events/guild-events";
    }

    protected getResourceName(): string {
        return "guild-events";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<GuildEventsSettings, GuildEventsSettings>( "Dashboard/Events/Settings", {
            method: "GET",
            path: "management/guild/:guildId/events/settings",
            prepareData: ( response ) => response
        } );

        this.register( "PUT", "Dashboard/Events/SaveSettings", "management/guild/:guildId/events/settings" );

        // The page is a path segment - the client fills in path parameters and sends no query with a
        // read. `:cursor` and `:runId` share no prefix, since each is filled by a first-match replace.
        this.register( "GET", "Dashboard/Events/Runs", "management/guild/:guildId/events/runs/:cursor" );

        this.register( "GET", "Dashboard/Events/Run", "management/guild/:guildId/events/run/:runId" );

        this.defineEndpoint<GuildDiscordOptions, GuildDiscordOptions>( "Dashboard/Events/GetDiscordOptions", {
            method: "GET",
            path: "management/guild/:guildId/discord-options",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildEventsSettings> {
        return await response.json();
    }
}
