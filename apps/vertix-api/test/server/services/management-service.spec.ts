import { jest } from "@jest/globals";

const GUILD_ID = "820000000000000001",
    GUILD_ROW_ID = "guild-row-1",
    USER_ID = "500000000000000001",
    LOBBY_ROW_ID = "lobby-row-1",
    LOBBY_ID = "840000000000000001",
    CATEGORY_ID = "830000000000000001",
    HOST_ROLE_ID = "860000000000000001";

/**
 * Spied on before anything reads it - `getClient()` answers the same instance every time, which is
 * what lets a spy on it stand in for the database.
 */
async function getClient() {
    const { PrismaBotClient } = await import( "@vertix.gg/prisma/bot-client" );

    return PrismaBotClient.$.getClient();
}

/**
 * The service off its prototype, with an ipc that keeps what it was sent. How many setups a server
 * may have is the bot's to answer, over ipc; what is checked here is what the api does with the answer.
 */
async function makeService( maxMasterChannels: number | null = 2 ) {
    const { ManagementService } = await import( "@vertix.gg/api/src/server/services/management-service" );

    const published: unknown[] = [];

    const service = Object.create( ManagementService.prototype ) as InstanceType<typeof ManagementService>;

    Object.assign( service, {
        services: {
            ipcService: {
                isReady: () => true,
                publish: async( _channel: string, payload: unknown ) => {
                    published.push( payload );
                }
            }
        }
    } );

    jest.spyOn( service as unknown as { getMaxMasterChannels(): Promise<number | null> }, "getMaxMasterChannels" )
        .mockResolvedValue( maxMasterChannels );

    return { service, published };
}

/**
 * Team lobbies from the dashboard: one is a setup like a generator or a pool, made and deleted by the
 * bot on the api's word, and spent from the same allowance.
 */
describe( "VertixAPI/ManagementService/team lobbies", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    describe( "createLobbySetup()", () => {
        it( "should ask the bot for a lobby on a server with room for one", async() => {
            // Arrange.
            const client = await getClient();

            jest.spyOn( client.guild, "findUnique" ).mockResolvedValue( { id: GUILD_ROW_ID } as never );
            jest.spyOn( client.channel, "count" ).mockResolvedValue( 1 as never );

            const { service, published } = await makeService( 2 );

            // Act.
            const result = await service.createLobbySetup( GUILD_ID, USER_ID );

            // Assert.
            expect( result ).toEqual( { code: "started" } );
            expect( published ).toEqual( [ {
                action: "create_lobby_setup",
                data: { guildId: GUILD_ID, userOwnerId: USER_ID }
            } ] );
        } );

        it( "should count every kind of setup, a lobby among them, and refuse one past the allowance", async() => {
            // Arrange - a free server holding a generator and a lobby already.
            const client = await getClient(),
                counted: unknown[] = [];

            jest.spyOn( client.guild, "findUnique" ).mockResolvedValue( { id: GUILD_ROW_ID } as never );
            jest.spyOn( client.channel, "count" ).mockImplementation( ( async( args: unknown ) => {
                counted.push( args );

                return 2;
            } ) as never );

            const { service, published } = await makeService( 2 );

            // Act.
            const result = await service.createLobbySetup( GUILD_ID, USER_ID );

            // Assert.
            expect( result ).toEqual( { code: "limit-reached", maxMasterChannels: 2, masterChannelsCount: 2 } );
            expect( counted ).toEqual( [ {
                where: {
                    guildId: GUILD_ID,
                    internalType: { in: [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL", "MASTER_LOBBY_CHANNEL" ] }
                }
            } ] );
            expect( published ).toEqual( [] );
        } );

        it( "should ask nothing of the bot for a server the api does not know", async() => {
            // Arrange.
            const client = await getClient();

            jest.spyOn( client.guild, "findUnique" ).mockResolvedValue( null as never );

            const { service, published } = await makeService();

            // Act.
            const result = await service.createLobbySetup( GUILD_ID, USER_ID );

            // Assert.
            expect( result ).toEqual( { code: "guild-not-found" } );
            expect( published ).toEqual( [] );
        } );
    } );

    describe( "deleteLobbySetup()", () => {
        it( "should ask the bot to delete a lobby of this server's, looked up as a lobby", async() => {
            // Arrange.
            const client = await getClient(),
                asked: unknown[] = [];

            jest.spyOn( client.channel, "findFirst" ).mockImplementation( ( async( args: unknown ) => {
                asked.push( args );

                return { id: LOBBY_ROW_ID };
            } ) as never );

            const { service, published } = await makeService();

            // Act.
            const result = await service.deleteLobbySetup( GUILD_ID, LOBBY_ROW_ID );

            // Assert - a generator's id given here finds nothing, so this route deletes lobbies only.
            expect( result ).toBe( true );
            expect( asked ).toEqual( [ {
                where: { id: LOBBY_ROW_ID, guildId: GUILD_ID, internalType: "MASTER_LOBBY_CHANNEL" }
            } ] );
            expect( published ).toEqual( [ {
                action: "delete_lobby_setup",
                data: { guildId: GUILD_ID, masterChannelId: LOBBY_ROW_ID }
            } ] );
        } );

        it( "should answer false and ask nothing of the bot for a lobby that is not there", async() => {
            // Arrange.
            const client = await getClient();

            jest.spyOn( client.channel, "findFirst" ).mockResolvedValue( null as never );

            const { service, published } = await makeService();

            // Act.
            const result = await service.deleteLobbySetup( GUILD_ID, LOBBY_ROW_ID );

            // Assert.
            expect( result ).toBe( false );
            expect( published ).toEqual( [] );
        } );
    } );

    describe( "getGuildManagementDetails()", () => {
        it( "should list a server's lobbies with their hosts and the rooms they are split into", async() => {
            // Arrange.
            const client = await getClient(),
                createdAt = new Date( "2026-10-08T12:00:00.000Z" ),
                lobbyQueries: unknown[] = [];

            jest.spyOn( client.guild, "findUnique" ).mockResolvedValue( { id: GUILD_ROW_ID } as never );
            jest.spyOn( client.channel, "count" ).mockResolvedValue( 3 as never );
            jest.spyOn( client.channel, "findMany" ).mockImplementation( ( async( args: { where: { internalType: string } } ) => {
                if ( "MASTER_LOBBY_CHANNEL" !== args.where.internalType ) {
                    return [];
                }

                lobbyQueries.push( args );

                return [ {
                    id: LOBBY_ROW_ID,
                    channelId: LOBBY_ID,
                    categoryId: CATEGORY_ID,
                    createdAt,
                    data: [ { object: { lobbyHostRoleIds: [ HOST_ROLE_ID ] } } ]
                } ];
            } ) as never );

            const { service } = await makeService();

            jest.spyOn( service as unknown as { readGuildSettings(): Promise<unknown> }, "readGuildSettings" )
                .mockResolvedValue( {} );

            // Act.
            const details = await service.getGuildManagementDetails( GUILD_ID );

            // Assert - the settings row read under the key and version the bot files it under.
            expect( details?.lobbyMasterChannels ).toEqual( [ {
                id: LOBBY_ROW_ID,
                channelId: LOBBY_ID,
                categoryId: CATEGORY_ID,
                createdAt,
                lobbyRoomsCount: 3,
                hostRoleIds: [ HOST_ROLE_ID ]
            } ] );
            expect( lobbyQueries ).toEqual( [ {
                where: { guildId: GUILD_ID, internalType: "MASTER_LOBBY_CHANNEL" },
                include: {
                    data: {
                        where: { key: "VertixData/Models/LobbyChannelData/settings", version: "0.0.1.0" }
                    }
                }
            } ] );
        } );
    } );
} );
