import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import type { Client, Guild } from "discord.js";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

export async function guildGetMemberDisplayName( guild: string, userId: string ): Promise<string>;
export async function guildGetMemberDisplayName( guild: Guild, userId: string ): Promise<string>;
export async function guildGetMemberDisplayName( guild: Guild | string, userId: string ): Promise<string> {
    if ( "string" === typeof guild ) {
        const appService = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" ),
            client = appService.getClient();

        let result = client.guilds.cache.get( guild );

        if ( !result ) {
            result = await client.guilds.fetch( guild );
        }

        if ( result ) {
            guild = result;
        }
    }

    let displayName = ( guild as Guild )?.members?.cache.get( userId )?.displayName;

    if ( !displayName ) {
        displayName = ( await ( guild as Guild )?.members?.fetch( userId ) )?.displayName;
    }

    return displayName || "Unknown (Disconnected from server)";
}

export async function guildGetMembersCount( guild: Guild, cache = true ): Promise<number> {
    if ( cache ) {
        return guild.memberCount;
    }

    const result = await ServiceLocator.$.get<AppService>( "VertixBot/Services/App" )
        .getClient()
        .guilds.fetch( {
            guild,
            withCounts: true
        } )
        .catch( ( e: Error ) => {
            GlobalLogger.$.error( guildGetMembersCount, e.message, e );
        } );

    return result?.memberCount || 0;
}

const leavingGuildIds = new Set<string>();

export async function guildLeaveBecauseNotInDatabase( client: Client, guildId: string ): Promise<void> {
    if ( leavingGuildIds.has( guildId ) ) {
        return;
    }

    leavingGuildIds.add( guildId );

    try {
        const guild = client.guilds.cache.get( guildId ) || ( await client.guilds.fetch( guildId ).catch( () => null ) );

        if ( !guild ) {
            GlobalLogger.$.warn(
                guildLeaveBecauseNotInDatabase,
                `Guild id: '${ guildId }' - Can't exit from guild because it's not found in cache/fetch`
            );
            return;
        }

        await guild.leave();

        GlobalLogger.$.info(
            guildLeaveBecauseNotInDatabase,
            `Guild id: '${ guildId }' - Exited from guild: '${ guild.name }' because it's not in database`
        );
    } catch( reason ) {
        const error = reason instanceof Error ? reason : new Error( String( reason ) );

        GlobalLogger.$.error(
            guildLeaveBecauseNotInDatabase,
            `Guild id: '${ guildId }' - Failed to exit from guild because it's not in database`,
            error
        );
    } finally {
        leavingGuildIds.delete( guildId );
    }
}
