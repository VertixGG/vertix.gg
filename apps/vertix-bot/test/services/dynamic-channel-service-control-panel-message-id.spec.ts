import { jest } from "@jest/globals";

import { ChannelType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const CONTROL_CHANNEL_ID = "840000000000000010",
    OTHER_CONTROL_CHANNEL_ID = "840000000000000011",
    MASTER_CHANNEL_ID = "840000000000000020",
    MASTER_DB_ID = "master-db-1",
    BOT_USER_ID = "840000000000000099",
    PANEL_MESSAGE_ID = "840000000000000500",
    OTHER_MESSAGE_ID = "840000000000000600";

const PANEL_DRAWING = { embeds: [ { title: "Manage your Dynamic Channel" } ], components: [], content: "" },
    CHANGED_PANEL_DRAWING = { embeds: [ { title: "Gérez votre salon dynamique" } ], components: [], content: "" };

interface IHarnessOptions {
    /** What the generator's row already remembers, if anything. */
    storedMessageId: string | null;
    /** What the row remembers the panel was last drawn with. */
    storedHash?: string | null;
    /** Whether fetching that id still resolves - a panel can be deleted by hand. */
    storedMessageStillExists?: boolean;
    /** Whether the bulk search finds a message of the bot's. */
    searchFindsMessage?: boolean;
    /** What the panel adapter draws, before anything is sent. */
    drawing?: object;
    /** Where the generator's panel lives. */
    controlChannelId?: string;
}

/**
 * Stands up only what `refreshControlPanel()` reaches for, the way the specs next door do.
 *
 * What is recorded is the four things worth asserting: whether the hundred-message search ran, which
 * message was edited or whether one was sent, and what - if anything - was written back to the
 * generator's row.
 */
async function makeService( options: IHarnessOptions ) {
    const {
        storedMessageId,
        storedHash = null,
        storedMessageStillExists = true,
        searchFindsMessage = true,
        drawing = PANEL_DRAWING,
        controlChannelId = CONTROL_CHANNEL_ID
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
        stored: [] as { messageId: string | null; hash: string | null }[]
    };

    jest.spyOn( MasterChannelDataManager.$, "getAllSettings" ).mockResolvedValue( {
        dynamicChannelControlChannelId: controlChannelId,
        dynamicChannelControlMessageId: storedMessageId,
        dynamicChannelControlMessageHash: storedHash,
        dynamicChannelButtonsTemplate: []
    } as never );

    jest.spyOn( MasterChannelDataManager.$, "setChannelControlMessage" )
        .mockImplementation( async( _master, messageId, hash ) => {
            recorded.stored.push( { messageId, hash } );

            return undefined as never;
        } );

    const aMessage = ( id: string ) => ( {
        id,
        author: { id: BOT_USER_ID },
        createdTimestamp: 1
    } );

    const controlChannel = {
        id: controlChannelId,
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
            cache: new Map( [ [ controlChannelId, controlChannel ] ] ),
            fetch: async() => controlChannel
        }
    };

    const service = Object.create( DynamicChannelService.prototype ) as InstanceType<typeof DynamicChannelService>;

    Object.assign( service, {
        logger: { log: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        services: {
            uiService: {
                get: () => ( {
                    render: async() => drawing,
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

/**
 * Draws a panel once, the way the first restart after this change finds every panel, and hands
 * back the hash it remembered - which is what the next restart compares against.
 */
async function drawnHash() {
    const { service, guild, masterChannelDB, recorded } = await makeService( {
        storedMessageId: PANEL_MESSAGE_ID
    } );

    await service.refreshControlPanel( guild as never, masterChannelDB as never );

    return recorded.stored[ 0 ].hash;
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

    // The id was already right; the drawing is what is new, and a redraw that is not remembered is
    // paid for again on the next restart.
    it( "should remember what it drew alongside the id it already had", async() => {
        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: PANEL_MESSAGE_ID
        } );

        await service.refreshControlPanel( guild as never, masterChannelDB as never );

        expect( recorded.stored ).toEqual( [ { messageId: PANEL_MESSAGE_ID, hash: expect.any( String ) } ] );
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
        expect( recorded.stored ).toEqual( [ { messageId: OTHER_MESSAGE_ID, hash: expect.any( String ) } ] );
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
        expect( recorded.stored ).toEqual( [ { messageId: OTHER_MESSAGE_ID, hash: expect.any( String ) } ] );
    } );

    it( "should send a new panel and remember it when there is nothing to edit", async() => {
        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: null,
            searchFindsMessage: false
        } );

        await service.refreshControlPanel( guild as never, masterChannelDB as never );

        expect( recorded.sent ).toBe( true );
        expect( recorded.editedMessageId ).toBeNull();
        expect( recorded.stored ).toEqual( [ { messageId: PANEL_MESSAGE_ID, hash: expect.any( String ) } ] );
    } );
} );

/**
 * Every restart used to fetch and edit every panel whether or not anything on it had changed - a
 * pair of discord requests per generator, which made startup grow with how many generators exist
 * rather than with how many changed.
 */
describe( "VertixBot/Services/DynamicChannel - unchanged control panel", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should leave a panel alone when it would draw what it already shows", async() => {
        // Arrange.
        const hash = await drawnHash();

        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: PANEL_MESSAGE_ID,
            storedHash: hash
        } );

        // Act.
        const drawn = await service.refreshControlPanel( guild as never, masterChannelDB as never );

        // Assert - nothing asked of discord, and nothing written.
        expect( drawn ).toBe( false );
        expect( recorded.fetchedById ).toEqual( [] );
        expect( recorded.bulkFetches ).toBe( 0 );
        expect( recorded.editedMessageId ).toBeNull();
        expect( recorded.sent ).toBe( false );
        expect( recorded.stored ).toEqual( [] );
    } );

    // Its buttons, its text, its language, its customization - whatever reaches the panel reaches
    // the drawing, which is why the drawing is what is compared. Here, a guild that switched language.
    it( "should redraw when what it would draw has changed", async() => {
        // Arrange.
        const hash = await drawnHash();

        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: PANEL_MESSAGE_ID,
            storedHash: hash,
            drawing: CHANGED_PANEL_DRAWING
        } );

        // Act.
        const drawn = await service.refreshControlPanel( guild as never, masterChannelDB as never );

        // Assert.
        expect( drawn ).toBe( true );
        expect( recorded.editedMessageId ).toBe( PANEL_MESSAGE_ID );
        expect( recorded.stored ).toHaveLength( 1 );
        expect( recorded.stored[ 0 ].hash ).not.toBe( hash );
    } );

    // Turning the control channel back on makes a new channel and posts the same panel into it,
    // while the stored id still points into the old one. The drawing alone would match.
    it( "should redraw a panel whose control channel was replaced, though it draws the same", async() => {
        // Arrange.
        const hash = await drawnHash();

        const { service, guild, masterChannelDB, recorded } = await makeService( {
            storedMessageId: PANEL_MESSAGE_ID,
            storedHash: hash,
            storedMessageStillExists: false,
            controlChannelId: OTHER_CONTROL_CHANNEL_ID
        } );

        // Act.
        const drawn = await service.refreshControlPanel( guild as never, masterChannelDB as never );

        // Assert - the panel in the new channel is found, and the row points at it from now on.
        expect( drawn ).toBe( true );
        expect( recorded.bulkFetches ).toBe( 1 );
        expect( recorded.editedMessageId ).toBe( OTHER_MESSAGE_ID );
        expect( recorded.stored ).toEqual( [ { messageId: OTHER_MESSAGE_ID, hash: expect.any( String ) } ] );
        expect( recorded.stored[ 0 ].hash ).not.toBe( hash );
    } );
} );
