import { PermissionsBitField } from "discord.js";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import type { Guild, OverwriteResolvable } from "discord.js";

const { Flags } = PermissionsBitField;

const BOT_ID = "bot-id";

/**
 * The manager without its constructor, which reaches for the service locator for reasons none of
 * this touches. Everything under test is a prototype method, so the prototype is the whole object.
 */
function createManager() {
    const warnings: string[] = [];

    const manager = Object.create( PermissionsManager.prototype ) as PermissionsManager;

    ( manager as unknown as { logger: { warn: ( ...args: unknown[] ) => void } } ).logger = {
        warn: ( _caller: unknown, message: unknown ) => {
            warnings.push( String( message ) );
        }
    };

    return { manager, warnings };
}

/**
 * A guild holding exactly the permissions given, as `getRolesPermissions()` reads them - one role
 * the bot is a member of, carrying the lot.
 */
function createGuild( granted: bigint[] ): Guild {
    const role = {
        id: "bot-role",
        permissions: new PermissionsBitField( granted ),
        members: new Map( [ [ BOT_ID, {} ] ] )
    };

    return {
        id: "guild-id",
        client: { user: { id: BOT_ID } },
        roles: { cache: new Map( [ [ role.id, role ] ] ) },
        members: {
            cache: new Map( [ [ BOT_ID, { permissions: new PermissionsBitField( granted ) } ] ] )
        }
    } as unknown as Guild;
}

const namesOf = ( value: unknown ) => new PermissionsBitField( value as never ).toArray();

// Exactly what the website's "Minimal Permissions" invite grants - the narrowest install shipped,
// and therefore the one everything has to work on.
const MINIMAL_INVITE = [
    Flags.ViewChannel, Flags.ManageChannels, Flags.ManageRoles, Flags.ManageMessages,
    Flags.SendMessages, Flags.EmbedLinks, Flags.ReadMessageHistory, Flags.Connect, Flags.MoveMembers
];

describe( "VertixBot/Managers/PermissionsManager/filterWritableOverwrites", () => {

    it( "should keep everything the bot holds", () => {
        const { manager } = createManager();

        const result = manager.filterWritableOverwrites( createGuild( MINIMAL_INVITE ), [
            { id: "role-id", allow: [ Flags.ViewChannel, Flags.Connect ] }
        ] as OverwriteResolvable[] );

        expect( namesOf( result[ 0 ].allow ) ).toEqual( [ "ViewChannel", "Connect" ] );
    } );

    /**
     * Discord permits `ManageRoles` in an overwrite only to guild administrators, however the bot
     * holds it - and the minimal invite does grant it, so nothing that reasons about what the bot
     * holds will catch this one.
     */
    it( "should drop ManageRoles even though the invite grants it", () => {
        const { manager, warnings } = createManager();

        const result = manager.filterWritableOverwrites( createGuild( MINIMAL_INVITE ), [
            { id: BOT_ID, allow: [ Flags.ViewChannel, Flags.ManageRoles, Flags.ManageChannels ] }
        ] as OverwriteResolvable[] );

        expect( namesOf( result[ 0 ].allow ) ).toEqual( [ "ManageChannels", "ViewChannel" ] );
        expect( warnings[ 0 ] ).toContain( "ManageRoles" );
    } );

    // The control panel's deny list names these to make the channel read only. On a minimal install
    // the bot holds neither, so asking for them would cost the whole channel.
    it( "should drop a denied permission the bot was never granted", () => {
        const { manager } = createManager();

        const result = manager.filterWritableOverwrites( createGuild( MINIMAL_INVITE ), [
            { id: "everyone-id", deny: [ Flags.SendMessages, Flags.ManageThreads, Flags.AddReactions ] }
        ] as OverwriteResolvable[] );

        expect( namesOf( result[ 0 ].deny ) ).toEqual( [ "SendMessages" ] );
    } );

    // The lists in this codebase spell these three ways; all of them have to filter.
    it.each( [
        [ "an array", [ Flags.ViewChannel, Flags.ManageThreads ] ],
        [ "a single flag", Flags.ManageThreads ],
        [ "or-ed flags", Flags.ViewChannel | Flags.ManageThreads ]
    ] )( "should filter %s", ( _label, allow ) => {
        const { manager } = createManager();

        const result = manager.filterWritableOverwrites( createGuild( MINIMAL_INVITE ), [
            { id: "role-id", allow }
        ] as unknown as OverwriteResolvable[] );

        expect( namesOf( result[ 0 ].allow ) ).not.toContain( "ManageThreads" );
    } );

    it( "should leave an administrator's overwrites untouched", () => {
        const { manager, warnings } = createManager();
        const requested = [ { id: BOT_ID, allow: [ Flags.ManageRoles, Flags.ManageThreads ] } ] as OverwriteResolvable[];

        const result = manager.filterWritableOverwrites( createGuild( [ Flags.Administrator ] ), requested );

        expect( result ).toBe( requested );
        expect( warnings ).toEqual( [] );
    } );

    it( "should keep the entry itself when every permission on it was dropped", () => {
        const { manager } = createManager();

        const result = manager.filterWritableOverwrites( createGuild( MINIMAL_INVITE ), [
            { id: "role-id", allow: [ Flags.ManageThreads ] }
        ] as OverwriteResolvable[] );

        expect( result ).toHaveLength( 1 );
        expect( result[ 0 ].id ).toBe( "role-id" );
        expect( namesOf( result[ 0 ].allow ) ).toEqual( [] );
    } );
} );

describe( "VertixBot/Managers/PermissionsManager/filterWritablePermissionOptions", () => {

    /**
     * The edit paths describe a change as named permissions, and an edit rewrites the channel's
     * whole overwrite list. So the *change* is filtered and the existing overwrites are not - a
     * filter over the list would quietly delete whatever an admin had set on the channel by hand.
     */
    it( "should keep a change the bot is allowed to write", () => {
        const { manager } = createManager();

        expect(
            manager.filterWritablePermissionOptions( createGuild( MINIMAL_INVITE ), {
                ViewChannel: false,
                Connect: null,
                SendMessages: true
            } )
        ).toEqual( { ViewChannel: false, Connect: null, SendMessages: true } );
    } );

    it( "should drop a permission the bot was never granted", () => {
        const { manager, warnings } = createManager();

        expect(
            manager.filterWritablePermissionOptions( createGuild( MINIMAL_INVITE ), {
                ViewChannel: false,
                ManageThreads: false
            } )
        ).toEqual( { ViewChannel: false } );

        expect( warnings[ 0 ] ).toContain( "ManageThreads" );
    } );

    it( "should drop ManageRoles, which discord permits only to administrators", () => {
        const { manager } = createManager();

        expect(
            manager.filterWritablePermissionOptions( createGuild( MINIMAL_INVITE ), {
                ManageRoles: true,
                Connect: true
            } )
        ).toEqual( { Connect: true } );
    } );

    // `false` and `null` mean different things - denied, and cleared - and neither is "absent".
    it( "should keep a permission being cleared rather than granted", () => {
        const { manager } = createManager();

        expect(
            manager.filterWritablePermissionOptions( createGuild( MINIMAL_INVITE ), { Connect: null } )
        ).toEqual( { Connect: null } );
    } );

    it( "should leave an administrator's change untouched", () => {
        const { manager } = createManager();
        const requested = { ManageRoles: true, ManageThreads: false };

        expect(
            manager.filterWritablePermissionOptions( createGuild( [ Flags.Administrator ] ), requested )
        ).toBe( requested );
    } );
} );

describe( "VertixBot/Managers/PermissionsManager/editChannelRolesPermissions", () => {

    /**
     * The filter existing is not the same as the edit path using it, and this is the test for the
     * second of those. Both audience helpers delegate here, so this call is the only place an edit
     * can ask discord for something it will refuse - and a refusal costs the whole change.
     */
    it( "should not ask discord to write a permission the bot cannot write", async() => {
        const { manager } = createManager();

        const ROLE_ID = "role-id";
        const guild = createGuild( MINIMAL_INVITE ) as unknown as {
            id: string;
            roles: { cache: Map<string, unknown>; everyone: { id: string } };
        };

        // Shaped the way `getRolesPermissions()` walks the cache: every role it sees is asked for
        // its members and its permissions, including ones the bot is not in.
        guild.roles.cache.set( ROLE_ID, {
            id: ROLE_ID,
            permissions: new PermissionsBitField(),
            members: new Map()
        } );
        guild.roles.everyone = { id: "everyone-id" };

        let written: { id: string; allow: bigint; deny: bigint }[] = [];

        const channel = {
            id: "channel-id",
            guildId: guild.id,
            guild,
            permissionOverwrites: {
                cache: new Map(),
                set: async( resolvable: typeof written ) => {
                    written = resolvable;
                }
            }
        };

        ( manager as unknown as { debugger: { dumpDown: () => void } } ).debugger = { dumpDown: () => {} };
        ( manager as unknown as { logger: { log: () => void; warn: () => void } } ).logger.log = () => {};

        await manager.editChannelRolesPermissions( channel as never, [ ROLE_ID ], {
            ViewChannel: false,
            ManageThreads: false
        } );

        const entry = written.find( ( item ) => item.id === ROLE_ID )!;

        expect( namesOf( entry.deny ) ).toEqual( [ "ViewChannel" ] );
        expect( namesOf( entry.deny ) ).not.toContain( "ManageThreads" );
    } );
} );
