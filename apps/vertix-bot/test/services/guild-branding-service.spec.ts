import { jest } from "@jest/globals";

import { DiscordAPIError, PermissionFlagsBits } from "discord.js";

import {
    GUILD_BRANDING_APPLY_ANSWER_TIMEOUT_MS,
    GUILD_BRANDING_APPLY_COOLDOWN_MAX,
    GUILD_BRANDING_APPLY_OUTCOMES
} from "@vertix.gg/definitions/src/guild-branding-definitions";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { GuildMemberEditMeOptions } from "discord.js";

/** Shard 1 of 2 by discord's own arithmetic - which is what the shard test below relies on. */
const GUILD_ID = "820000000000000001";

const APP_ID = "900000000000000001",
    OTHER_APP_ID = "900000000000000002";

const NOW = new Date( "2026-09-28T12:00:00.000Z" );

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

interface IBrandingRow {
    guildId: string;
    nick: string | null;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    revision: number;
}

interface IStateRow {
    guildId: string;
    applicationId: string;
    appliedRevision: number | null;
    appliedAt: Date | null;
    appliedNick: boolean;
    previousNick: string | null;
    nickPending: boolean;
    lastError: string | null;
    lastAttemptAt: Date | null;
    refusedRevision: number | null;
}

interface IWorld {
    canBrand: boolean;
    branding: IBrandingRow | null;
    states: IStateRow[];
    /** The bot's nickname in the guild, as discord has it. */
    nickname: string | null;
    canChangeNickname: boolean;
    /** When the bot last joined the guild. */
    joinedTimestamp: number;
    /** Every `editMe()` discord was asked for, in order. */
    edits: GuildMemberEditMeOptions[];
    /**
     * What discord does with the next `editMe()`: take it, refuse the profile (a 400), fail on the way
     * (the network), or never answer.
     */
    discord: "answers" | "refuses" | "fails" | "hangs";
}

function makeBranding( overrides: Partial<IBrandingRow> = {} ): IBrandingRow {
    return { guildId: GUILD_ID, nick: "Arena", bio: "Rooms for the league", avatar: PNG, banner: null, revision: 1, ... overrides };
}

/** A state as `markApplied()` leaves it: revision 1 on, named by the profile, nothing owed. */
function makeState( overrides: Partial<IStateRow> = {} ): IStateRow {
    return {
        guildId: GUILD_ID,
        applicationId: APP_ID,
        appliedRevision: 1,
        appliedAt: NOW,
        appliedNick: true,
        previousNick: null,
        nickPending: false,
        lastError: null,
        lastAttemptAt: NOW,
        refusedRevision: null,
        ... overrides
    };
}

function makeRefusal() {
    return new DiscordAPIError(
        { code: 50035, message: "Invalid Form Body" },
        50035,
        400,
        "PATCH",
        `/guilds/${ GUILD_ID }/members/@me`,
        { body: undefined, files: undefined }
    );
}

/**
 * Stands up the service over a guild, a database and discord, all three fake and all three in `world`.
 *
 * Built off the prototype rather than constructed, so none of the base class's wiring has to exist -
 * which also means the fields a constructor would have set are set here.
 */
async function makeService( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = {
        canBrand: true,
        branding: null,
        states: [],
        nickname: null,
        canChangeNickname: true,
        joinedTimestamp: NOW.getTime() - 24 * 60 * 60 * 1000,
        edits: [],
        discord: "answers",
        ... world
    };

    const { GuildBrandingModel } = await import( "@vertix.gg/data/src/models/guild-branding-model" );
    const { GuildBrandingService } = await import( "@vertix.gg/bot/src/services/guild-branding-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    const findState = ( guildId: string, applicationId: string ) =>
        settled.states.find( ( state ) => state.guildId === guildId && state.applicationId === applicationId );

    const upsertState = ( guildId: string, applicationId: string, data: Partial<IStateRow> ) => {
        const existing = findState( guildId, applicationId );

        if ( existing ) {
            Object.assign( existing, data );

            return;
        }

        settled.states.push( {
            ... makeState( { guildId, applicationId, appliedRevision: null, appliedAt: null, appliedNick: false, lastAttemptAt: null } ),
            ... data
        } );
    };

    // Each method writes the fake rows the way the real one writes the collection - the service is
    // judged by what it leaves behind, the same as it would be against mongo.
    const model = {
        get: jest.fn( async() => settled.branding ),
        getRevision: async() => settled.branding ? { revision: settled.branding.revision } : null,
        getRevisions: async() => settled.branding ? [ { guildId: settled.branding.guildId, revision: settled.branding.revision } ] : [],
        getState: async( guildId: string, applicationId: string ) => findState( guildId, applicationId ) ?? null,
        getStatesToReconcile: async( applicationId: string ) => settled.states.filter( ( state ) =>
            state.applicationId === applicationId && ( null !== state.appliedRevision || state.nickPending ) ),
        markApplied: jest.fn( async( guildId: string, applicationId: string, applied: {
            revision: number; appliedNick: boolean; previousNick: string | null; nickPending: boolean;
        } ) => {
            upsertState( guildId, applicationId, {
                appliedRevision: applied.revision,
                appliedAt: new Date(),
                appliedNick: applied.appliedNick,
                previousNick: applied.previousNick,
                nickPending: applied.nickPending,
                lastError: null,
                refusedRevision: null,
                lastAttemptAt: new Date()
            } );
        } ),
        markCleared: jest.fn( async( guildId: string, applicationId: string, options: { nickToGiveBack?: string | null } = {} ) => {
            const isNickOwed = undefined !== options.nickToGiveBack;

            upsertState( guildId, applicationId, {
                appliedRevision: null,
                appliedAt: null,
                appliedNick: isNickOwed,
                previousNick: isNickOwed ? options.nickToGiveBack ?? null : null,
                nickPending: isNickOwed,
                lastError: null,
                lastAttemptAt: new Date()
            } );
        } ),
        markError: jest.fn( async( guildId: string, applicationId: string, message: string, refusedRevision: number | null = null ) => {
            upsertState( guildId, applicationId, { lastError: message, lastAttemptAt: new Date(), refusedRevision } );
        } ),
        save: jest.fn()
    };

    jest.spyOn( GuildBrandingModel, "$", "get" ).mockReturnValue( asInstance( model ) );

    const me = {
        id: APP_ID,
        get nickname() {
            return settled.nickname;
        },
        permissions: {
            has: ( flag: bigint ) => PermissionFlagsBits.ChangeNickname === flag ? settled.canChangeNickname : true
        }
    };

    const guild = {
        id: GUILD_ID,
        get joinedTimestamp() {
            return settled.joinedTimestamp;
        },
        members: {
            me,
            fetchMe: async() => me,
            editMe: async( options: GuildMemberEditMeOptions ) => {
                settled.edits.push( options );

                if ( "refuses" === settled.discord ) {
                    throw makeRefusal();
                }

                if ( "fails" === settled.discord ) {
                    throw new Error( "socket hang up" );
                }

                if ( "hangs" === settled.discord ) {
                    return new Promise( () => undefined );
                }

                if ( "nick" in options ) {
                    settled.nickname = options.nick ?? null;
                }

                return me;
            }
        }
    };

    const client = {
        user: { id: APP_ID },
        guilds: { cache: new Map( [ [ GUILD_ID, guild ] ] ) }
    };

    const service = Object.create( GuildBrandingService.prototype ) as InstanceType<typeof GuildBrandingService>;

    Object.assign( service, {
        debugger: { log: () => undefined },
        logger: { log: () => undefined, warn: () => undefined, error: () => undefined },
        isReconciling: false,
        pushHistory: new Map(),
        running: new Map(),
        services: {
            appService: { getClient: () => client },
            entitlementService: { canBrand: async() => settled.canBrand }
        }
    } );

    return { service, world: settled, model };
}

/**
 * The bot's own profile in one server, sold with Pro.
 *
 * Worth pinning because every mistake here is visible to a whole server at once, and one of them is
 * a security hole: discord.js fetches or reads off the disk any image string that is not a data uri.
 */
describe( "VertixBot/Services/GuildBranding", () => {
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

    describe( "apply()", () => {
        it( "should put a paying server's saved profile on the bot and record the revision", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding() } );

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( result ).toEqual( { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED } );
            expect( world.edits ).toHaveLength( 1 );
            expect( world.edits[ 0 ] ).toMatchObject( { nick: "Arena", bio: "Rooms for the league", avatar: PNG, banner: null } );
            expect( world.states[ 0 ] ).toMatchObject( { applicationId: APP_ID, appliedRevision: 1, appliedNick: true } );
        } );

        it( "should not touch the bot for a server that does not pay for it", async() => {
            // Arrange.
            const { service, world } = await makeService( { canBrand: false, branding: makeBranding() } );

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( result.outcome ).toBe( GUILD_BRANDING_APPLY_OUTCOMES.NOT_ENTITLED );
            expect( world.edits ).toHaveLength( 0 );
        } );

        it.each( [
            [ "a url", "http://169.254.169.254/latest/meta-data" ],
            [ "a path on the host", "/etc/passwd" ],
            [ "an image that is not what it claims", "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD" ]
        ] )( "should never hand discord.js %s as an image", async( _label, avatar ) => {
            // Arrange - as if a row were written without going through the api's check.
            const { service, world, model } = await makeService( { branding: makeBranding( { avatar } ) } );

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( result.outcome ).toBe( GUILD_BRANDING_APPLY_OUTCOMES.INVALID_IMAGE );
            expect( world.edits ).toHaveLength( 0 );
            expect( model.markError ).toHaveBeenCalled();
        } );

        it( "should not push, or read the images, for a revision the bot is already wearing", async() => {
            // Arrange.
            const { service, world, model } = await makeService( {
                branding: makeBranding( { revision: 3 } ),
                states: [ makeState( { appliedRevision: 3 } ) ]
            } );

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( result.outcome ).toBe( GUILD_BRANDING_APPLY_OUTCOMES.APPLIED );
            expect( world.edits ).toHaveLength( 0 );
            expect( model.get ).not.toHaveBeenCalled();
        } );

        it( "should not push the first half of a save that was split in two", async() => {
            // Arrange - stored with `bumpRevision: false`, and the second half never came.
            const { service, world } = await makeService( { branding: makeBranding( { revision: 0 } ) } );

            // Act.
            await service.apply( GUILD_ID );

            // Assert.
            expect( world.edits ).toHaveLength( 0 );
        } );

        it( "should hold a server to its pushes per window, and say when it may push again", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding() } );

            for ( let revision = 1; revision <= GUILD_BRANDING_APPLY_COOLDOWN_MAX; revision++ ) {
                world.branding = makeBranding( { revision } );

                await service.apply( GUILD_ID );
            }

            world.branding = makeBranding( { revision: GUILD_BRANDING_APPLY_COOLDOWN_MAX + 1 } );

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( world.edits ).toHaveLength( GUILD_BRANDING_APPLY_COOLDOWN_MAX );
            expect( result.outcome ).toBe( GUILD_BRANDING_APPLY_OUTCOMES.COOLDOWN );
            expect( result.retryAfterMs ).toBeGreaterThan( 0 );
        } );

        it( "should give back the nickname the bot had once the profile stops naming it", async() => {
            // Arrange - an admin had named the bot by hand before the profile did.
            const { service, world } = await makeService( { branding: makeBranding(), nickname: "Helper" } );

            await service.apply( GUILD_ID );

            world.branding = makeBranding( { nick: null, revision: 2 } );

            // Act.
            await service.apply( GUILD_ID );

            // Assert.
            expect( world.edits[ 0 ] ).toMatchObject( { nick: "Arena" } );
            expect( world.edits[ 1 ] ).toMatchObject( { nick: "Helper" } );
            expect( world.nickname ).toBe( "Helper" );
        } );

        it( "should put the profile on again after the bot was removed and added back", async() => {
            // Arrange - the state says revision 1 is on, but the bot joined again since it was applied.
            const { service, world } = await makeService( {
                branding: makeBranding(),
                states: [ makeState( { appliedAt: new Date( NOW.getTime() - 60 * 60 * 1000 ) } ) ],
                joinedTimestamp: NOW.getTime() - 60 * 1000
            } );

            // Act.
            await service.apply( GUILD_ID );

            // Assert.
            expect( world.edits ).toHaveLength( 1 );
        } );

        it( "should answer pending rather than wait out discord", async() => {
            // Arrange.
            const { service } = await makeService( { branding: makeBranding(), discord: "hangs" } );

            // Act.
            const answer = service.apply( GUILD_ID );

            await jest.advanceTimersByTimeAsync( GUILD_BRANDING_APPLY_ANSWER_TIMEOUT_MS );

            // Assert.
            await expect( answer ).resolves.toEqual( { outcome: GUILD_BRANDING_APPLY_OUTCOMES.PENDING } );
        } );

        it( "should push a save and a sweep for the same server one after the other, not twice at once", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding() } );

            // Act - both asked for before either has run.
            await Promise.all( [ service.apply( GUILD_ID ), service.reconcileGuild( GUILD_ID ) ] );

            // Assert - the second found the first's revision on, and left it.
            expect( world.edits ).toHaveLength( 1 );
        } );
    } );

    describe( "a name the bot may not set", () => {
        it( "should apply the rest, and say the name is waiting", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding(), canChangeNickname: false } );

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( result ).toEqual( { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED, skippedNick: true } );
            expect( world.edits[ 0 ] ).not.toHaveProperty( "nick" );
            expect( world.edits[ 0 ] ).toMatchObject( { avatar: PNG } );
            expect( world.states[ 0 ].nickPending ).toBe( true );
        } );

        it( "should set only the name once the bot is given the permission", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding(), canChangeNickname: false } );

            await service.apply( GUILD_ID );

            world.canChangeNickname = true;

            // Act.
            await service.reconcile();

            // Assert - the images went out once, and the name alone the second time.
            expect( world.edits ).toHaveLength( 2 );
            expect( world.edits[ 1 ] ).toMatchObject( { nick: "Arena" } );
            expect( world.edits[ 1 ] ).not.toHaveProperty( "avatar" );
            expect( world.nickname ).toBe( "Arena" );
            expect( world.states[ 0 ].nickPending ).toBe( false );
        } );

        it( "should report the waiting name after a reload, from the status", async() => {
            // Arrange.
            const { service } = await makeService( { branding: makeBranding(), canChangeNickname: false } );

            await service.apply( GUILD_ID );

            // Act.
            const status = await service.getStatus( GUILD_ID );

            // Assert.
            expect( status ).toMatchObject( { canBrand: true, isBotInGuild: true, canChangeNickname: false, nickPending: true, appliedRevision: 1 } );
        } );
    } );

    describe( "a profile discord refuses", () => {
        it( "should record the refusal and not push that revision again from a sweep", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding(), discord: "refuses" } );

            // Act.
            const result = await service.apply( GUILD_ID );

            await service.reconcile();
            await service.reconcile();

            // Assert - one call to discord, not three.
            expect( result ).toEqual( { outcome: GUILD_BRANDING_APPLY_OUTCOMES.DISCORD_REFUSED, message: "Invalid Form Body" } );
            expect( world.edits ).toHaveLength( 1 );
            expect( world.states[ 0 ] ).toMatchObject( { refusedRevision: 1, appliedRevision: null } );
        } );

        it( "should try a refused revision again when somebody saves", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding(), discord: "refuses" } );

            await service.apply( GUILD_ID );

            world.discord = "answers";

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( result.outcome ).toBe( GUILD_BRANDING_APPLY_OUTCOMES.APPLIED );
            expect( world.edits ).toHaveLength( 2 );
        } );

        it( "should keep retrying from a sweep when the network failed, not discord", async() => {
            // Arrange.
            const { service, world } = await makeService( { branding: makeBranding(), discord: "fails" } );

            // Act.
            const result = await service.apply( GUILD_ID );

            world.discord = "answers";

            await service.reconcile();

            // Assert.
            expect( result ).toEqual( { outcome: GUILD_BRANDING_APPLY_OUTCOMES.FAILED } );
            expect( world.edits ).toHaveLength( 2 );
            expect( world.states[ 0 ].appliedRevision ).toBe( 1 );
        } );

        it( "should answer an error of ours without its details", async() => {
            // Arrange - the database failing as the push is recorded, with a message naming our files.
            const { service, model } = await makeService( { branding: makeBranding() } );

            model.markApplied.mockRejectedValueOnce( new Error( "PrismaClientKnownRequestError at /srv/app/node_modules/.prisma" ) );

            // Act.
            const result = await service.apply( GUILD_ID );

            // Assert.
            expect( result ).toEqual( { outcome: GUILD_BRANDING_APPLY_OUTCOMES.FAILED } );
        } );
    } );

    describe( "reconcile()", () => {
        it( "should take the profile off a server whose plan ended, and keep what it saved", async() => {
            // Arrange.
            const { service, world, model } = await makeService( {
                canBrand: false,
                branding: makeBranding(),
                states: [ makeState( { appliedNick: true, previousNick: "Helper" } ) ],
                nickname: "Arena"
            } );

            // Act.
            await service.reconcile();

            // Assert.
            expect( world.edits ).toEqual( [ expect.objectContaining( { avatar: null, banner: null, bio: null, nick: "Helper" } ) ] );
            expect( world.states[ 0 ].appliedRevision ).toBeNull();
            expect( model.save ).not.toHaveBeenCalled();
            expect( model.get ).not.toHaveBeenCalled();
            expect( world.branding ).not.toBeNull();
        } );

        it( "should owe the name back when the plan ended without the permission, and give it once it can", async() => {
            // Arrange - named "Helper" by an admin, then "Arena" by the profile.
            const { service, world } = await makeService( {
                canBrand: false,
                branding: makeBranding(),
                states: [ makeState( { appliedNick: true, previousNick: "Helper" } ) ],
                nickname: "Arena",
                canChangeNickname: false
            } );

            // Act - the plan ends while the bot may not change its name, then it is given the permission.
            await service.reconcile();

            const owed = { ... world.states[ 0 ] };

            world.canChangeNickname = true;

            await service.reconcile();

            // Assert.
            expect( world.edits[ 0 ] ).not.toHaveProperty( "nick" );
            expect( owed ).toMatchObject( { appliedRevision: null, appliedNick: true, previousNick: "Helper", nickPending: true } );
            expect( world.edits[ 1 ] ).toMatchObject( { nick: "Helper" } );
            expect( world.nickname ).toBe( "Helper" );
            expect( world.states[ 0 ] ).toMatchObject( { appliedNick: false, nickPending: false } );
        } );

        it( "should give back the admin's name, not the profile's, when a server that owed it pays again", async() => {
            // Arrange - the plan ended without the permission, so "Helper" is owed and "Arena" still on.
            const { service, world } = await makeService( {
                branding: makeBranding(),
                states: [ makeState( {
                    appliedRevision: null,
                    appliedAt: null,
                    appliedNick: true,
                    previousNick: "Helper",
                    nickPending: true
                } ) ],
                nickname: "Arena"
            } );

            // Act - it pays again, and later the profile stops naming the bot.
            await service.reconcile();

            world.branding = makeBranding( { nick: null, revision: 2 } );

            await service.apply( GUILD_ID );

            // Assert.
            expect( world.nickname ).toBe( "Helper" );
        } );

        it( "should put the saved profile back on a server that pays again", async() => {
            // Arrange - taken off when it lapsed, and the server has paid since.
            const { service, world } = await makeService( {
                branding: makeBranding(),
                states: [ makeState( { appliedRevision: null, appliedAt: null, appliedNick: false } ) ]
            } );

            // Act.
            await service.reconcile();

            // Assert.
            expect( world.edits ).toHaveLength( 1 );
            expect( world.states[ 0 ].appliedRevision ).toBe( 1 );
        } );

        it( "should correct the record, and touch nothing, after the bot was removed while not paying", async() => {
            // Arrange - the state predates the bot's current join; the new member wears nothing.
            const { service, world } = await makeService( {
                canBrand: false,
                branding: makeBranding(),
                states: [ makeState( { appliedAt: new Date( NOW.getTime() - 60 * 60 * 1000 ), lastAttemptAt: new Date( NOW.getTime() - 60 * 60 * 1000 ) } ) ],
                joinedTimestamp: NOW.getTime() - 60 * 1000
            } );

            // Act.
            await service.reconcile();

            // Assert.
            expect( world.edits ).toHaveLength( 0 );
            expect( world.states[ 0 ].appliedRevision ).toBeNull();
        } );

        it( "should leave alone what another bot sharing the database applied", async() => {
            // Arrange - the other application wears the profile; this one never did, and the server
            // has stopped paying.
            const otherState = makeState( { applicationId: OTHER_APP_ID } );

            const { service, world } = await makeService( { canBrand: false, branding: makeBranding(), states: [ otherState ] } );

            // Act.
            await service.reconcile();

            // Assert.
            expect( world.edits ).toHaveLength( 0 );
            expect( otherState.appliedRevision ).toBe( 1 );
        } );

        it( "should leave a guild another shard holds to that shard", async() => {
            // Arrange - the guild is on shard 1, and this process runs shard 0.
            process.env.SHARD_COUNT = "2";
            process.env.SHARD_IDS = "0";

            const { service, world } = await makeService( { branding: makeBranding() } );

            // Act.
            await service.reconcile();

            // Assert.
            expect( world.edits ).toHaveLength( 0 );
        } );

        it( "should not start a sweep while one is still going", async() => {
            // Arrange - discord never answers, so the first sweep never ends.
            const { service, world } = await makeService( { branding: makeBranding(), discord: "hangs" } );

            const first = service.reconcile();

            await jest.advanceTimersByTimeAsync( 0 );

            // Act.
            await service.reconcile();

            // Assert.
            expect( world.edits ).toHaveLength( 1 );

            void first;
        } );
    } );
} );
