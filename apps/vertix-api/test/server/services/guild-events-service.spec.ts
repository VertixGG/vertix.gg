import { jest } from "@jest/globals";

import {
    GUILD_EVENT_RUN_PHASES,
    GUILD_EVENTS_DASHBOARD,
    GUILD_EVENTS_SAVE_CODES
} from "@vertix.gg/definitions/src/guild-events-definitions";

import type { GetGuildEventsStatusResponse } from "@vertix.gg/definitions/src/ipc-definitions";

const GUILD_ID = "830000000000000001",
    OTHER_GUILD_ID = "830000000000000002",
    USER_ID = "840000000000000001",
    CHANNEL_ID = "850000000000000001",
    APP_ID = "900000000000000001";

interface ISettingsRow {
    guildId: string;
    applicationId: string;
    enabled: boolean;
    channelId: string | null;
    subPostsEnabled: boolean;
    lastError: string | null;
}

interface IRunRow {
    id: string;
    guildId: string;
    name: string;
    occurrenceStartAt: Date;
    endedAt: Date | null;
    phase: string;
    voiceChannelId: string;
}

interface IAttendeeRow {
    runId: string;
    userId: string;
    displayName: string | null;
    interested: boolean;
    checkedInAt: Date | null;
    late: boolean;
    noShow: boolean;
    voiceSeconds: number;
    sessionStartedAt: Date | null;
}

interface IWorld {
    /** What the bot answers, or null when it cannot be asked. */
    status: GetGuildEventsStatusResponse | null;
    settings: ISettingsRow | null;
    runs: IRunRow[];
    attendees: IAttendeeRow[];
    /** Every channel the bot was asked about, in order. */
    askedChannels: ( string | null )[];
}

function makeRunId( index: number ) {
    return index.toString( 16 ).padStart( 24, "0" );
}

function makeRun( index: number, overrides: Partial<IRunRow> = {} ): IRunRow {
    return {
        id: makeRunId( index ),
        guildId: GUILD_ID,
        name: `Raid ${ index }`,
        occurrenceStartAt: new Date( Date.UTC( 2026, 8, 1 ) + index * 60 * 60 * 1000 ),
        endedAt: null,
        phase: GUILD_EVENT_RUN_PHASES.ENDED,
        voiceChannelId: "860000000000000001",
        ... overrides
    };
}

function makeAttendee( runId: string, userId: string, overrides: Partial<IAttendeeRow> = {} ): IAttendeeRow {
    return {
        runId,
        userId,
        displayName: `Member ${ userId }`,
        interested: true,
        checkedInAt: new Date(),
        late: false,
        noShow: false,
        voiceSeconds: 60,
        sessionStartedAt: null,
        ... overrides
    };
}

/**
 * Stands up the api's side of Events over a fake database and a fake bot.
 */
async function makeService( world: Partial<IWorld> = {} ) {
    const settled: IWorld = {
        status: { applicationId: APP_ID, isBotInGuild: true, missingPermissions: [] },
        settings: null,
        runs: [],
        attendees: [],
        askedChannels: [],
        ... world
    };

    const { GuildEventSettingsModel } = await import( "@vertix.gg/data/src/models/guild-event-settings-model" );
    const { GuildEventRunModel } = await import( "@vertix.gg/data/src/models/guild-event-run-model" );
    const { GuildEventsService } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    const save = jest.fn( async( guildId: string, applicationId: string, patch: Partial<ISettingsRow> ) => {
        settled.settings = {
            guildId,
            applicationId,
            enabled: false,
            channelId: null,
            subPostsEnabled: true,
            lastError: null,
            ... settled.settings,
            ... patch
        };

        return settled.settings;
    } );

    jest.spyOn( GuildEventSettingsModel, "$", "get" ).mockReturnValue( asInstance( {
        get: async() => settled.settings,
        save
    } ) );

    // Newest first, id breaking ties, the page after a cursor run - the way the model reads mongo.
    const ordered = () => settled.runs.slice().sort( ( a, b ) =>
        b.occurrenceStartAt.getTime() - a.occurrenceStartAt.getTime() || b.id.localeCompare( a.id ) );

    jest.spyOn( GuildEventRunModel, "$", "get" ).mockReturnValue( asInstance( {
        getPage: async( guildId: string, afterRunId: string | null, limit: number ) => {
            const runs = ordered().filter( ( run ) => run.guildId === guildId ),
                start = afterRunId ? runs.findIndex( ( run ) => run.id === afterRunId ) + 1 : 0;

            return runs.slice( start, start + limit + 1 );
        },
        getInGuild: async( guildId: string, runId: string ) =>
            settled.runs.find( ( run ) => run.id === runId && run.guildId === guildId ) ?? null,
        getAttendees: async( runId: string ) => settled.attendees.filter( ( attendee ) => attendee.runId === runId ),
        getAttendeesForRuns: async( runIds: string[] ) => settled.attendees.filter( ( attendee ) => runIds.includes( attendee.runId ) )
    } ) );

    const ipcService = {
        isReady: () => null !== settled.status,
        request: async( _request: string, _response: string, payload: { channelId: string | null } ) => {
            settled.askedChannels.push( payload.channelId );

            return settled.status;
        }
    };

    const service = Object.create( GuildEventsService.prototype ) as InstanceType<typeof GuildEventsService>;

    Object.assign( service, {
        logger: { warn: () => undefined },
        services: { ipcService }
    } );

    return { service, world: settled, save };
}

/**
 * The dashboard's side of Events.
 *
 * Its settings are the same row `/setup` writes, and pointing Events at a channel the bot cannot post
 * in, or saving without asking the bot at all, would leave a server whose boards fail in silence.
 */
describe( "VertixAPI/Services/GuildEvents", () => {
    afterEach( () => jest.restoreAllMocks() );

    describe( "readGuildEventsSettingsPatch()", () => {
        it( "should read the three settings, and leave out what was not sent", async() => {
            // Arrange.
            const { readGuildEventsSettingsPatch } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

            // Act & Assert.
            expect( readGuildEventsSettingsPatch( { enabled: true, channelId: CHANNEL_ID } ) ).toEqual( { enabled: true, channelId: CHANNEL_ID } );
            expect( readGuildEventsSettingsPatch( { channelId: null, subPostsEnabled: false } ) ).toEqual( { channelId: null, subPostsEnabled: false } );
        } );

        it( "should refuse anything else", async() => {
            // Arrange.
            const { readGuildEventsSettingsPatch } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

            // Act & Assert.
            expect( readGuildEventsSettingsPatch( [] ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { enabled: "yes" } ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { channelId: "not-an-id" } ) ).toBeNull();
        } );
    } );

    describe( "saveSettings()", () => {
        it( "should save a picked channel under the bot that answered", async() => {
            // Arrange.
            const { service, world } = await makeService();

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.SAVED );
            expect( world.askedChannels ).toEqual( [ CHANNEL_ID ] );
            expect( world.settings ).toMatchObject( { applicationId: APP_ID, channelId: CHANNEL_ID, enabled: false } );
        } );

        it( "should refuse to turn Events on with no channel, without asking the bot", async() => {
            // Arrange.
            const { service, world, save } = await makeService();

            // Act.
            const result = await service.saveSettings( GUILD_ID, { enabled: true }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.INVALID );
            expect( world.askedChannels ).toHaveLength( 0 );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse a channel the bot cannot post in, naming what it lacks", async() => {
            // Arrange.
            const { service, save } = await makeService( {
                status: { applicationId: APP_ID, isBotInGuild: true, missingPermissions: [ "SendMessages", "EmbedLinks" ] }
            } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result ).toEqual( {
                code: GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN,
                reasons: [ "Send Messages", "Embed Links" ]
            } );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse a channel that is not a text channel the bot can see", async() => {
            // Arrange.
            const { service } = await makeService( {
                status: { applicationId: APP_ID, isBotInGuild: true, missingPermissions: null }
            } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN );
        } );

        it( "should save nothing when the bot cannot be asked", async() => {
            // Arrange.
            const { service, save } = await makeService( { status: null } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.BOT_UNREACHABLE );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should check the channel again when Events is turned on", async() => {
            // Arrange.
            const { service, world } = await makeService( {
                settings: { guildId: GUILD_ID, applicationId: APP_ID, enabled: false, channelId: CHANNEL_ID, subPostsEnabled: true, lastError: null }
            } );

            // Act.
            await service.saveSettings( GUILD_ID, { enabled: true }, USER_ID );

            // Assert.
            expect( world.askedChannels ).toEqual( [ CHANNEL_ID ] );
            expect( world.settings?.enabled ).toBe( true );
        } );

        it( "should turn Events off when its channel is cleared", async() => {
            // Arrange.
            const { service, world } = await makeService( {
                settings: { guildId: GUILD_ID, applicationId: APP_ID, enabled: true, channelId: CHANNEL_ID, subPostsEnabled: true, lastError: null }
            } );

            // Act.
            await service.saveSettings( GUILD_ID, { channelId: null }, USER_ID );

            // Assert.
            expect( world.settings ).toMatchObject( { channelId: null, enabled: false } );
        } );

        it( "should switch the sub posts without checking the channel", async() => {
            // Arrange.
            const { service, world } = await makeService( {
                settings: { guildId: GUILD_ID, applicationId: APP_ID, enabled: true, channelId: CHANNEL_ID, subPostsEnabled: true, lastError: null }
            } );

            // Act.
            await service.saveSettings( GUILD_ID, { subPostsEnabled: false }, USER_ID );

            // Assert.
            expect( world.askedChannels ).toEqual( [ null ] );
            expect( world.settings ).toMatchObject( { subPostsEnabled: false, enabled: true, channelId: CHANNEL_ID } );
        } );
    } );

    describe( "getRuns()", () => {
        it( "should count each run's attendance by the shared rule", async() => {
            // Arrange.
            const run = makeRun( 1 );

            const { service } = await makeService( {
                runs: [ run ],
                attendees: [
                    makeAttendee( run.id, "1" ),
                    makeAttendee( run.id, "2", { late: true } ),
                    makeAttendee( run.id, "3", { checkedInAt: null, noShow: true } ),
                    makeAttendee( run.id, "4", { interested: false } )
                ]
            } );

            // Act.
            const page = await service.getRuns( GUILD_ID, GUILD_EVENTS_DASHBOARD.FIRST_PAGE_CURSOR );

            // Assert.
            expect( page?.runs[ 0 ].counts ).toEqual( { "came": 1, "late": 1, "no-show": 1, "walk-in": 1 } );
            expect( page?.nextCursor ).toBeNull();
        } );

        it( "should page newest first, and pick up after the cursor", async() => {
            // Arrange.
            const runs = Array.from( { length: GUILD_EVENTS_DASHBOARD.HISTORY_PAGE_SIZE + 5 }, ( _, index ) => makeRun( index + 1 ) );

            const { service } = await makeService( { runs } );

            // Act.
            const first = await service.getRuns( GUILD_ID, GUILD_EVENTS_DASHBOARD.FIRST_PAGE_CURSOR ),
                second = await service.getRuns( GUILD_ID, first!.nextCursor! );

            // Assert.
            expect( first?.runs ).toHaveLength( GUILD_EVENTS_DASHBOARD.HISTORY_PAGE_SIZE );
            expect( first?.runs[ 0 ].name ).toBe( `Raid ${ runs.length }` );
            expect( second?.runs ).toHaveLength( 5 );
            expect( second?.nextCursor ).toBeNull();
        } );

        it( "should answer nothing for a cursor that is not one", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act & Assert.
            expect( await service.getRuns( GUILD_ID, "not-a-cursor" ) ).toBeNull();
        } );
    } );

    describe( "getRun()", () => {
        it( "should give a run's attendance, names and all, longest in voice first", async() => {
            // Arrange.
            const run = makeRun( 1 );

            const { service } = await makeService( {
                runs: [ run ],
                attendees: [
                    makeAttendee( run.id, "1", { voiceSeconds: 60 } ),
                    makeAttendee( run.id, "2", { voiceSeconds: 600 } )
                ]
            } );

            // Act.
            const detail = await service.getRun( GUILD_ID, run.id );

            // Assert.
            expect( detail?.attendees.map( ( attendee ) => attendee.displayName ) ).toEqual( [ "Member 2", "Member 1" ] );
        } );

        it( "should count everybody there so far as having come while check-in is still open", async() => {
            // Arrange.
            const run = makeRun( 1, { phase: GUILD_EVENT_RUN_PHASES.CHECK_IN } );

            const { service } = await makeService( {
                runs: [ run ],
                attendees: [ makeAttendee( run.id, "1", { interested: false } ) ]
            } );

            // Act.
            const detail = await service.getRun( GUILD_ID, run.id );

            // Assert.
            expect( detail?.attendees[ 0 ].kind ).toBe( "came" );
        } );

        it( "should not give another server's run", async() => {
            // Arrange.
            const run = makeRun( 1, { guildId: OTHER_GUILD_ID } );

            const { service } = await makeService( { runs: [ run ] } );

            // Act & Assert.
            expect( await service.getRun( GUILD_ID, run.id ) ).toBeNull();
            expect( await service.getRun( GUILD_ID, "not-an-id" ) ).toBeNull();
        } );
    } );
} );
