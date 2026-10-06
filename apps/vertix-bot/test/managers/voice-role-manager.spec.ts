import { jest } from "@jest/globals";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { VoiceRoleManager } from "@vertix.gg/bot/src/managers/voice-role-manager";

import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import type { Guild, GuildMember, Role } from "discord.js";

/**
 * A guild is only ever asked for its id here, because `reconcileGuild()` is replaced in every test.
 *
 * What is under test is the gate in front of it - how many times it runs, and whether a failure
 * leaves the guild able to try again - not the reconcile itself.
 */
function aGuild( id: string ): Guild {
    return { id, name: `guild-${ id }` } as unknown as Guild;
}

/**
 * Each test uses an id of its own.
 *
 * `VoiceRoleManager` is a singleton and the map of reconciled guilds is deliberately process-wide,
 * so there is nothing to reset between tests - a fresh id is the isolation.
 */
let nextGuildId = 0;

const anUnseenGuild = () => aGuild( `guild-${ ++nextGuildId }` );

const asInstance = <T>( fake: object ): T => fake as T;

const DYNAMIC_CHANNEL_ID = "dynamic-channel",
    OWN_ROLE_DYNAMIC_CHANNEL_ID = "dynamic-channel-of-a-generator-with-its-own-role",
    LOUNGE_CHANNEL_ID = "lounge";

const VOICE_ROLE_ID = "role-voice",
    TALKING_ROLE_ID = "role-talking";

/**
 * A guild with people sitting in its voice channels, each holding whatever roles they were handed.
 *
 * `seat()` puts one member in a channel and answers with the roles they hold, which is what every
 * test reads back: the role calls change it the way discord would.
 */
function aVoiceGuild() {
    const voiceStates = new Map<string, { member: GuildMember; channelId: string | null }>();

    const guild = asInstance<Guild>( {
        id: `guild-${ ++nextGuildId }`,
        roles: {
            cache: new Map( [ VOICE_ROLE_ID, TALKING_ROLE_ID ].map( ( id ) => [ id, asInstance<Role>( { id } ) ] ) )
        },
        voiceStates: { cache: voiceStates }
    } );

    const seat = ( memberId: string, channelId: string | null, holds: readonly string[] = [] ) => {
        const held = new Set( holds );

        const member = asInstance<GuildMember>( {
            id: memberId,
            guild,
            roles: {
                cache: { has: ( roleId: string ) => held.has( roleId ) },
                add: jest.fn( async( role: Role ) => {
                    held.add( role.id );
                } ),
                remove: jest.fn( async( role: Role ) => {
                    held.delete( role.id );
                } )
            }
        } );

        voiceStates.set( memberId, { member, channelId } );

        return held;
    };

    return { guild, seat };
}

/**
 * What the bot reads to decide which role a channel gives: which channels are dynamic, each one's
 * generator and its own voice role, and the guild wide one beneath them.
 */
function stubVoiceRoleSettings( options: {
    guildRoleId: string | null;
    /** A generator's own voice role, by a dynamic channel it made. */
    ownRoleIds?: Readonly<Record<string, string | null>>;
} ) {
    const ownRoleIds = options.ownRoleIds ?? {};

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        isDynamic: async( channelId: string ) => [ DYNAMIC_CHANNEL_ID, OWN_ROLE_DYNAMIC_CHANNEL_ID ].includes( channelId ),
        getMasterByDynamicChannelId: async( channelId: string ) => ( { id: `generator-of-${ channelId }`, channelId } )
    } ) );

    jest.spyOn( MasterChannelDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getChannelVoiceRoleId: async( generator: { channelId: string } ) => ownRoleIds[ generator.channelId ] ?? null
    } ) );

    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getVoiceRoleId: async() => options.guildRoleId
    } ) );

    jest.spyOn( VoiceRoleManager.$, "isRoleAssignable" ).mockReturnValue( { assignable: true } );
}

describe( "VertixBot/Managers/VoiceRole", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    describe( "ensureGuildReconciled()", () => {
        it( "should reconcile a guild the first time it is asked", async() => {
            const guild = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( guild );

            expect( reconcile ).toHaveBeenCalledTimes( 1 );
            expect( reconcile ).toHaveBeenCalledWith( guild );
        } );

        // The whole point of moving this off startup: a guild pays for it once, on first use, not
        // once per process-start for every guild the bot is in.
        it( "should not reconcile the same guild twice", async() => {
            const guild = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( guild );
            await VoiceRoleManager.$.ensureGuildReconciled( guild );
            await VoiceRoleManager.$.ensureGuildReconciled( guild );

            expect( reconcile ).toHaveBeenCalledTimes( 1 );
        } );

        // Several people joining at once is the normal way a guild wakes up, and every one of those
        // joins calls this. Holding the promise rather than a flag is what keeps that one reconcile.
        it( "should fold concurrent callers into one reconcile", async() => {
            const guild = anUnseenGuild();

            let release: () => void = () => {};

            const reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                .mockImplementation( () => new Promise<void>( ( resolve ) => {
                    release = resolve;
                } ) );

            const callers = [
                VoiceRoleManager.$.ensureGuildReconciled( guild ),
                VoiceRoleManager.$.ensureGuildReconciled( guild ),
                VoiceRoleManager.$.ensureGuildReconciled( guild )
            ];

            release();

            await Promise.all( callers );

            expect( reconcile ).toHaveBeenCalledTimes( 1 );
        } );

        // A guild left un-reconciled goes on handing out a role nobody should hold, so a failure
        // must not be remembered as success.
        it( "should try again after a failed reconcile", async() => {
            const guild = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockRejectedValueOnce( new Error( "discord said no" ) )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( guild );
            await VoiceRoleManager.$.ensureGuildReconciled( guild );

            expect( reconcile ).toHaveBeenCalledTimes( 2 );
        } );

        it( "should not reject when the reconcile fails", async() => {
            const guild = anUnseenGuild();

            jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                .mockRejectedValue( new Error( "discord said no" ) );

            await expect( VoiceRoleManager.$.ensureGuildReconciled( guild ) ).resolves.toBeUndefined();
        } );

        it( "should keep guilds apart", async() => {
            const first = anUnseenGuild(),
                second = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( first );
            await VoiceRoleManager.$.ensureGuildReconciled( second );

            expect( reconcile ).toHaveBeenCalledTimes( 2 );
        } );
    } );

    /**
     * The setting changing under people already sitting in channels.
     *
     * Leaving takes off the role the channel gives *now*, so before this a member given @Voice who
     * left after the setting moved to @Talking had @Talking "taken off" - which they never held - and
     * kept @Voice for good, since the reconcile only reclaims roles that are still configured.
     */
    describe( "resyncGuild()", () => {
        it( "should move a member in a channel off the previous role and onto the new one", async() => {
            stubVoiceRoleSettings( { guildRoleId: TALKING_ROLE_ID } );

            const { guild, seat } = aVoiceGuild(),
                alex = seat( "alex", DYNAMIC_CHANNEL_ID, [ VOICE_ROLE_ID ] );

            await VoiceRoleManager.$.resyncGuild( guild, [ VOICE_ROLE_ID ] );

            expect( [ ...alex ] ).toEqual( [ TALKING_ROLE_ID ] );
        } );

        it( "should take the previous role off when the setting was cleared", async() => {
            stubVoiceRoleSettings( { guildRoleId: null } );

            const { guild, seat } = aVoiceGuild(),
                alex = seat( "alex", DYNAMIC_CHANNEL_ID, [ VOICE_ROLE_ID ] );

            await VoiceRoleManager.$.resyncGuild( guild, [ VOICE_ROLE_ID ] );

            expect( [ ...alex ] ).toEqual( [] );
        } );

        // Somebody already in a channel when a role is first set used to get it only on their next move.
        it( "should hand the role to a member who was in a channel before it was set", async() => {
            stubVoiceRoleSettings( { guildRoleId: VOICE_ROLE_ID } );

            const { guild, seat } = aVoiceGuild(),
                alex = seat( "alex", DYNAMIC_CHANNEL_ID );

            await VoiceRoleManager.$.resyncGuild( guild, [ null ] );

            expect( [ ...alex ] ).toEqual( [ VOICE_ROLE_ID ] );
        } );

        // A generator's own role clearing hands its channels back to the guild wide one.
        it( "should move a member onto the guild wide role when their generator's own role was cleared", async() => {
            stubVoiceRoleSettings( { guildRoleId: TALKING_ROLE_ID, ownRoleIds: { [ DYNAMIC_CHANNEL_ID ]: null } } );

            const { guild, seat } = aVoiceGuild(),
                alex = seat( "alex", DYNAMIC_CHANNEL_ID, [ VOICE_ROLE_ID ] );

            await VoiceRoleManager.$.resyncGuild( guild, [ VOICE_ROLE_ID ] );

            expect( [ ...alex ] ).toEqual( [ TALKING_ROLE_ID ] );
        } );

        // The guild wide role moved, but this generator gives a role of its own - which did not.
        it( "should leave a member whose channel still gives the previous role", async() => {
            stubVoiceRoleSettings( {
                guildRoleId: TALKING_ROLE_ID,
                ownRoleIds: { [ OWN_ROLE_DYNAMIC_CHANNEL_ID ]: VOICE_ROLE_ID }
            } );

            const { guild, seat } = aVoiceGuild(),
                jordan = seat( "jordan", OWN_ROLE_DYNAMIC_CHANNEL_ID, [ VOICE_ROLE_ID ] );

            await VoiceRoleManager.$.resyncGuild( guild, [ VOICE_ROLE_ID ] );

            expect( [ ...jordan ] ).toEqual( [ VOICE_ROLE_ID ] );
        } );

        // Anybody outside a dynamic channel already lost the role on leaving one, back when it was
        // still the one that channel gave - so whatever they hold now is not the bot's to take.
        it( "should not touch a member in a channel the bot did not make", async() => {
            stubVoiceRoleSettings( { guildRoleId: TALKING_ROLE_ID } );

            const { guild, seat } = aVoiceGuild(),
                sam = seat( "sam", LOUNGE_CHANNEL_ID, [ VOICE_ROLE_ID ] );

            await VoiceRoleManager.$.resyncGuild( guild, [ VOICE_ROLE_ID ] );

            expect( [ ...sam ] ).toEqual( [ VOICE_ROLE_ID ] );
        } );

        // Callers leave it running behind a screen they have already answered, so a failure has to
        // end here rather than as an unhandled rejection.
        it( "should not reject when reading the setting fails", async() => {
            stubVoiceRoleSettings( { guildRoleId: TALKING_ROLE_ID } );

            jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
                isDynamic: async() => {
                    throw new Error( "the database went away" );
                }
            } ) );

            const { guild, seat } = aVoiceGuild();

            seat( "alex", DYNAMIC_CHANNEL_ID, [ VOICE_ROLE_ID ] );

            await expect( VoiceRoleManager.$.resyncGuild( guild, [ VOICE_ROLE_ID ] ) ).resolves.toBeUndefined();
        } );
    } );

    describe( "resolveMasterRoleId()", () => {
        const generator = asInstance<ChannelExtended>( { id: "generator", channelId: DYNAMIC_CHANNEL_ID } );

        it( "should answer with the generator's own role", async() => {
            stubVoiceRoleSettings( { guildRoleId: TALKING_ROLE_ID, ownRoleIds: { [ DYNAMIC_CHANNEL_ID ]: VOICE_ROLE_ID } } );

            await expect( VoiceRoleManager.$.resolveMasterRoleId( generator, "guild" ) ).resolves.toBe( VOICE_ROLE_ID );
        } );

        it( "should fall back to the guild wide role when the generator has none of its own", async() => {
            stubVoiceRoleSettings( { guildRoleId: TALKING_ROLE_ID } );

            await expect( VoiceRoleManager.$.resolveMasterRoleId( generator, "guild" ) ).resolves.toBe( TALKING_ROLE_ID );
        } );
    } );
} );
