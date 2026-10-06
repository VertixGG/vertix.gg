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

    const generatorRooms = jest.spyOn( client.guildGeneratorActivityDay, "groupBy" ).mockResolvedValue( [
        { generatorId: A_GENERATOR, _sum: { roomsCreated: 9 } },
        { generatorId: "840000000000000099", _sum: { roomsCreated: 4 } }
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

    return { asked, generatorRooms, read: async() => ( await getGuildDetails( A_GUILD ) )! };
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

    it( "should name the generator by its channel's name, as the bot has it", async() => {
        const { read } = await makeGuildDetails( {
            channelInfo: {
                masterChannel: { id: A_GENERATOR, name: "➕ New Room", memberCount: 0, position: 0 },
                category: null,
                dynamicChannels: []
            }
        } );

        expect( ( await read() ).masterChannels[ 0 ].name ).toBe( "➕ New Room" );
    } );

    it( "should leave the generator unnamed when the bot could not say", async() => {
        const { read } = await makeGuildDetails( { channelInfo: null } );

        expect( ( await read() ).masterChannels[ 0 ].name ).toBeNull();
    } );

    it( "should give each generator the rooms it made over the activity window, by its discord id", async() => {
        const { read, generatorRooms } = await makeGuildDetails();

        const [ generator ] = ( await read() ).masterChannels;

        // The other generator's count belongs to a channel this server no longer has - nothing to put it on.
        expect( generator.roomsInWindow ).toBe( 9 );
        expect( generatorRooms.mock.calls[ 0 ][ 0 ] ).toMatchObject( { by: [ "generatorId" ], where: { guildId: A_GUILD } } );
    } );

    it( "should read a generator with no rooms in the window as none, not as unknown", async() => {
        const { read, generatorRooms } = await makeGuildDetails();

        generatorRooms.mockResolvedValue( [] as never );

        expect( ( await read() ).masterChannels[ 0 ].roomsInWindow ).toBe( 0 );
    } );
} );

const DAY_MS = 24 * 60 * 60 * 1000;

/** Late in a UTC day, so a window of days is not the same as that many twenty-four hours. */
const NOW = new Date( "2026-12-01T22:00:00.000Z" );

const midnightDaysAgo = ( days: number ) => new Date( Date.UTC( 2026, 11, 1 ) - days * DAY_MS );

/**
 * The figures the home page reads off the counts the bot keeps - rooms per day, and events.
 */
describe( "VertixAPI/DashboardService/stats", () => {
    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    } );

    async function getClient() {
        const { PrismaBotClient } = await import( "@vertix.gg/prisma/bot-client" );

        return PrismaBotClient.$.getClient();
    }

    it( "should add up the rooms made across every server in the last week, and the servers they were made in", async() => {
        const client = await getClient();

        jest.spyOn( client.guild, "count" ).mockResolvedValue( 3 as never );
        jest.spyOn( client.channel, "count" ).mockResolvedValue( 0 as never );
        jest.spyOn( client.channel, "groupBy" ).mockResolvedValue( [] as never );
        jest.spyOn( client.user, "count" ).mockResolvedValue( 0 as never );

        const findMany = jest.spyOn( client.guildActivityDay, "findMany" ).mockResolvedValue( [
            { guildId: A_GUILD, roomsCreated: 4 },
            { guildId: A_GUILD, roomsCreated: 2 },
            { guildId: ANOTHER_GUILD, roomsCreated: 1 }
        ] as never );

        const { getGlobalStats } = await import( "@vertix.gg/api/src/server/services/dashboard-service" );

        const stats = await getGlobalStats();

        expect( stats ).toMatchObject( { roomsThisWeek: 7, activeThisWeek: 2 } );
        expect( findMany.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
            where: { day: { gte: midnightDaysAgo( 6 ) }, roomsCreated: { gt: 0 } }
        } );
    } );

    /**
     * A server's activity, with what the rest of its tests do not care about answered as nothing - its
     * hours and its members - unless a test says otherwise.
     */
    async function stubGuildActivity( members: { thisWeek: number; lastWeek: number; inWindow: number; countedSince: Date | null } = {
        thisWeek: 0,
        lastWeek: 0,
        inWindow: 0,
        countedSince: null
    } ) {
        const client = await getClient();

        const { GuildVoiceMemberModel } = await import( "@vertix.gg/data/src/models/guild-voice-member-model" );

        const days = jest.spyOn( client.guildActivityDay, "findMany" ).mockResolvedValue( [] as never ),
            hours = jest.spyOn( client.guildActivityHour, "findMany" ).mockResolvedValue( [] as never );

        jest.spyOn( client.guildActivityDay, "findFirst" ).mockResolvedValue( null as never );
        jest.spyOn( client.guildActivityHour, "findFirst" ).mockResolvedValue( null as never );

        const countMembers = jest.fn( async( _guildId: string, from: Date, _to: Date ) => {
            // Told apart by where each count starts: the week, the week before, and the month.
            if ( from.getTime() === midnightDaysAgo( 6 ).getTime() ) {
                return members.thisWeek;
            }

            return from.getTime() === midnightDaysAgo( 13 ).getTime() ? members.lastWeek : members.inWindow;
        } );

        jest.spyOn( GuildVoiceMemberModel, "$", "get" ).mockReturnValue( {
            countMembers,
            getCountedSince: async() => members.countedSince
        } as never );

        const { getGuildActivity } = await import( "@vertix.gg/api/src/server/services/dashboard-service" );

        return { client, days, hours, countMembers, read: () => getGuildActivity( A_GUILD ) };
    }

    it( "should read a server's rooms per day over the window, with the day counting began", async() => {
        const { client, days, read } = await stubGuildActivity();

        days.mockResolvedValue( [ { day: midnightDaysAgo( 0 ), roomsCreated: 3 } ] as never );

        jest.spyOn( client.guildActivityDay, "findFirst" ).mockResolvedValue( { day: midnightDaysAgo( 12 ) } as never );

        const activity = await read();

        expect( activity ).toMatchObject( { roomsThisWeek: 3, countedSince: "2026-11-19" } );
        expect( activity.days.at( -1 ) ).toEqual( { day: "2026-12-01", count: 3 } );
        expect( days.mock.calls[ 0 ][ 0 ] ).toMatchObject( { where: { guildId: A_GUILD, day: { gte: midnightDaysAgo( 29 ) } } } );
    } );

    it( "should read a server's own rooms by the hour over the hours window, with the hour counting began", async() => {
        const { client, hours, read } = await stubGuildActivity();

        hours.mockResolvedValue( [
            { hour: new Date( "2026-12-01T20:00:00.000Z" ), roomsCreated: 2 },
            { hour: new Date( "2026-11-30T09:00:00.000Z" ), roomsCreated: 1 }
        ] as never );

        jest.spyOn( client.guildActivityHour, "findFirst" ).mockResolvedValue( { hour: new Date( "2026-11-20T10:00:00.000Z" ) } as never );

        const activity = await read();

        expect( activity.roomsPerHour ).toEqual( [
            { hour: "2026-11-30T09:00:00.000Z", count: 1 },
            { hour: "2026-12-01T20:00:00.000Z", count: 2 }
        ] );
        expect( activity.hoursCountedSince ).toBe( "2026-11-20T10:00:00.000Z" );
        expect( hours.mock.calls[ 0 ][ 0 ] ).toMatchObject( { where: { guildId: A_GUILD } } );
    } );

    it( "should count the members in the server's rooms this week, the week before and over the window", async() => {
        const { countMembers, read } = await stubGuildActivity( {
            thisWeek: 12,
            lastWeek: 9,
            inWindow: 30,
            countedSince: midnightDaysAgo( 40 )
        } );

        const activity = await read();

        expect( activity ).toMatchObject( {
            membersThisWeek: 12,
            membersLastWeek: 9,
            membersInWindow: 30,
            membersCountedSince: "2026-10-22"
        } );

        // Today included - up to the start of tomorrow.
        expect( countMembers ).toHaveBeenCalledWith( A_GUILD, midnightDaysAgo( 6 ), midnightDaysAgo( -1 ) );
        expect( countMembers ).toHaveBeenCalledWith( A_GUILD, midnightDaysAgo( 13 ), midnightDaysAgo( 6 ) );
    } );

    it( "should read the attendance of the ended runs only", async() => {
        const client = await getClient();

        jest.spyOn( client.guildEventSettings, "findUnique" ).mockResolvedValue( { enabled: true } as never );
        jest.spyOn( client.guildEventRun, "findMany" ).mockResolvedValue( [
            { id: "ended", phase: "ended", minVoiceSeconds: null },
            { id: "running", phase: "running", minVoiceSeconds: null }
        ] as never );

        const attendees = jest.spyOn( client.guildEventAttendee, "findMany" ).mockResolvedValue( [
            { runId: "ended", userId: "1", displayName: "Maya", interested: true, checkedInAt: NOW, late: false, voiceSeconds: 600 }
        ] as never );

        const { getGuildEventsStats } = await import( "@vertix.gg/api/src/server/services/dashboard-service" );

        const stats = await getGuildEventsStats( A_GUILD );

        expect( stats ).toMatchObject( { isEnabled: true, held: 1, came: 1 } );
        expect( attendees.mock.calls[ 0 ][ 0 ] ).toMatchObject( { where: { runId: { in: [ "ended" ] } } } );
    } );

    it( "should not ask for attendance when no event has ended", async() => {
        const client = await getClient();

        jest.spyOn( client.guildEventSettings, "findUnique" ).mockResolvedValue( null as never );
        jest.spyOn( client.guildEventRun, "findMany" ).mockResolvedValue( [] as never );

        const attendees = jest.spyOn( client.guildEventAttendee, "findMany" );

        const { getGuildEventsStats } = await import( "@vertix.gg/api/src/server/services/dashboard-service" );

        expect( await getGuildEventsStats( A_GUILD ) ).toMatchObject( { isEnabled: false, held: 0, regulars: [] } );
        expect( attendees ).not.toHaveBeenCalled();
    } );
} );
