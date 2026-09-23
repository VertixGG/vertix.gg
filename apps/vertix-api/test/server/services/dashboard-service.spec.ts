import { jest } from "@jest/globals";

import type { GetDynamicChannelInfoResponse } from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

const A_GUILD = "830000000000000001",
    ANOTHER_GUILD = "830000000000000002",
    A_GUILD_NEVER_JOINED = "830000000000000003";

/**
 * Spies on the one query before the service is imported, since it takes the client at module load.
 * `getClient()` answers the same instance every time, which is what makes that work.
 */
async function makeSelect( rows: { guildId: string }[] ) {
    const { PrismaBotClient } = await import( "@vertix.gg/prisma/bot-client" );

    const client = PrismaBotClient.$.getClient();

    const findMany = jest.spyOn( client.guild, "findMany" )
        .mockResolvedValue( rows as never );

    const { selectGuildIdsWithBot } =
        await import( "@vertix.gg/api/src/server/services/dashboard-service" );

    return { findMany, selectGuildIdsWithBot };
}

/**
 * What lets the server picker say which servers it can actually manage.
 *
 * The alternative it replaces is the reason to have it: `getGuildBotPresence()` asks Discord once
 * per server, so drawing one page of a picker for somebody who owns thirty would be thirty REST
 * calls against a rate limit, every time that page opens.
 */
describe( "VertixAPI/DashboardService/selectGuildIdsWithBot", () => {
    afterEach( () => jest.restoreAllMocks() );

    it( "should name the servers the table says the bot is in", async() => {
        const { selectGuildIdsWithBot } = await makeSelect( [ { guildId: A_GUILD } ] );

        const result = await selectGuildIdsWithBot( [ A_GUILD, ANOTHER_GUILD ] );

        expect( result.has( A_GUILD ) ).toBe( true );
        expect( result.has( ANOTHER_GUILD ) ).toBe( false );
    } );

    /**
     * A server the bot has never been in has no row at all, so it is absent rather than false -
     * which is the same answer, and only by way of the set being built from what came back.
     */
    it( "should leave out a server that has no row", async() => {
        const { selectGuildIdsWithBot } = await makeSelect( [] );

        expect( await selectGuildIdsWithBot( [ A_GUILD_NEVER_JOINED ] ) ).toEqual( new Set() );
    } );

    /**
     * Both halves of the filter matter. Without the ids it reads the whole table to answer about
     * three servers; without `isInGuild` it names every server the bot has ever been in, and the
     * picker marks a server the bot was removed from as ready to manage.
     */
    it( "should ask only about the servers it was given, and only for ones the bot is in", async() => {
        const { findMany, selectGuildIdsWithBot } = await makeSelect( [] );

        await selectGuildIdsWithBot( [ A_GUILD, ANOTHER_GUILD ] );

        expect( findMany ).toHaveBeenCalledTimes( 1 );
        expect( findMany.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
            where: { guildId: { in: [ A_GUILD, ANOTHER_GUILD ] }, isInGuild: true }
        } );
    } );

    /**
     * `guildId: { in: [] }` matches nothing, so the answer would be right either way - this is
     * about not spending a round trip to be told so, on a page that opens on every sign-in.
     */
    it( "should not ask at all when there are no servers", async() => {
        const { findMany, selectGuildIdsWithBot } = await makeSelect( [] );

        expect( await selectGuildIdsWithBot( [] ) ).toEqual( new Set() );
        expect( findMany ).not.toHaveBeenCalled();
    } );
} );

const A_GENERATOR = "840000000000000001",
    CATEGORY_CREATED_IN = "850000000000000001",
    CATEGORY_MOVED_TO = "850000000000000002";

interface IBotWorld {
    isRegistered: boolean;
    channelInfo: GetDynamicChannelInfoResponse | null;
}

/**
 * Stands up a guild with one generator, stored as created in one category, and a bot that answers
 * as `world` says - including not being there to answer at all.
 */
async function makeGuildDetails( world: Partial<IBotWorld> = {} ) {
    const settled: IBotWorld = {
        isRegistered: true,
        channelInfo: {
            masterChannel: null,
            category: { id: CATEGORY_MOVED_TO, name: "Voice Rooms", memberCount: 0, position: 0 },
            dynamicChannels: []
        },
        ... world
    };

    const { PrismaBotClient } = await import( "@vertix.gg/prisma/bot-client" );
    const { ServiceLocator } = await import( "@vertix.gg/base/src/modules/service/service-locator" );

    const client = PrismaBotClient.$.getClient();

    jest.spyOn( client.guild, "findUnique" ).mockResolvedValue( {
        guildId: A_GUILD,
        name: "A guild",
        isInGuild: true,
        createdAt: new Date(),
        lastActiveAt: null
    } as never );
    jest.spyOn( client.channel, "count" ).mockResolvedValue( 1 as never );
    jest.spyOn( client.channel, "groupBy" ).mockResolvedValue( [] as never );
    jest.spyOn( client.channel, "findMany" ).mockResolvedValue( [
        { channelId: A_GENERATOR, categoryId: CATEGORY_CREATED_IN, createdAt: new Date() }
    ] as never );

    const asked: [ string, string, string[] ][] = [];

    const managementService = {
        getConfigLimits: async() => ( { maxMasterChannels: 2, maxActiveDynamicChannels: 20 } ),
        requestDynamicChannelInfo: async( guildId: string, masterChannelId: string, dynamicChannelIds: string[] ) => {
            asked.push( [ guildId, masterChannelId, dynamicChannelIds ] );

            return settled.channelInfo;
        }
    };

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( {
        get: () => settled.isRegistered ? managementService : undefined
    } as never );

    const { getGuildDetails } = await import( "@vertix.gg/api/src/server/services/dashboard-service" );

    return { asked, read: async() => ( await getGuildDetails( A_GUILD ) )! };
}

/**
 * What the home panel draws each generator's category from.
 *
 * The stored row keeps the category a generator was created in, and nothing moves it when an admin
 * drags the generator elsewhere - so the name has to come from the bot, and so does the id printed
 * beside it, or the panel pairs one category's name with another's id.
 */
describe( "VertixAPI/DashboardService/getGuildDetails", () => {
    afterEach( () => jest.restoreAllMocks() );

    it( "should name the category the generator sits in now, with that category's own id", async() => {
        const { read } = await makeGuildDetails();

        const [ generator ] = ( await read() ).masterChannels;

        expect( generator.category ).toEqual( { id: CATEGORY_MOVED_TO, name: "Voice Rooms" } );
        expect( generator.categoryId ).toBe( CATEGORY_CREATED_IN );
    } );

    it( "should ask the bot about the generator by its discord id", async() => {
        const { read, asked } = await makeGuildDetails();

        await read();

        expect( asked ).toEqual( [ [ A_GUILD, A_GENERATOR, [] ] ] );
    } );

    it( "should leave the category unnamed when the bot could not be asked", async() => {
        const { read } = await makeGuildDetails( { channelInfo: null } );

        const [ generator ] = ( await read() ).masterChannels;

        expect( generator.category ).toBeNull();
        expect( generator.categoryId ).toBe( CATEGORY_CREATED_IN );
    } );

    it( "should read the limit and the categories as unknown before anything can ask the bot", async() => {
        const { read } = await makeGuildDetails( { isRegistered: false } );

        const details = await read();

        expect( details.maxActiveDynamicChannels ).toBeNull();
        expect( details.masterChannels[ 0 ].category ).toBeNull();
    } );
} );
