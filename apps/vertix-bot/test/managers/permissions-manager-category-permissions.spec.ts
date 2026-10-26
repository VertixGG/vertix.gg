import { PermissionsBitField } from "discord.js";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import type { CategoryChannel, GuildMember } from "discord.js";

const { Flags } = PermissionsBitField;

/**
 * The manager without its constructor, which reaches for the service locator for reasons none of
 * this touches. Everything under test is a prototype method, so the prototype is the whole object.
 */
function createManager() {
    return Object.create( PermissionsManager.prototype ) as PermissionsManager;
}

/**
 * A category answering what `permissionsFor()` answers - the bot's role permissions with the
 * category's own overwrites already applied, which is the only form discord weighs a create
 * against. `null` for `held` is the member discord.js has no permissions to compute from.
 */
function createCategory( held: bigint[] | null, hasMember = true ): CategoryChannel {
    const me = hasMember ? { id: "bot-id" } as GuildMember : null;

    return {
        id: "category-id",
        name: "Voice Channels",
        guild: { members: { me } },
        permissionsFor: () => ( held ? new PermissionsBitField( held ) : null )
    } as unknown as CategoryChannel;
}

// What creating a room in a category needs, as the invite asks for it.
const REQUIRED = [
    Flags.ViewChannel, Flags.ManageChannels, Flags.ManageRoles, Flags.ManageMessages,
    Flags.SendMessages, Flags.EmbedLinks, Flags.ReadMessageHistory, Flags.Connect, Flags.MoveMembers
];

describe( "VertixBot/Managers/PermissionsManager/getMissingCategoryPermissions", () => {
    it( "should name what the category withholds", () => {
        // Arrange - a category denying the two the bot needs most, as a staff-only one does.
        const held = REQUIRED.filter( ( flag ) =>
            Flags.ManageChannels !== flag && Flags.ViewChannel !== flag
        );

        // Act.
        const result = createManager().getMissingCategoryPermissions( REQUIRED, createCategory( held ) );

        // Assert.
        expect( result.sort() ).toEqual( [ "ManageChannels", "ViewChannel" ] );
    } );

    it( "should name nothing when the category grants everything", () => {
        // Act.
        const result = createManager().getMissingCategoryPermissions( REQUIRED, createCategory( REQUIRED ) );

        // Assert.
        expect( result ).toEqual( [] );
    } );

    it( "should name nothing for an administrator bot", () => {
        // Arrange - `permissionsFor()` resolves Administrator itself, so it answers the lot.
        const category = createCategory( [ Flags.Administrator, ...REQUIRED ] );

        // Act.
        const result = createManager().getMissingCategoryPermissions( REQUIRED, category );

        // Assert.
        expect( result ).toEqual( [] );
    } );

    it( "should blame nothing when the bot's own member is not cached", () => {
        // Arrange - no member to compute from, so there is no basis to name a permission.
        const category = createCategory( null, false );

        // Act.
        const result = createManager().getMissingCategoryPermissions( REQUIRED, category );

        // Assert - not the whole required list, which would read as a server that granted nothing.
        expect( result ).toEqual( [] );
    } );
} );
