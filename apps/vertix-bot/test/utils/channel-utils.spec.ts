import { jest } from "@jest/globals";

import { ChannelType, Collection } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const CATEGORY_ID = "830000000000000001";

interface IFakeChannel {
    id: string;
    type: number;
    parentId: string | null;
}

const asInstance = <T>( fake: object ): T => fake as T;

async function setup( channels: IFakeChannel[] ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { CategoryManager } = await import( "@vertix.gg/bot/src/managers/category-manager" );
    const { ChannelUtils } = await import( "@vertix.gg/bot/src/utils/channel-utils" );

    const deleted: string[] = [];

    jest.spyOn( CategoryManager, "$", "get" ).mockReturnValue( asInstance( {
        delete: async( category: { id: string } ) => {
            deleted.push( category.id );
        }
    } ) );

    const category: IFakeChannel = { id: CATEGORY_ID, type: ChannelType.GuildCategory, parentId: null };

    const guild = {
        channels: {
            cache: new Collection( [ category, ... channels ].map( ( channel ) => [ channel.id, channel ] ) )
        }
    };

    const run = ( target: IFakeChannel | null, closed: string[] ) =>
        ChannelUtils.deleteCategoryUnlessUsed( asInstance( target ?? {} ), asInstance( guild ), closed );

    return { category, deleted, run };
}

const inCategory = ( id: string ): IFakeChannel => ( { id, type: ChannelType.GuildVoice, parentId: CATEGORY_ID } );

/**
 * Taking down a category the bot opened for channels of its own. The channels it just closed can still
 * be in the cache, so they are named; anything else in the category is somebody else's and keeps it.
 */
describe( "VertixBot/Utils/ChannelUtils/deleteCategoryUnlessUsed", () => {
    afterEach( () => jest.restoreAllMocks() );

    it( "should delete it once only the channels just closed are left in it", async() => {
        // Arrange - both rooms were closed, and the cache has not heard of it yet.
        const { category, deleted, run } = await setup( [ inCategory( "room-1" ), inCategory( "room-2" ) ] );

        // Act.
        const result = await run( category, [ "room-1", "room-2" ] );

        // Assert.
        expect( result ).toBe( true );
        expect( deleted ).toEqual( [ CATEGORY_ID ] );
    } );

    it( "should keep it while anything else is in it", async() => {
        // Arrange.
        const { category, deleted, run } = await setup( [ inCategory( "room-1" ), inCategory( "notes" ) ] );

        // Act.
        const result = await run( category, [ "room-1" ] );

        // Assert.
        expect( result ).toBe( false );
        expect( deleted ).toEqual( [] );
    } );

    it( "should delete nothing that is not a category", async() => {
        // Arrange.
        const { deleted, run } = await setup( [ inCategory( "room-1" ) ] );

        // Act.
        const result = await run( inCategory( "room-1" ), [] );

        // Assert.
        expect( result ).toBe( false );
        expect( deleted ).toEqual( [] );
    } );

    it( "should do nothing for a category discord no longer has", async() => {
        // Arrange.
        const { deleted, run } = await setup( [] );

        // Act.
        const result = await run( null, [] );

        // Assert.
        expect( result ).toBe( false );
        expect( deleted ).toEqual( [] );
    } );
} );
