import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import { useBotPresenceStore } from "@vertix.gg/dashboard/src/hooks/use-bot-presence";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { GuildBotPresence } from "@vertix.gg/dashboard/src/features/bot-presence/types";

export class BotPresenceQuery extends QueryModuleBase<GuildBotPresence> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "bot-presence/guild";
    }

    protected getResourceName(): string {
        return "bot-presence";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<GuildBotPresence, GuildBotPresence>( "Dashboard/BotPresence", {
            method: "GET",
            path: "dashboard/guild/:guildId/bot-presence",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildBotPresence> {
        return await response.json();
    }

    protected onMount( _context: DCommandSingleComponentContext, resource?: GuildBotPresence ) {
        // Published rather than kept in this component's state: the modal that acts on it lives
        // outside this component, where commander state cannot follow.
        useBotPresenceStore.getState().setPresence( resource ?? null );
    }
}
