import { Guild } from "discord.js";

import { AppManager } from "@vertix/managers/app-manager";
import GlobalLogger from "@vertix/global-logger";

export async function guildGetMemberDisplayName( guild: string, userId: string ): Promise<string>
export async function guildGetMemberDisplayName( guild: Guild, userId: string ): Promise<string>;
export async function guildGetMemberDisplayName( guild: Guild | string, userId: string ): Promise<string> {
    if ( "string" === typeof guild ) {
        const client = AppManager.$.getClient();

        let result = client.guilds.cache.get( guild );

        if ( ! result ) {
            result = await client.guilds.fetch( guild );
        }

        if ( result ) {
            guild = result;
        }
    }

    let displayName = ( guild as Guild )?.members?.cache.get( userId )?.displayName;

    if ( ! displayName ) {
        displayName = ( await ( guild as Guild )?.members?.fetch( userId ) )?.displayName;
    }

    return displayName || "Unknown (Disconnected from server)";
};

export async function guildGetMembersCount( guild: Guild, cache = true ): Promise<number> {
    if ( cache ) {
        return guild.memberCount;
    }

    const result = await AppManager.$.getClient().guilds.fetch( {
        guild,
        withCounts: true,
    } ).catch( ( e: Error ) => {
        GlobalLogger.$.error( guildGetMembersCount, e.message, e );
    } );

    return result?.memberCount || 0;
}
