import { jest } from "@jest/globals";

import { ChannelType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const CONTROL_CHANNEL_ID = "840000000000000010",
    MASTER_CHANNEL_ID = "840000000000000020",
    MASTER_DB_ID = "master-db-1",
    BOT_USER_ID = "840000000000000099",
    PANEL_MESSAGE_ID = "840000000000000500",
    OTHER_MESSAGE_ID = "840000000000000600";

interface IHarnessOptions {
    /** What the generator's row already remembers, if anything. */
    storedMessageId: string | null;
    /** Whether fetching that id still resolves - a panel can be deleted by hand. */
    storedMessageStillExists?: boolean;
    /** Whether the bulk search finds a message of the bot's. */
    searchFindsMessage?: boolean;
}

/**
 * Stands up only what `refreshControlPanel()` reaches for, the way the specs next door do.
 *
 * What is recorded is the three things worth asserting: whether the hundred-message search ran,
 * which message was edited, and what - if anything - was written back to the generator's row.
 */
async function makeService( options: IHarnessOptions ) {
    const {
        storedMessageId,
        storedMessageStillExists = true,
        searchFindsMessage = true
    } = options;

    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    // `MasterChannelDataManager` resolves its configuration the moment it is constructed, and the
    // real registry is only populated by the bot's startup. The specs next door stub it the same way.
    const { ConfigManager } = await import( "@vertix.gg/data/src/managers/config-manager" );

    jest.spyOn( ConfigManager.$, "get" ).mockReturnValue( { getKeys: () => ( {} ) } as never );

    const { MasterChannelDataManager } = await import( "@vertix.gg/data/src/managers/master-channel-data-manager" );

    const recorded = {
        bulkFetches: 0,
        fetchedById: [] as string[],
        editedMessageId: null as string | null,
        sent: false,
        storedIds: [] as ( string | null )[]
    };

    jest.spyOn( MasterChannelDataManager.$, "getAllSettings" ).mockResolvedValue( {
        dynamicChannelControlChannelId: CONTROL_CHANNEL_ID,
        dynamicChannelControlMessageId: storedMessageId,
        dynamicChannelButtonsTemplate: []
    } as never );

    jest.spyOn( MasterChannelDataManager.$, "setChannelControlMessageId" )
        .mockImplementation( async( _master, messageId ) => {
            recorded.storedIds.push( messageId );

            return undefined as never;
        } );

    const aMessage = ( id: string ) => ( {
        id,
        author: { id: BOT_USER_ID },
        createdTimestamp: 1
    } );

    const controlChannel = {
        id: CONTROL_CHANNEL_ID,
        type: ChannelType.GuildText,
        messages: {
            fetch: async( arg: unknown ) => {
                // discord.js overloads this: a string is one message by id, an options object is
                // the bulk read. Telling them apart here is the whole point of the change.
                if ( "string" === typeof arg ) {
                    recorded.fetchedById.push( arg );

                    if ( ! storedMessageStillExists ) {
                        throw new Error( "Unknown Message" );
                    }

                    return aMessage( arg );
                }

                recorded.bulkFetches++;

                const found = searchFindsMessage ? [ [ OTHER_MESSAGE_ID, aMessage( OTHER_MESSAGE_ID ) ] ] : [];

                const collection = new Map( found as [ string, unknown ][] ) as unknown as {
                    filter: ( fn: ( m: { author: { id: string } } ) => boolean ) => unknown;
                };

                // Only the three calls the code makes are provided, chained the way it chains them.
                const values = found.map( ( [ , message ] ) => message );

                collection.filter = () => ( {
                    sort: () => ( {
                        first: () => values[ 0 ]
                    } )
                } );

                return collection;
            }
        }
    };

    const guild = {
        id: "840000000000000001",
        name: "a guild",
        channels: {
            cache: new Map( [ [ CONTROL_CHANNEL_ID, controlChannel ] ] ),
            fetch: async() => controlChannel
        }
    };

    const service = Object.create( DynamicChannelService.prototype ) as InstanceType<typeof DynamicChannelService>;

    Object.assign( service, {
        logger: { log: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        services: {
            uiService: {
                get: () => ( {
                    editMessage: async( message: { id: string } ) => {
                        recorded.editedMessageId = message.id;
                    },
                    send: async() => {
                        recorded.sent = true;

                        return aMessage( PANEL_MESSAGE_ID );
                    }
                } )
            },
            appService: {
                getClient: () => ( { user: { id: BOT_USER_ID } } )
            }
        }
    } );

    const masterChannelDB = {
        id: MASTER_DB_ID,
        channelId: MASTER_CHANNEL_ID,
        version: "0.0.2"
    };

    return { service, guild, masterChannelDB, recorded };
}

describe( "VertixBot/Services/DynamicChannel - control panel message id", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    // The point of storing it: one fetch by id instead of a hundred messages, per generator, on
    // every restart.
    it( "should edit the stored message without searching for it", async() => {
        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: PANEL_MESSAGE_ID
        } );

        await service.refreshControlPanel( guild as never, masterChannelDB as never );

        expect( recorded.fetchedById ).toEqual( [ PANEL_MESSAGE_ID ] );
        expect( recorded.bulkFetches ).toBe( 0 );
        expect( recorded.editedMessageId ).toBe( PANEL_MESSAGE_ID );
    } );

    // Writing a row for every generator on every restart would trade one REST call for one database
    // write, which is not a trade worth making.
    it( "should not write the id back when it is already what is stored", async() => {
        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: PANEL_MESSAGE_ID
        } );

        await service.refreshControlPanel( guild as never, masterChannelDB as never );

        expect( recorded.storedIds ).toEqual( [] );
    } );

    // How a generator that predates this gets its id - and the reason the search is kept.
    it( "should search when nothing is stored, then remember what it found", async() => {
        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: null
        } );

        await service.refreshControlPanel( guild as never, masterChannelDB as never );

        expect( recorded.fetchedById ).toEqual( [] );
        expect( recorded.bulkFetches ).toBe( 1 );
        expect( recorded.editedMessageId ).toBe( OTHER_MESSAGE_ID );
        expect( recorded.storedIds ).toEqual( [ OTHER_MESSAGE_ID ] );
    } );

    // A panel can be deleted by hand, so a stored id is a hint rather than a guarantee.
    it( "should fall back to the search when the stored message is gone", async() => {
        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: PANEL_MESSAGE_ID,
            storedMessageStillExists: false
        } );

        await service.refreshControlPanel( guild as never, masterChannelDB as never );

        expect( recorded.fetchedById ).toEqual( [ PANEL_MESSAGE_ID ] );
        expect( recorded.bulkFetches ).toBe( 1 );
        expect( recorded.editedMessageId ).toBe( OTHER_MESSAGE_ID );
        expect( recorded.storedIds ).toEqual( [ OTHER_MESSAGE_ID ] );
    } );

    it( "should send a new panel and remember it when there is nothing to edit", async() => {
        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: null,
            searchFindsMessage: false
        } );

        await service.refreshControlPanel( guild as never, masterChannelDB as never );

        expect( recorded.sent ).toBe( true );
        expect( recorded.editedMessageId ).toBeNull();
        expect( recorded.storedIds ).toEqual( [ PANEL_MESSAGE_ID ] );
    } );
} );
