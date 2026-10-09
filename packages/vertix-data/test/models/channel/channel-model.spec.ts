import { ChannelModel, MASTER_INTERNAL_TYPES } from "@vertix.gg/data/src/models/channel/channel-model";

const GUILD_ID = "820000000000000001",
    LOBBY_ID = "840000000000000001";

interface IModelCall {
    method: "count" | "findMany";
    args: unknown;
}

/**
 * The model off its prototype, with a prisma delegate that answers nothing and keeps what it was
 * asked. Constructed for real it would want a database; what is checked here is the question it
 * asks one.
 */
function createModel() {
    const calls: IModelCall[] = [];

    const model = Object.create( ChannelModel.prototype ) as ChannelModel;

    Object.assign( model, {
        model: {
            count: async( args: unknown ) => {
                calls.push( { method: "count", args } );

                return 0;
            },
            findMany: async( args: unknown ) => {
                calls.push( { method: "findMany", args } );

                return [];
            }
        },
        debugger: { log: () => {} }
    } );

    return { model, calls };
}

describe( "VertixData/Models/Channel", () => {
    describe( "the master types", () => {
        it( "should know a team lobby for a master, so its chat is never taken for a room's", () => {
            // Act & Assert.
            expect( MASTER_INTERNAL_TYPES ).toContain( "MASTER_LOBBY_CHANNEL" );
        } );
    } );

    describe( "getMastersCount()", () => {
        it( "should count a team lobby against the allowance, as a generator and a pool are", async() => {
            // Arrange.
            const { model, calls } = createModel();

            // Act.
            await model.getMastersCount( GUILD_ID );

            // Assert.
            expect( calls ).toEqual( [ {
                method: "count",
                args: {
                    where: {
                        guildId: GUILD_ID,
                        internalType: { in: [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL", "MASTER_LOBBY_CHANNEL" ] }
                    }
                }
            } ] );
        } );
    } );

    describe( "getMasterIdsByCreation()", () => {
        it( "should order a team lobby among the generators, so the allowance covers whichever came first", async() => {
            // Arrange.
            const { model, calls } = createModel();

            // Act.
            await model.getMasterIdsByCreation( GUILD_ID );

            // Assert.
            expect( calls ).toEqual( [ {
                method: "findMany",
                args: {
                    where: {
                        guildId: GUILD_ID,
                        internalType: { in: [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL", "MASTER_LOBBY_CHANNEL" ] }
                    },
                    orderBy: { createdAt: "asc" },
                    select: { id: true }
                }
            } ] );
        } );
    } );

    describe( "getLobbyRoomsCountByLobbyId()", () => {
        it( "should count a lobby's rooms by the lobby's discord id", async() => {
            // Arrange.
            const { model, calls } = createModel();

            // Act.
            await model.getLobbyRoomsCountByLobbyId( GUILD_ID, LOBBY_ID );

            // Assert.
            expect( calls ).toEqual( [ {
                method: "count",
                args: {
                    where: {
                        guildId: GUILD_ID,
                        ownerChannelId: LOBBY_ID,
                        internalType: "LOBBY_ROOM_CHANNEL"
                    }
                }
            } ] );
        } );
    } );
} );
