import { jest } from "@jest/globals";

import {
    ChannelType,
    Collection,
    GuildScheduledEventEntityType,
    GuildScheduledEventStatus
} from "discord.js";

import {
    GUILD_EVENT_RUN_PHASES,
    GUILD_EVENTS_ERRORS,
    GUILD_EVENTS_LIMITS,
    GUILD_EVENTS_SETTINGS_DEFAULTS,
    GUILD_EVENTS_TIMINGS
} from "@vertix.gg/definitions/src/guild-events-definitions";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { MessageMentionOptions } from "discord.js";

import type { TGuildEventsStoredSettings } from "@vertix.gg/definitions/src/guild-events-definitions";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/** Shard 1 of 2 by discord's own arithmetic - which is what the shard test below relies on. */
const GUILD_ID = "820000000000000001";

const APP_ID = "900000000000000001",
    OTHER_APP_ID = "900000000000000002";

const EVENT_ID = "700000000000000001",
    VOICE_CHANNEL_ID = "600000000000000001",
    POST_CHANNEL_ID = "600000000000000002",
    OTHER_VOICE_CHANNEL_ID = "600000000000000003",
    ROOM_CHANNEL_ID = "600000000000000004",
    LOG_CHANNEL_ID = "600000000000000005";

const ALICE = "500000000000000001",
    BOB = "500000000000000002";

const PING_ROLE_ID = "400000000000000001",
    QUIET_ROLE_ID = "400000000000000002";

const MINUTE = 60 * 1000;

/** The timing of a server that never set its own. */
const CHECK_IN_LEAD = GUILD_EVENTS_SETTINGS_DEFAULTS.checkInLeadMinutes * MINUTE,
    LATE_AFTER = GUILD_EVENTS_SETTINGS_DEFAULTS.lateAfterMinutes * MINUTE,
    EMPTY_END = GUILD_EVENTS_SETTINGS_DEFAULTS.endAfterEmptyMinutes * MINUTE;

/** The event starts exactly as check-in opens at `NOW + CHECK_IN_LEAD`. */
const NOW = new Date( "2026-10-03T17:45:00.000Z" );
const START = NOW.getTime() + CHECK_IN_LEAD;

interface IRunRow {
    id: string;
    applicationId: string;
    guildId: string;
    scheduledEventId: string;
    occurrenceStartAt: Date;
    name: string;
    voiceChannelId: string;
    postChannelId: string;
    phase: string;
    boardMessageId: string | null;
    subPostMessageId: string | null;
    subsNeeded: number;
    frozenAt: Date | null;
    endedAt: Date | null;
    checkpointAt: Date | null;
    lastError: string | null;
    minVoiceSeconds?: number | null;
    createdAt: Date;
    updatedAt: Date;
}

interface IAttendeeRow {
    runId: string;
    guildId: string;
    userId: string;
    displayName?: string | null;
    interested: boolean;
    checkedInAt: Date | null;
    late: boolean;
    noShow: boolean;
    voiceSeconds: number;
    sessionStartedAt: Date | null;
}

/** Something the bot posted, as discord was handed it. */
interface ISentPost {
    adapter: string;
    channelId: string;
    args: UIArgs;
    content?: string;
    allowedMentions?: MessageMentionOptions;
}

interface IWorld {
    settings: TGuildEventsStoredSettings & {
        guildId: string;
        applicationId: string;
    };
    runs: IRunRow[];
    attendees: IAttendeeRow[];
    /** Who marked themselves Interested on the event. */
    roster: string[];
    /** Where each member is in voice now. */
    voice: Map<string, string>;
    eventStatus: GuildScheduledEventStatus;
    eventStart: number;
    /** A channel row for the event's own channel, when it is a generator. */
    eventChannelRow: { id: string; isMaster: boolean; isScalingMaster: boolean } | null;
    /** Rows of the rooms the bot made, by channel id. */
    roomRows: Map<string, { id: string; channelId: string; isDynamic: boolean; isScaling: boolean; ownerChannelId: string }>;
    /** Whether discord takes a post. */
    canPost: boolean;
    /** Whether the bot may mention every role, mentionable or not. */
    canMentionEveryRole: boolean;
    sent: ISentPost[];
    edits: { messageId: string; drawn: UIArgs }[];
    deletes: string[];
}

async function makeService( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = {
        settings: {
            guildId: GUILD_ID,
            applicationId: APP_ID,
            enabled: true,
            channelId: POST_CHANNEL_ID,
            subPostsEnabled: true,
            lastError: null
        },
        runs: [],
        attendees: [],
        roster: [ ALICE, BOB ],
        voice: new Map(),
        eventStatus: GuildScheduledEventStatus.Scheduled,
        eventStart: START,
        eventChannelRow: null,
        roomRows: new Map(),
        canPost: true,
        canMentionEveryRole: false,
        sent: [],
        edits: [],
        deletes: [],
        ... world
    };

    const { ServiceLocator } = await import( "@vertix.gg/base/src/modules/service/service-locator" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { GuildEventRunModel } = await import( "@vertix.gg/data/src/models/guild-event-run-model" );
    const { GuildEventSettingsModel } = await import( "@vertix.gg/data/src/models/guild-event-settings-model" );
    const { PermissionsManager } = await import( "@vertix.gg/bot/src/managers/permissions-manager" );
    const { GuildEventsManager } = await import( "@vertix.gg/bot/src/managers/guild-events-manager" );
    const { GuildEventsService } = await import( "@vertix.gg/bot/src/services/guild-events-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    const manager = new GuildEventsManager();

    jest.spyOn( GuildEventsManager, "$", "get" ).mockReturnValue( manager );

    const settingsModel = {
        get: jest.fn( async() => settled.settings ),
        getEnabled: jest.fn( async( applicationId: string ) =>
            settled.settings.enabled && settled.settings.applicationId === applicationId ? [ settled.settings ] : [] ),
        markError: jest.fn( async( _guildId: string, error: string ) => {
            settled.settings.lastError = error;
        } )
    };

    jest.spyOn( GuildEventSettingsModel, "$", "get" ).mockReturnValue( asInstance( settingsModel ) );

    const findAttendee = ( runId: string, userId: string ) =>
        settled.attendees.find( ( row ) => row.runId === runId && row.userId === userId );

    // Each method writes the fake rows the way the real one writes the collection - the service is
    // judged by what it leaves behind.
    const runModel = {
        getOpen: jest.fn( async( applicationId: string ) => settled.runs.filter( ( run ) =>
            run.applicationId === applicationId && ( "check-in" === run.phase || "running" === run.phase ) ) ),
        open: jest.fn( async( data: Omit<IRunRow, "id" | "phase" | "boardMessageId" | "subPostMessageId" | "subsNeeded" | "frozenAt" | "endedAt" | "checkpointAt" | "lastError" | "createdAt" | "updatedAt"> ) => {
            const existing = settled.runs.find( ( run ) => run.applicationId === data.applicationId &&
                run.scheduledEventId === data.scheduledEventId &&
                run.occurrenceStartAt.getTime() === data.occurrenceStartAt.getTime() );

            if ( existing ) {
                return { run: existing, isCreated: false };
            }

            const run: IRunRow = {
                id: `run-${ settled.runs.length + 1 }`,
                ... data,
                phase: GUILD_EVENT_RUN_PHASES.CHECK_IN,
                boardMessageId: null,
                subPostMessageId: null,
                subsNeeded: 0,
                frozenAt: null,
                endedAt: null,
                checkpointAt: null,
                lastError: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            settled.runs.push( run );

            return { run, isCreated: true };
        } ),
        update: jest.fn( async( runId: string, patch: Partial<IRunRow> ) => {
            Object.assign( settled.runs.find( ( run ) => run.id === runId )!, patch );
        } ),
        checkpoint: jest.fn( async( runIds: string[], at: Date ) => {
            settled.runs.filter( ( run ) => runIds.includes( run.id ) ).forEach( ( run ) => {
                run.checkpointAt = at;
            } );
        } ),
        close: jest.fn( async( runIds: string[], at: Date ) => {
            settled.runs.filter( ( run ) => runIds.includes( run.id ) ).forEach( ( run ) => {
                run.phase = GUILD_EVENT_RUN_PHASES.ENDED;
                run.endedAt = at;
            } );
        } ),
        getAttendees: jest.fn( async( runId: string ) => settled.attendees.filter( ( row ) => row.runId === runId ) ),
        saveAttendee: jest.fn( async( runId: string, guildId: string, userId: string, patch: Partial<IAttendeeRow> ) => {
            const existing = findAttendee( runId, userId );

            if ( existing ) {
                Object.assign( existing, patch );

                return;
            }

            settled.attendees.push( {
                runId, guildId, userId,
                interested: false, checkedInAt: null, late: false, noShow: false, voiceSeconds: 0, sessionStartedAt: null,
                ... patch
            } );
        } ),
        freezeRoster: jest.fn( async( runId: string, guildId: string, rosterIds: string[], checkedInIds: string[], names: ReadonlyMap<string, string> ) => {
            for ( const userId of rosterIds ) {
                const existing = findAttendee( runId, userId );

                if ( existing ) {
                    existing.interested = true;
                } else if ( ! checkedInIds.includes( userId ) ) {
                    settled.attendees.push( {
                        runId, guildId, userId, displayName: names.get( userId ) ?? null,
                        interested: true, checkedInAt: null, late: false, noShow: true, voiceSeconds: 0, sessionStartedAt: null
                    } );
                }
            }
        } )
    };

    jest.spyOn( GuildEventRunModel, "$", "get" ).mockReturnValue( asInstance( runModel ) );

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getByChannelId: jest.fn( async( channelId: string ) =>
            VOICE_CHANNEL_ID === channelId ? settled.eventChannelRow : settled.roomRows.get( channelId ) ?? null ),
        getDynamicsByMasterId: jest.fn( async() => [] ),
        getScalingChannelsByMasterId: jest.fn( async() => [] )
    } ) );

    jest.spyOn( PermissionsManager, "$", "get" ).mockReturnValue( asInstance( {
        getMissingChannelPermissionsForBot: () => []
    } ) );

    // The service draws with the adapter and posts through the channel, so what an adapter drew
    // last is what the next post carries.
    let lastDrawnBy = "";

    const makeAdapter = ( adapterName: string ) => ( {
        render: jest.fn( async( _channel: object, args: UIArgs ) => {
            lastDrawnBy = adapterName;

            return args;
        } )
    } );

    const adapters: Record<string, ReturnType<typeof makeAdapter>> = {
        "VertixBot/UI-General/EventBoardAdapter": makeAdapter( "VertixBot/UI-General/EventBoardAdapter" ),
        "VertixBot/UI-General/EventNeedSubAdapter": makeAdapter( "VertixBot/UI-General/EventNeedSubAdapter" )
    };

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: ( name: string ) => "VertixGUI/UIService" === name ? { get: ( adapterName: string ) => adapters[ adapterName ] } : undefined
    } ) );

    const me = {
        id: APP_ID,
        permissions: { has: () => settled.canMentionEveryRole }
    };

    const makeTextChannel = ( id: string ) => ( {
        id,
        type: ChannelType.GuildText,
        send: jest.fn( async( { content, allowedMentions, ... args }: UIArgs & Pick<ISentPost, "content" | "allowedMentions"> ) => {
            if ( ! settled.canPost ) {
                throw new Error( "Missing Access" );
            }

            settled.sent.push( { adapter: lastDrawnBy, channelId: id, args, content, allowedMentions } );

            return { id: `message-${ settled.sent.length }` };
        } ),
        messages: {
            edit: jest.fn( async( messageId: string, drawn: UIArgs ) => {
                settled.edits.push( { messageId, drawn } );
            } ),
            delete: jest.fn( async( messageId: string ) => {
                settled.deletes.push( messageId );
            } )
        }
    } );

    const makeVoiceChannel = ( id: string ) => ( {
        id,
        type: ChannelType.GuildVoice,
        userLimit: 0,
        url: `https://discord.com/channels/${ GUILD_ID }/${ id }`,
        isVoiceBased: () => true,
        get members() {
            return new Collection( [ ... settled.voice.entries() ]
                .filter( ( [ , channelId ] ) => channelId === id )
                .map( ( [ userId ] ) => [ userId, { user: { bot: false } } ] ) );
        }
    } );

    const channels = new Map<string, object>( [
        [ POST_CHANNEL_ID, makeTextChannel( POST_CHANNEL_ID ) ],
        [ LOG_CHANNEL_ID, makeTextChannel( LOG_CHANNEL_ID ) ],
        [ VOICE_CHANNEL_ID, makeVoiceChannel( VOICE_CHANNEL_ID ) ],
        [ OTHER_VOICE_CHANNEL_ID, makeVoiceChannel( OTHER_VOICE_CHANNEL_ID ) ],
        [ ROOM_CHANNEL_ID, makeVoiceChannel( ROOM_CHANNEL_ID ) ]
    ] );

    const event = {
        id: EVENT_ID,
        name: "Raid Night",
        entityType: GuildScheduledEventEntityType.Voice,
        channelId: VOICE_CHANNEL_ID,
        channel: { permissionsFor: () => ( { has: () => true } ) },
        get status() {
            return settled.eventStatus;
        },
        get scheduledStartTimestamp() {
            return settled.eventStart;
        },
        scheduledEndTimestamp: null,
        fetchSubscribers: jest.fn( async() => new Collection( settled.roster.map( ( userId ) => [
            userId,
            { user: { id: userId, bot: false, username: `user-${ userId }`, globalName: null }, member: { displayName: `Nick ${ userId }` } }
        ] ) ) )
    };

    const guild = {
        id: GUILD_ID,
        members: { me },
        channels: { cache: channels },
        roles: {
            cache: new Map( [
                [ GUILD_ID, { id: GUILD_ID, mentionable: false } ],
                [ PING_ROLE_ID, { id: PING_ROLE_ID, mentionable: true } ],
                [ QUIET_ROLE_ID, { id: QUIET_ROLE_ID, mentionable: false } ]
            ] )
        },
        scheduledEvents: { cache: new Map( [ [ EVENT_ID, event ] ] ) },
        voiceStates: {
            get cache() {
                return new Map( [ ... settled.voice.entries() ].map( ( [ userId, channelId ] ) =>
                    [ userId, { id: userId, channelId, member: { user: { bot: false }, displayName: `Nick ${ userId }` } } ] ) );
            }
        }
    };

    const client = {
        user: { id: APP_ID },
        guilds: { cache: new Map( [ [ GUILD_ID, guild ] ] ) }
    };

    const service = Object.create( GuildEventsService.prototype ) as InstanceType<typeof GuildEventsService>;

    Object.assign( service, {
        debugger: { log: () => undefined },
        logger: { log: () => undefined, warn: () => undefined, error: () => undefined },
        isSweeping: false,
        services: {
            appService: { getClient: () => client }
        }
    } );

    /** A member moving in voice, as the channel service announces it. */
    const move = async( userId: string, toChannelId: string | null ) => {
        const fromChannelId = settled.voice.get( userId ) ?? null;

        if ( toChannelId ) {
            settled.voice.set( userId, toChannelId );
        } else {
            settled.voice.delete( userId );
        }

        service.onVoiceMove( asInstance( {
            oldState: { channelId: fromChannelId, guild },
            newState: { id: userId, channelId: toChannelId, guild, member: { user: { bot: false }, displayName: `Nick ${ userId }` } },
            displayName: userId,
            channelName: ""
        } ) );

        for ( const run of manager.getAll() ) {
            await manager.chain( run.runId, async() => undefined );
        }
    };

    /** Let every queued redraw run. */
    const flushRedraws = async() => {
        await jest.advanceTimersByTimeAsync( GUILD_EVENTS_TIMINGS.BOARD_EDIT_MIN_INTERVAL_MS );

        for ( const run of manager.getAll() ) {
            await manager.chain( run.runId, async() => undefined );
        }
    };

    const at = ( time: number ) => jest.setSystemTime( time );

    return { service, world: settled, manager, runModel, settingsModel, move, flushRedraws, at };
}

/**
 * Events: a check-in board before a voice event, who came and who did not, a post asking for subs,
 * and the attendance the board ends as.
 *
 * Pinned end to end over fakes, because each step is only as right as the one before it - a roster
 * read wrong is a no-show list that is wrong, and a board somebody deleted posted again is noise in
 * somebody's server every minute.
 */
describe( "VertixBot/Services/GuildEvents", () => {
    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();

        delete process.env.SHARD_COUNT;
        delete process.env.SHARD_IDS;
    } );

    describe( "opening", () => {
        it( "should put the board up with the roster waiting as check-in opens", async() => {
            // Arrange.
            const { service, world } = await makeService();

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs ).toHaveLength( 1 );
            expect( world.sent ).toHaveLength( 1 );
            expect( world.sent[ 0 ].adapter ).toBe( "VertixBot/UI-General/EventBoardAdapter" );
            expect( world.sent[ 0 ].args ).toMatchObject( {
                boardState: "check-in",
                eventName: "Raid Night",
                waiting: [ `<@${ ALICE }>`, `<@${ BOB }>` ],
                waitingCount: 2
            } );
            expect( world.runs[ 0 ].boardMessageId ).toBe( "message-1" );
        } );

        it( "should not open anything before the lead begins", async() => {
            // Arrange.
            const { service, world } = await makeService( { eventStart: START + MINUTE } );

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs ).toHaveLength( 0 );
            expect( world.sent ).toHaveLength( 0 );
        } );

        it( "should leave a server alone whose Events was last saved from the other bot", async() => {
            // Arrange.
            const { service, world } = await makeService();

            world.settings.applicationId = OTHER_APP_ID;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs ).toHaveLength( 0 );
        } );

        it( "should leave a server alone that another process holds", async() => {
            // Arrange.
            process.env.SHARD_COUNT = "2";
            process.env.SHARD_IDS = "0";

            const { service, world } = await makeService();

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs ).toHaveLength( 0 );
        } );

        it( "should count whoever is already in the channel as checked in", async() => {
            // Arrange.
            const { service, world } = await makeService( { voice: new Map( [ [ ALICE, VOICE_CHANNEL_ID ] ] ) } );

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent[ 0 ].args ).toMatchObject( {
                checkedIn: [ `<@${ ALICE }>` ],
                waiting: [ `<@${ BOB }>` ]
            } );
        } );

        it( "should record once that the board could not be posted, and not post it again", async() => {
            // Arrange.
            const { service, world, settingsModel } = await makeService( { canPost: false } );

            // Act.
            await service.sweep();
            await service.sweep();

            // Assert.
            expect( world.runs[ 0 ].lastError ).toBe( GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN );
            expect( settingsModel.markError ).toHaveBeenCalledTimes( 1 );
            expect( world.runs ).toHaveLength( 1 );
        } );
    } );

    describe( "check-ins", () => {
        it( "should check a member in on joining the event's channel", async() => {
            // Arrange.
            const { service, world, move } = await makeService();

            await service.sweep();

            // Act.
            await move( ALICE, VOICE_CHANNEL_ID );

            // Assert.
            expect( world.attendees ).toEqual( [ expect.objectContaining( {
                userId: ALICE,
                checkedInAt: new Date( NOW ),
                sessionStartedAt: new Date( NOW )
            } ) ] );
        } );

        it( "should touch nothing for a move between channels that are not the event's", async() => {
            // Arrange.
            const { service, world, move, runModel } = await makeService();

            await service.sweep();

            // Act.
            await move( ALICE, OTHER_VOICE_CHANNEL_ID );

            // Assert.
            expect( runModel.saveAttendee ).not.toHaveBeenCalled();
            expect( world.attendees ).toHaveLength( 0 );
        } );

        it( "should redraw the board with the member checked in", async() => {
            // Arrange.
            const { service, world, move, flushRedraws } = await makeService();

            await service.sweep();

            // Act.
            await move( ALICE, VOICE_CHANNEL_ID );
            await flushRedraws();

            // Assert.
            expect( world.edits ).toHaveLength( 1 );
            expect( world.edits[ 0 ].drawn ).toMatchObject( { checkedIn: [ `<@${ ALICE }>` ], waiting: [ `<@${ BOB }>` ] } );
        } );

        it( "should count a room the event's generator opened as the event's", async() => {
            // Arrange.
            const { service, world, move } = await makeService( {
                eventChannelRow: { id: "row-generator", isMaster: true, isScalingMaster: false },
                roomRows: new Map( [ [ ROOM_CHANNEL_ID, {
                    id: "row-room", channelId: ROOM_CHANNEL_ID, isDynamic: true, isScaling: false, ownerChannelId: VOICE_CHANNEL_ID
                } ] ] )
            } );

            await service.sweep();

            // Act.
            await move( ALICE, ROOM_CHANNEL_ID );

            // Assert.
            expect( world.attendees ).toEqual( [ expect.objectContaining( { userId: ALICE, checkedInAt: new Date( NOW ) } ) ] );
        } );
    } );

    describe( "the freeze", () => {
        it( "should mark who never came and post for as many subs", async() => {
            // Arrange.
            const { service, world, move, at } = await makeService();

            await service.sweep();
            await move( ALICE, VOICE_CHANNEL_ID );

            at( START + LATE_AFTER );

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs[ 0 ] ).toMatchObject( { phase: GUILD_EVENT_RUN_PHASES.RUNNING, subsNeeded: 1 } );
            expect( world.attendees.find( ( row ) => BOB === row.userId ) ).toMatchObject( { interested: true, noShow: true } );
            expect( world.sent[ 1 ] ).toMatchObject( {
                adapter: "VertixBot/UI-General/EventNeedSubAdapter",
                args: { stillNeeded: 1 }
            } );
        } );

        it( "should not post for subs while sub posts are off", async() => {
            // Arrange.
            const { service, world, at } = await makeService();

            world.settings.subPostsEnabled = false;

            await service.sweep();

            at( START + LATE_AFTER );

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs[ 0 ].phase ).toBe( GUILD_EVENT_RUN_PHASES.RUNNING );
            expect( world.sent.map( ( sent ) => sent.adapter ) ).not.toContain( "VertixBot/UI-General/EventNeedSubAdapter" );
        } );

        it( "should turn a no-show who comes after all into late, and count them against the sub post", async() => {
            // Arrange.
            const { service, world, move, flushRedraws, at } = await makeService();

            await service.sweep();

            at( START + LATE_AFTER );

            await service.sweep();

            // Act.
            at( START + LATE_AFTER + MINUTE );

            await move( BOB, VOICE_CHANNEL_ID );
            await flushRedraws();

            // Assert.
            expect( world.attendees.find( ( row ) => BOB === row.userId ) ).toMatchObject( { late: true, noShow: false } );
            expect( world.edits.find( ( edit ) => "message-2" === edit.messageId )?.drawn ).toMatchObject( { stillNeeded: 1 } );
        } );
    } );

    describe( "the end", () => {
        it( "should turn the board into the attendance and take the sub post down once the channels stay empty", async() => {
            // Arrange.
            const { service, world, move, at } = await makeService();

            await service.sweep();
            await move( ALICE, VOICE_CHANNEL_ID );

            at( START + LATE_AFTER );

            await service.sweep();

            at( START + 30 * MINUTE );

            await move( ALICE, null );

            // Act.
            at( START + 30 * MINUTE + EMPTY_END );

            await service.sweep();

            // Assert.
            const finalBoard = world.edits.filter( ( edit ) => "message-1" === edit.messageId ).at( -1 );

            expect( world.runs[ 0 ].phase ).toBe( GUILD_EVENT_RUN_PHASES.ENDED );
            expect( finalBoard?.drawn ).toMatchObject( {
                boardState: "ended",
                onTime: [ `<@${ ALICE }> · 0:45` ],
                noShow: [ `<@${ BOB }>` ],
                isJoinClosed: true
            } );
            expect( world.deletes ).toEqual( [ "message-2" ] );
        } );

        it( "should say on the board that an event called off before its start is canceled, and keep no attendance", async() => {
            // Arrange.
            const { service, world } = await makeService();

            await service.sweep();

            world.eventStatus = GuildScheduledEventStatus.Canceled;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs[ 0 ].phase ).toBe( GUILD_EVENT_RUN_PHASES.CANCELED );
            expect( world.edits.at( -1 )?.drawn ).toMatchObject( { boardState: "canceled" } );
        } );

        it( "should end every open run once Events is turned off", async() => {
            // Arrange.
            const { service, world } = await makeService();

            await service.sweep();

            world.settings.enabled = false;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs[ 0 ].phase ).toBe( GUILD_EVENT_RUN_PHASES.ENDED );
            expect( world.edits.at( -1 )?.drawn ).toMatchObject( { boardState: "ended", noShow: [ `<@${ ALICE }>`, `<@${ BOB }>` ] } );
        } );
    } );

    describe( "a server's own settings", () => {
        it( "should open check-in as far ahead as the server set", async() => {
            // Arrange.
            const { service, world, at } = await makeService();

            world.settings.checkInLeadMinutes = 30;

            // Act.
            at( START - 30 * MINUTE - 1 );

            await service.sweep();

            const before = world.sent.length;

            at( START - 30 * MINUTE );

            await service.sweep();

            // Assert.
            expect( before ).toBe( 0 );
            expect( world.sent ).toHaveLength( 1 );
        } );

        it( "should tell members on the board until when they count as on time", async() => {
            // Arrange.
            const { service, world } = await makeService();

            world.settings.lateAfterMinutes = 20;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent[ 0 ].args ).toMatchObject( { lateAt: Math.floor( ( START + 20 * MINUTE ) / 1000 ) } );
        } );

        it( "should take a change of timing to a run already open", async() => {
            // Arrange.
            const { service, world, at } = await makeService();

            await service.sweep();

            world.settings.lateAfterMinutes = 30;

            // Act.
            at( START + LATE_AFTER );

            await service.sweep();

            const stillCheckingIn = world.runs[ 0 ].phase;

            at( START + 30 * MINUTE );

            await service.sweep();

            // Assert.
            expect( stillCheckingIn ).toBe( GUILD_EVENT_RUN_PHASES.CHECK_IN );
            expect( world.runs[ 0 ].phase ).toBe( GUILD_EVENT_RUN_PHASES.RUNNING );
        } );

        it( "should open runs only for events held in the channels the server picked", async() => {
            // Arrange.
            const { service, world } = await makeService();

            world.settings.eventChannelIds = [ OTHER_VOICE_CHANNEL_ID ];

            // Act.
            await service.sweep();

            const elsewhere = world.sent.length;

            world.settings.eventChannelIds = [ OTHER_VOICE_CHANNEL_ID, VOICE_CHANNEL_ID ];

            await service.sweep();

            // Assert.
            expect( elsewhere ).toBe( 0 );
            expect( world.sent ).toHaveLength( 1 );
        } );
    } );

    describe( "pings", () => {
        it( "should post the board without a ping when the server asked for none", async() => {
            // Arrange.
            const { service, world } = await makeService();

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent[ 0 ].content ).toBeUndefined();
            expect( world.sent[ 0 ].allowedMentions ).toBeUndefined();
        } );

        it( "should ping the role, and the members on the roster not there yet, as check-in opens", async() => {
            // Arrange.
            const { service, world } = await makeService( { voice: new Map( [ [ ALICE, VOICE_CHANNEL_ID ] ] ) } );

            world.settings.checkInRoleId = PING_ROLE_ID;
            world.settings.checkInPingInterested = true;

            // Act.
            await service.sweep();

            // Assert - Alice is in already; only Bob needs telling.
            expect( world.sent[ 0 ] ).toMatchObject( {
                content: `<@&${ PING_ROLE_ID }> <@${ BOB }>`,
                allowedMentions: { roles: [ PING_ROLE_ID ], users: [ BOB ] }
            } );
        } );

        it( "should leave out a role the server no longer has", async() => {
            // Arrange.
            const { service, world } = await makeService();

            world.settings.checkInRoleId = "400000000000000099";

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent[ 0 ].content ).toBeUndefined();
        } );

        it( "should ping no more members by name than a message can hold", async() => {
            // Arrange - more than the cap, on one page of the roster (the fake reads no further pages).
            const roster = Array.from( { length: 99 }, ( _, index ) => String( 500000000000000100n + BigInt( index ) ) ),
                { service, world } = await makeService( { roster } );

            world.settings.checkInPingInterested = true;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent[ 0 ].allowedMentions?.users ).toHaveLength( GUILD_EVENTS_LIMITS.PING_MEMBERS_MAX );
            expect( world.sent[ 0 ].content!.length ).toBeLessThanOrEqual( 2000 );
        } );

        it( "should ping the server's role in the \"need a sub\" post", async() => {
            // Arrange.
            const { service, world, at } = await makeService();

            world.settings.subRoleId = PING_ROLE_ID;

            await service.sweep();

            at( START + LATE_AFTER );

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent[ 1 ] ).toMatchObject( {
                adapter: "VertixBot/UI-General/EventNeedSubAdapter",
                content: `<@&${ PING_ROLE_ID }>`,
                allowedMentions: { roles: [ PING_ROLE_ID ], users: [] }
            } );
        } );
    } );

    describe( "subs and attendance", () => {
        it( "should not ask for subs until as many are missing as the server set", async() => {
            // Arrange - nobody of the two came.
            const { service, world, at } = await makeService();

            world.settings.subMinMissing = 3;

            await service.sweep();

            at( START + LATE_AFTER );

            // Act.
            await service.sweep();

            // Assert.
            expect( world.runs[ 0 ] ).toMatchObject( { phase: GUILD_EVENT_RUN_PHASES.RUNNING, subsNeeded: 0 } );
            expect( world.sent.map( ( sent ) => sent.adapter ) ).not.toContain( "VertixBot/UI-General/EventNeedSubAdapter" );
        } );

        it( "should hold the attendance to the least time in voice, and keep that least time on the run", async() => {
            // Arrange - Alice looks in for two minutes, Bob stays half an hour.
            const { service, world, move, at } = await makeService();

            world.settings.minVoiceMinutes = 5;

            await service.sweep();
            await move( ALICE, VOICE_CHANNEL_ID );

            at( NOW.getTime() + 2 * MINUTE );

            await move( ALICE, null );

            at( START );

            await move( BOB, VOICE_CHANNEL_ID );

            at( START + LATE_AFTER );

            await service.sweep();

            at( START + 30 * MINUTE );

            await move( BOB, null );

            // Act.
            at( START + 30 * MINUTE + EMPTY_END );

            await service.sweep();

            // Assert.
            expect( world.runs[ 0 ] ).toMatchObject( { phase: GUILD_EVENT_RUN_PHASES.ENDED, minVoiceSeconds: 5 * 60 } );
            expect( world.edits.filter( ( edit ) => "message-1" === edit.messageId ).at( -1 )?.drawn ).toMatchObject( {
                boardState: "ended",
                minVoiceMinutes: 5,
                onTime: [ `<@${ BOB }> · 0:30` ],
                noShow: [ `<@${ ALICE }>` ]
            } );
        } );

        it( "should copy the finished attendance to the server's log channel", async() => {
            // Arrange.
            const { service, world } = await makeService();

            world.settings.logChannelId = LOG_CHANNEL_ID;

            await service.sweep();

            world.settings.enabled = false;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent.filter( ( sent ) => LOG_CHANNEL_ID === sent.channelId ) ).toEqual( [ expect.objectContaining( {
                adapter: "VertixBot/UI-General/EventBoardAdapter",
                args: expect.objectContaining( { boardState: "ended", noShow: [ `<@${ ALICE }>`, `<@${ BOB }>` ] } )
            } ) ] );
        } );

        it( "should not copy the attendance into the channel the board already ends in", async() => {
            // Arrange.
            const { service, world } = await makeService();

            world.settings.logChannelId = POST_CHANNEL_ID;

            await service.sweep();

            world.settings.enabled = false;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.sent ).toHaveLength( 1 );
        } );

        it( "should record a log channel that is gone, for the settings screen to say", async() => {
            // Arrange.
            const { service, world } = await makeService();

            world.settings.logChannelId = "600000000000000099";

            await service.sweep();

            world.settings.enabled = false;

            // Act.
            await service.sweep();

            // Assert.
            expect( world.settings.lastError ).toBe( GUILD_EVENTS_ERRORS.LOG_CHANNEL_MISSING );
        } );
    } );

    describe( "names", () => {
        it( "should write the name the server shows on every row, so the attendance can be read back", async() => {
            // Arrange.
            const { service, world, move, at } = await makeService();

            await service.sweep();
            await move( ALICE, VOICE_CHANNEL_ID );

            // Act.
            at( START + LATE_AFTER );

            await service.sweep();

            // Assert - Alice from her voice state, Bob from the roster although he never came.
            expect( world.attendees.find( ( row ) => ALICE === row.userId )?.displayName ).toBe( `Nick ${ ALICE }` );
            expect( world.attendees.find( ( row ) => BOB === row.userId )?.displayName ).toBe( `Nick ${ BOB }` );
        } );
    } );

    describe( "getStatus()", () => {
        it( "should say which bot is answering, and that it can post in each text channel asked about", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act.
            const status = service.getStatus( GUILD_ID, [ POST_CHANNEL_ID, LOG_CHANNEL_ID ], [] );

            // Assert.
            expect( status ).toEqual( {
                applicationId: APP_ID,
                isBotInGuild: true,
                channels: { [ POST_CHANNEL_ID ]: [], [ LOG_CHANNEL_ID ]: [] },
                roles: {}
            } );
        } );

        it( "should answer no permissions at all for a channel that is not a text channel", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act & Assert.
            expect( service.getStatus( GUILD_ID, [ VOICE_CHANNEL_ID ], [] ).channels[ VOICE_CHANNEL_ID ] ).toBeNull();
        } );

        it( "should call a role pingable only when anybody may mention it, or the bot may mention every role", async() => {
            // Arrange.
            const { service, world } = await makeService();

            // Act.
            const quiet = service.getStatus( GUILD_ID, [], [ PING_ROLE_ID, QUIET_ROLE_ID ] ).roles;

            world.canMentionEveryRole = true;

            const loud = service.getStatus( GUILD_ID, [], [ QUIET_ROLE_ID ] ).roles;

            // Assert.
            expect( quiet ).toEqual( { [ PING_ROLE_ID ]: { isPingable: true }, [ QUIET_ROLE_ID ]: { isPingable: false } } );
            expect( loud ).toEqual( { [ QUIET_ROLE_ID ]: { isPingable: true } } );
        } );

        it( "should answer null for a role the server does not have, and for @everyone", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act.
            const roles = service.getStatus( GUILD_ID, [], [ "400000000000000099", GUILD_ID ] ).roles;

            // Assert.
            expect( roles ).toEqual( { "400000000000000099": null, [ GUILD_ID ]: null } );
        } );

        it( "should say when the bot is not in the server", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act & Assert.
            expect( service.getStatus( "820000000000000099", [], [] ).isBotInGuild ).toBe( false );
        } );
    } );

    describe( "a restart", () => {
        it( "should credit a visit that ended while the bot was down up to the run's last checkpoint", async() => {
            // Arrange.
            const checkpointAt = new Date( START + 20 * MINUTE );

            const { service, world, manager } = await makeService( {
                runs: [ {
                    id: "run-1",
                    applicationId: APP_ID,
                    guildId: GUILD_ID,
                    scheduledEventId: EVENT_ID,
                    occurrenceStartAt: new Date( START ),
                    name: "Raid Night",
                    voiceChannelId: VOICE_CHANNEL_ID,
                    postChannelId: POST_CHANNEL_ID,
                    phase: GUILD_EVENT_RUN_PHASES.RUNNING,
                    boardMessageId: "message-1",
                    subPostMessageId: null,
                    subsNeeded: 0,
                    frozenAt: new Date( START + LATE_AFTER ),
                    endedAt: null,
                    checkpointAt,
                    lastError: null,
                    createdAt: new Date( START ),
                    updatedAt: checkpointAt
                } ],
                attendees: [ {
                    runId: "run-1",
                    guildId: GUILD_ID,
                    userId: ALICE,
                    interested: true,
                    checkedInAt: new Date( START ),
                    late: false,
                    noShow: false,
                    voiceSeconds: 0,
                    sessionStartedAt: new Date( START )
                } ]
            } );

            jest.setSystemTime( START + 60 * MINUTE );

            // Act.
            await service[ "restore" ]();

            // Assert.
            expect( manager.getAll() ).toHaveLength( 1 );
            expect( world.attendees[ 0 ] ).toMatchObject( { voiceSeconds: 20 * 60, sessionStartedAt: null } );
        } );

        it( "should close in the database a run in a server the bot is no longer in", async() => {
            // Arrange.
            const { service, world, runModel } = await makeService( {
                runs: [ {
                    id: "run-1",
                    applicationId: APP_ID,
                    guildId: "820000000000000099",
                    scheduledEventId: EVENT_ID,
                    occurrenceStartAt: new Date( START ),
                    name: "Raid Night",
                    voiceChannelId: VOICE_CHANNEL_ID,
                    postChannelId: POST_CHANNEL_ID,
                    phase: GUILD_EVENT_RUN_PHASES.RUNNING,
                    boardMessageId: "message-1",
                    subPostMessageId: null,
                    subsNeeded: 0,
                    frozenAt: null,
                    endedAt: null,
                    checkpointAt: null,
                    lastError: null,
                    createdAt: new Date( START ),
                    updatedAt: new Date( START )
                } ]
            } );

            // Act.
            await service[ "restore" ]();

            // Assert.
            expect( runModel.close ).toHaveBeenCalledWith( [ "run-1" ], expect.any( Date ) );
            expect( world.runs[ 0 ].phase ).toBe( GUILD_EVENT_RUN_PHASES.ENDED );
            expect( world.edits ).toHaveLength( 0 );
        } );
    } );
} );
