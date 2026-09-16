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
        warn: ( _caller: unknown, message: string ) => warnings.push( message )
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
