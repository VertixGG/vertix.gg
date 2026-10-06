import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import type { IAdoptionStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/**
 * Which features the servers the bot is in use.
 *
 * Every count is of servers the bot is in now: a server that removed it uses nothing, whatever rows it
 * left behind. Kept apart from where the rows come from, as the other reports are.
 */

export interface IAdoptionGeneratorRow {
    guildId: string;
    internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES;
    version: string;
}

function countServers( guildIds: string[] ) {
    return new Set( guildIds ).size;
}

/**
 * Function buildAdoptionStats() :: How many of the servers the bot is in use each feature.
 *
 * A generator that is not on the v3 interface is counted as v2, which is how the bot reads one when it
 * picks the screens to draw it with.
 */
export function buildAdoptionStats( options: {
    installedGuildIds: string[];
    generators: IAdoptionGeneratorRow[];
    eventsGuildIds: string[];
    brandingGuildIds: string[];
    customizedGuildIds: string[];
} ): IAdoptionStats {
    const installed = new Set( options.installedGuildIds ),
        inInstalled = ( guildIds: string[] ) => guildIds.filter( ( guildId ) => installed.has( guildId ) ),
        generators = options.generators.filter( ( generator ) => installed.has( generator.guildId ) );

    const dynamic = generators.filter( ( generator ) => "MASTER_CREATE_CHANNEL" === generator.internalType ),
        dynamicV3 = dynamic.filter( ( generator ) => VERSION_UI_V3 === generator.version ),
        dynamicV2 = dynamic.filter( ( generator ) => VERSION_UI_V3 !== generator.version ),
        pools = generators.filter( ( generator ) => "MASTER_SCALING_CHANNEL" === generator.internalType );

    const serversOf = ( rows: IAdoptionGeneratorRow[] ) => countServers( rows.map( ( row ) => row.guildId ) );

    return {
        installed: installed.size,
        setUp: serversOf( [ ... dynamic, ... pools ] ),
        dynamicV3: serversOf( dynamicV3 ),
        dynamicV2: serversOf( dynamicV2 ),
        pools: serversOf( pools ),
        events: countServers( inInstalled( options.eventsGuildIds ) ),
        branding: countServers( inInstalled( options.brandingGuildIds ) ),
        interfaceEdits: countServers( inInstalled( options.customizedGuildIds ) ),
        generators: {
            dynamicV3: dynamicV3.length,
            dynamicV2: dynamicV2.length,
            pools: pools.length
        }
    };
}
