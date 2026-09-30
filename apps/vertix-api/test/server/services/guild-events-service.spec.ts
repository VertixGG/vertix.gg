import { jest } from "@jest/globals";

import {
    GUILD_EVENT_RUN_PHASES,
    GUILD_EVENTS_DASHBOARD,
    GUILD_EVENTS_LIMITS,
    GUILD_EVENTS_SAVE_CODES,
    GUILD_EVENTS_SETTINGS_DEFAULTS
} from "@vertix.gg/definitions/src/guild-events-definitions";

import type { TGuildEventsStoredSettings } from "@vertix.gg/definitions/src/guild-events-definitions";
import type { IGuildEventsRoleStatus } from "@vertix.gg/definitions/src/ipc-definitions";

const GUILD_ID = "830000000000000001",
    OTHER_GUILD_ID = "830000000000000002",
    USER_ID = "840000000000000001",
    CHANNEL_ID = "850000000000000001",
    LOG_CHANNEL_ID = "850000000000000002",
    VOICE_CHANNEL_ID = "860000000000000001",
    ROLE_ID = "870000000000000001",
    APP_ID = "900000000000000001";

type ISettingsRow = TGuildEventsStoredSettings & {
    guildId: string;
    applicationId: string;
};

interface IRunRow {
    id: string;
    guildId: string;
    name: string;
    occurrenceStartAt: Date;
    endedAt: Date | null;
    phase: string;
    voiceChannelId: string;
    minVoiceSeconds?: number | null;
}

/**
 * The bot, as the api hears it: every channel it is asked about takes a post and every role can be
 * pinged, unless it is listed here as otherwise.
 */
interface IBot {
    applicationId: string;
    isBotInGuild: boolean;
    /** What the bot lacks in a channel, or null for one that is not a text channel it can see. */
    channels: Record<string, string[] | null>;
    /** A role's answer, or null for one the server does not have. */
    roles: Record<string, IGuildEventsRoleStatus | null>;
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
    /** The bot that answers, or null when it cannot be asked. */
    bot: IBot | null;
    settings: ISettingsRow | null;
    runs: IRunRow[];
    attendees: IAttendeeRow[];
    /** Every question put to the bot, in order. */
    asked: { channelIds: string[]; roleIds: string[] }[];
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
        bot: { applicationId: APP_ID, isBotInGuild: true, channels: {}, roles: {} },
        settings: null,
        runs: [],
        attendees: [],
        asked: [],
        ... world
    };

    const { GuildEventSettingsModel } = await import( "@vertix.gg/data/src/models/guild-event-settings-model" );
    const { GuildEventRunModel } = await import( "@vertix.gg/data/src/models/guild-event-run-model" );
    const { GuildEventsService } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    const save = jest.fn( async( guildId: string, applicationId: string, patch: Partial<ISettingsRow> ) => {
        settled.settings = {
            enabled: false,
            channelId: null,
            subPostsEnabled: true,
            lastError: null,
            ... settled.settings,
            ... patch,
            guildId,
            applicationId
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
        isReady: () => null !== settled.bot,
        request: async( _request: string, _response: string, payload: { channelIds: string[]; roleIds: string[] } ) => {
            const bot = settled.bot!;

            settled.asked.push( { channelIds: payload.channelIds, roleIds: payload.roleIds } );

            return {
                applicationId: bot.applicationId,
                isBotInGuild: bot.isBotInGuild,
                channels: Object.fromEntries( payload.channelIds.map( ( id ) => [ id, id in bot.channels ? bot.channels[ id ] : [] ] ) ),
                roles: Object.fromEntries( payload.roleIds.map( ( id ) => [ id, id in bot.roles ? bot.roles[ id ] : { isPingable: true } ] ) )
            };
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
        it( "should read the settings sent, and leave out what was not", async() => {
            // Arrange.
            const { readGuildEventsSettingsPatch } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

            // Act & Assert.
            expect( readGuildEventsSettingsPatch( { enabled: true, channelId: CHANNEL_ID } ) ).toEqual( { enabled: true, channelId: CHANNEL_ID } );
            expect( readGuildEventsSettingsPatch( { channelId: null, subPostsEnabled: false } ) ).toEqual( { channelId: null, subPostsEnabled: false } );
            expect( readGuildEventsSettingsPatch( {
                checkInLeadMinutes: 30,
                lateAfterMinutes: 0,
                checkInRoleId: ROLE_ID,
                subRoleId: null,
                checkInPingInterested: true,
                logChannelId: LOG_CHANNEL_ID
            } ) ).toEqual( {
                checkInLeadMinutes: 30,
                lateAfterMinutes: 0,
                checkInRoleId: ROLE_ID,
                subRoleId: null,
                checkInPingInterested: true,
                logChannelId: LOG_CHANNEL_ID
            } );
        } );

        it( "should refuse a number the setting does not offer", async() => {
            // Arrange.
            const { readGuildEventsSettingsPatch } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

            // Act & Assert.
            expect( readGuildEventsSettingsPatch( { lateAfterMinutes: 7 } ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { checkInLeadMinutes: "15" } ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { maxDurationHours: 48 } ) ).toBeNull();
        } );

        it( "should read the channels Events is limited to once each, and refuse too many or a bad id", async() => {
            // Arrange.
            const { readGuildEventsSettingsPatch } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

            const tooMany = Array.from( { length: GUILD_EVENTS_LIMITS.EVENT_CHANNELS_MAX + 1 }, ( _, index ) =>
                String( 860000000000000100n + BigInt( index ) ) );

            // Act & Assert.
            expect( readGuildEventsSettingsPatch( { eventChannelIds: [ VOICE_CHANNEL_ID, VOICE_CHANNEL_ID ] } ) )
                .toEqual( { eventChannelIds: [ VOICE_CHANNEL_ID ] } );
            expect( readGuildEventsSettingsPatch( { eventChannelIds: [] } ) ).toEqual( { eventChannelIds: [] } );
            expect( readGuildEventsSettingsPatch( { eventChannelIds: tooMany } ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { eventChannelIds: [ "not-an-id" ] } ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { eventChannelIds: VOICE_CHANNEL_ID } ) ).toBeNull();
        } );

        it( "should refuse anything else", async() => {
            // Arrange.
            const { readGuildEventsSettingsPatch } = await import( "@vertix.gg/api/src/server/services/guild-events-service" );

            // Act & Assert.
            expect( readGuildEventsSettingsPatch( [] ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { enabled: "yes" } ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { channelId: "not-an-id" } ) ).toBeNull();
            expect( readGuildEventsSettingsPatch( { subRoleId: 12 } ) ).toBeNull();
        } );
    } );

    describe( "getSettings()", () => {
        it( "should answer a server that never set Events up from the defaults", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act.
            const settings = await service.getSettings( GUILD_ID );

            // Assert.
            expect( settings ).toMatchObject( {
                enabled: false,
                channelId: null,
                lateAfterMinutes: GUILD_EVENTS_SETTINGS_DEFAULTS.lateAfterMinutes,
                eventChannelIds: [],
                logChannelId: null
            } );
        } );
    } );

    describe( "saveSettings()", () => {
        const withChannel = ( overrides: Partial<ISettingsRow> = {} ): ISettingsRow => ( {
            guildId: GUILD_ID,
            applicationId: APP_ID,
            enabled: true,
            channelId: CHANNEL_ID,
            subPostsEnabled: true,
            lastError: null,
            ... overrides
        } );

        it( "should save a picked channel under the bot that answered", async() => {
            // Arrange.
            const { service, world } = await makeService();

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.SAVED );
            expect( world.asked ).toEqual( [ { channelIds: [ CHANNEL_ID ], roleIds: [] } ] );
            expect( world.settings ).toMatchObject( { applicationId: APP_ID, channelId: CHANNEL_ID, enabled: false } );
        } );

        it( "should refuse to turn Events on with no channel, without asking the bot", async() => {
            // Arrange.
            const { service, world, save } = await makeService();

            // Act.
            const result = await service.saveSettings( GUILD_ID, { enabled: true }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.INVALID );
            expect( world.asked ).toHaveLength( 0 );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse a channel the bot cannot post in, naming what it lacks", async() => {
            // Arrange.
            const { service, save } = await makeService( {
                bot: { applicationId: APP_ID, isBotInGuild: true, channels: { [ CHANNEL_ID ]: [ "SendMessages", "EmbedLinks" ] }, roles: {} }
            } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result ).toEqual( {
                code: GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN,
                channel: "posts",
                reasons: [ "Send Messages", "Embed Links" ]
            } );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse a channel that is not a text channel the bot can see", async() => {
            // Arrange.
            const { service } = await makeService( {
                bot: { applicationId: APP_ID, isBotInGuild: true, channels: { [ CHANNEL_ID ]: null }, roles: {} }
            } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN );
        } );

        it( "should save nothing when the bot cannot be asked", async() => {
            // Arrange.
            const { service, save } = await makeService( { bot: null } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { channelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.BOT_UNREACHABLE );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should check every channel Events posts in again when it is turned on", async() => {
            // Arrange.
            const { service, world } = await makeService( {
                settings: withChannel( { enabled: false, logChannelId: LOG_CHANNEL_ID } )
            } );

            // Act.
            await service.saveSettings( GUILD_ID, { enabled: true }, USER_ID );

            // Assert.
            expect( world.asked ).toEqual( [ { channelIds: [ CHANNEL_ID, LOG_CHANNEL_ID ], roleIds: [] } ] );
            expect( world.settings?.enabled ).toBe( true );
        } );

        it( "should turn Events off when its channel is cleared", async() => {
            // Arrange.
            const { service, world } = await makeService( { settings: withChannel() } );

            // Act.
            await service.saveSettings( GUILD_ID, { channelId: null }, USER_ID );

            // Assert.
            expect( world.settings ).toMatchObject( { channelId: null, enabled: false } );
        } );

        it( "should switch the sub posts without asking about any channel", async() => {
            // Arrange.
            const { service, world } = await makeService( { settings: withChannel() } );

            // Act.
            await service.saveSettings( GUILD_ID, { subPostsEnabled: false }, USER_ID );

            // Assert.
            expect( world.asked ).toEqual( [ { channelIds: [], roleIds: [] } ] );
            expect( world.settings ).toMatchObject( { subPostsEnabled: false, enabled: true, channelId: CHANNEL_ID } );
        } );

        it( "should save the timing and the channels Events is limited to as they are", async() => {
            // Arrange.
            const { service, world } = await makeService( { settings: withChannel() } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, {
                checkInLeadMinutes: 60,
                lateAfterMinutes: 0,
                eventChannelIds: [ VOICE_CHANNEL_ID ]
            }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.SAVED );
            expect( world.settings ).toMatchObject( { checkInLeadMinutes: 60, lateAfterMinutes: 0, eventChannelIds: [ VOICE_CHANNEL_ID ] } );
        } );

        it( "should refuse an attendance copy the bot cannot post, saying it is the copy's channel", async() => {
            // Arrange.
            const { service, save } = await makeService( {
                settings: withChannel(),
                bot: { applicationId: APP_ID, isBotInGuild: true, channels: { [ LOG_CHANNEL_ID ]: [ "ViewChannel" ] }, roles: {} }
            } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { logChannelId: LOG_CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result ).toEqual( { code: GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN, channel: "log", reasons: [ "View Channel" ] } );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse to copy the attendance into the channel the boards already go to", async() => {
            // Arrange.
            const { service, world } = await makeService( { settings: withChannel() } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { logChannelId: CHANNEL_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.INVALID );
            expect( world.asked ).toHaveLength( 0 );
        } );

        it( "should save a role to ping once the bot says a ping of it reaches anybody", async() => {
            // Arrange.
            const { service, world } = await makeService( { settings: withChannel() } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { subRoleId: ROLE_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.SAVED );
            expect( world.asked ).toEqual( [ { channelIds: [], roleIds: [ ROLE_ID ] } ] );
            expect( world.settings?.subRoleId ).toBe( ROLE_ID );
        } );

        it( "should refuse a role nobody would be notified by, and one the server does not have", async() => {
            // Arrange.
            const quiet = await makeService( {
                settings: withChannel(),
                bot: { applicationId: APP_ID, isBotInGuild: true, channels: {}, roles: { [ ROLE_ID ]: { isPingable: false } } }
            } );
            const gone = await makeService( {
                settings: withChannel(),
                bot: { applicationId: APP_ID, isBotInGuild: true, channels: {}, roles: { [ ROLE_ID ]: null } }
            } );

            // Act.
            const notPingable = await quiet.service.saveSettings( GUILD_ID, { checkInRoleId: ROLE_ID }, USER_ID ),
                missing = await gone.service.saveSettings( GUILD_ID, { checkInRoleId: ROLE_ID }, USER_ID );

            // Assert.
            expect( notPingable.code ).toBe( GUILD_EVENTS_SAVE_CODES.ROLE_NOT_PINGABLE );
            expect( missing.code ).toBe( GUILD_EVENTS_SAVE_CODES.INVALID );
            expect( quiet.save ).not.toHaveBeenCalled();
            expect( gone.save ).not.toHaveBeenCalled();
        } );

        it( "should refuse @everyone as a role to ping, without asking the bot", async() => {
            // Arrange.
            const { service, world } = await makeService( { settings: withChannel() } );

            // Act.
            const result = await service.saveSettings( GUILD_ID, { checkInRoleId: GUILD_ID }, USER_ID );

            // Assert.
            expect( result.code ).toBe( GUILD_EVENTS_SAVE_CODES.INVALID );
            expect( world.asked ).toHaveLength( 0 );
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

        it( "should hold a finished run to the least time in voice it ended with", async() => {
            // Arrange.
            const run = makeRun( 1, { minVoiceSeconds: 300 } );

            const { service } = await makeService( {
                runs: [ run ],
                attendees: [
                    makeAttendee( run.id, "stayed", { voiceSeconds: 300 } ),
                    makeAttendee( run.id, "looked-in", { voiceSeconds: 299 } ),
                    makeAttendee( run.id, "passed-by", { interested: false, voiceSeconds: 10 } )
                ]
            } );

            // Act.
            const detail = await service.getRun( GUILD_ID, run.id );

            // Assert.
            expect( detail?.attendees.map( ( attendee ) => [ attendee.userId, attendee.kind ] ) ).toEqual( [
                [ "stayed", "came" ],
                [ "looked-in", "no-show" ]
            ] );
            expect( detail?.counts ).toEqual( { "came": 1, "late": 0, "no-show": 1, "walk-in": 0 } );
        } );

        it( "should not hold a run still going to the least time - nobody's time is final yet", async() => {
            // Arrange.
            const run = makeRun( 1, { phase: GUILD_EVENT_RUN_PHASES.RUNNING, minVoiceSeconds: 300 } );

            const { service } = await makeService( {
                runs: [ run ],
                attendees: [ makeAttendee( run.id, "just-came", { voiceSeconds: 10 } ) ]
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
