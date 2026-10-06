import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

// Shard 1 of two - `(guild_id >> 22) % 2`.
const GUILD_ID = "820000000000000001";

// Shard 0 of two.
const OTHER_GUILD_ID = "820000000004194305";

const OWNER_ID = "830000000000000001";

const NOW = new Date( "2026-10-18T12:00:00.000Z" );

const daysFromNow = ( days: number ) => new Date( NOW.getTime() + days * 24 * 60 * 60 * 1000 );

interface IGuild {
    id: string;
    name: string;
    ownerId: string;
}

interface IWorld {
    /** What the sweep's question to the database answers with. */
    trials: Array<{ guildId: string; trialEndsAt: Date | null }>;
    /** The guilds the bot is in, as its cache holds them. */
    guilds: IGuild[];
    /** Whether the entitlement service says a server is due its warning. */
    isDue: boolean;
    /** Whether this process gets the claim, or another got there first. */
    claims: boolean;
    /** Whether the direct message lands. */
    lands: boolean;
    /** How many generators a server keeps once its trial is over. */
    maxMasterChannelsAfterTrial: number;
}

const makeGuild = ( id: string, name: string ): IGuild => ( { id, name, ownerId: OWNER_ID } );

/**
 * Stands up the service with the database, the client, the entitlement service and the adapter it
 * reads, and nothing else.
 *
 * Built off the prototype rather than constructed, so none of the base class's wiring has to exist.
 */
async function makeService( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = {
        trials: [ { guildId: GUILD_ID, trialEndsAt: daysFromNow( 1 ) } ],
        guilds: [ makeGuild( GUILD_ID, "Raid Club" ) ],
        isDue: true,
        claims: true,
        lands: true,
        maxMasterChannelsAfterTrial: 2,
        ... world
    };

    const { GuildModel } = await import( "@vertix.gg/data/src/models/guild-model" );
    const { GuildTrialWarningService } = await import( "@vertix.gg/bot/src/services/guild-trial-warning-service" );

    const guildModel = {
        getTrialsToWarn: jest.fn( async( _now: Date, _cutoff: Date ) => settled.trials ),
        claimTrialWarning: jest.fn( async( _guildId: string, _at: Date ) => settled.claims )
    };

    const adapter = {
        sendToUser: jest.fn( async( _guildId: string, _userId: string, _args: object ) => settled.lands )
    };

    const client = {
        user: { id: "app" },
        guilds: { cache: new Map( settled.guilds.map( ( guild ) => [ guild.id, guild ] ) ) }
    };

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( GuildModel, "$", "get" ).mockReturnValue( asInstance( guildModel ) );

    const logged: string[] = [];

    const service = Object.create( GuildTrialWarningService.prototype ) as InstanceType<typeof GuildTrialWarningService>;

    Object.assign( service, {
        logger: {
            info: ( _caller: unknown, line: string ) => logged.push( line ),
            error: ( _caller: unknown, line: string ) => logged.push( line )
        },
        isSweeping: false,
        services: {
            appService: { getClient: () => client },
            entitlementService: {
                shouldWarnOfTrialEnd: async() => settled.isDue,
                getMaxMasterChannelsAfterTrial: async() => settled.maxMasterChannelsAfterTrial
            },
            uiService: {
                get: ( name: string ) => "VertixBot/UI-General/TrialEndingAdapter" === name ? adapter : undefined
            }
        }
    } );

    return { service, guildModel, adapter, logged };
}

/**
 * The heads-up before a free trial runs out.
 *
 * Worth pinning because both of its mistakes reach a real person: told twice, an owner is nagged by
 * a bot they let in; told nothing, they find the bot's look and their generators gone with no word.
 */
describe( "VertixBot/Services/GuildTrialWarning", () => {
    const configuredPrice = process.env.PADDLE_PRICE_PRO;

    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );

        // The trial is of a tier this deployment sells, and one whose id is not in the environment
        // is not sold - so without this the suite would be testing a deployment with nothing to try.
        process.env.PADDLE_PRICE_PRO = "pri_pro";
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();

        delete process.env.SHARD_COUNT;
        delete process.env.SHARD_IDS;

        if ( undefined === configuredPrice ) {
            delete process.env.PADDLE_PRICE_PRO;
        } else {
            process.env.PADDLE_PRICE_PRO = configuredPrice;
        }
    } );

    describe( "sweep()", () => {
        it( "should tell the owner, in a direct message, when the trial ends and what it takes away", async() => {
            // Arrange.
            const { service, guildModel, adapter } = await makeService();

            // Act.
            await service.sweep( NOW );

            // Assert - asked for trials ending within the warning's two days, and the owner told of this one.
            expect( guildModel.getTrialsToWarn ).toHaveBeenCalledWith( NOW, daysFromNow( 2 ) );
            expect( guildModel.claimTrialWarning ).toHaveBeenCalledWith( GUILD_ID, NOW );
            expect( adapter.sendToUser ).toHaveBeenCalledTimes( 1 );
            expect( adapter.sendToUser ).toHaveBeenCalledWith( GUILD_ID, OWNER_ID, {
                guildName: "Raid Club",
                planName: "Pro",
                endsAt: Math.floor( daysFromNow( 1 ).getTime() / 1000 ),
                maxMasterChannels: "2",
                monthlyPriceUsd: 4
            } );
        } );

        it( "should say how many generators a server keeps when it was granted more than the free ones", async() => {
            // Arrange.
            const { service, adapter } = await makeService( { maxMasterChannelsAfterTrial: 5 } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( adapter.sendToUser ).toHaveBeenCalledWith( GUILD_ID, OWNER_ID, expect.objectContaining( {
                maxMasterChannels: "5"
            } ) );
        } );

        it( "should tell nobody a server that is not due - one that pays, say", async() => {
            // Arrange.
            const { service, guildModel, adapter } = await makeService( { isDue: false } );

            // Act.
            await service.sweep( NOW );

            // Assert - not claimed either, so nothing is used up on a server that has nothing to hear.
            expect( guildModel.claimTrialWarning ).not.toHaveBeenCalled();
            expect( adapter.sendToUser ).not.toHaveBeenCalled();
        } );

        it( "should send nothing when another process claimed the telling first", async() => {
            // Arrange.
            const { service, adapter } = await makeService( { claims: false } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( adapter.sendToUser ).not.toHaveBeenCalled();
        } );

        it( "should log a warning that did not land, once", async() => {
            // Arrange - the owner's direct messages are closed.
            const { service, adapter, logged } = await makeService( { lands: false } );

            // Act.
            await service.sweep( NOW );

            // Assert - claimed before sending, so it is lost rather than retried every hour.
            expect( adapter.sendToUser ).toHaveBeenCalledTimes( 1 );
            expect( logged ).toEqual( [ expect.stringContaining( "the direct message did not go through" ) ] );
        } );

        it( "should leave a guild another shard holds to that shard", async() => {
            // Arrange - the guild is on shard 1, and this process runs shard 0.
            process.env.SHARD_COUNT = "2";
            process.env.SHARD_IDS = "0";

            const { service, guildModel, adapter } = await makeService();

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( guildModel.claimTrialWarning ).not.toHaveBeenCalled();
            expect( adapter.sendToUser ).not.toHaveBeenCalled();
        } );

        it( "should leave a server the bot is not in", async() => {
            // Arrange - the row says it is, the cache says it is not: the cache is this process's own.
            const { service, guildModel, adapter } = await makeService( { guilds: [] } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( guildModel.claimTrialWarning ).not.toHaveBeenCalled();
            expect( adapter.sendToUser ).not.toHaveBeenCalled();
        } );

        it( "should tell nobody where no plan on sale offers a trial", async() => {
            // Arrange - this deployment cannot sell Pro, so there is no trial of it to end.
            delete process.env.PADDLE_PRICE_PRO;

            const { service, guildModel, adapter } = await makeService();

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( guildModel.claimTrialWarning ).not.toHaveBeenCalled();
            expect( adapter.sendToUser ).not.toHaveBeenCalled();
        } );

        it( "should go on to the next server when one fails", async() => {
            // Arrange.
            const { service, guildModel, adapter, logged } = await makeService( {
                trials: [
                    { guildId: GUILD_ID, trialEndsAt: daysFromNow( 1 ) },
                    { guildId: OTHER_GUILD_ID, trialEndsAt: daysFromNow( 1 ) }
                ],
                guilds: [ makeGuild( GUILD_ID, "Raid Club" ), makeGuild( OTHER_GUILD_ID, "Study Hall" ) ]
            } );

            guildModel.claimTrialWarning.mockRejectedValueOnce( new Error( "database went away" ) );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( logged[ 0 ] ).toContain( `Guild id: '${ GUILD_ID }' - Could not warn that its trial is ending` );
            expect( adapter.sendToUser ).toHaveBeenCalledTimes( 1 );
            expect( adapter.sendToUser ).toHaveBeenCalledWith( OTHER_GUILD_ID, OWNER_ID, expect.objectContaining( {
                guildName: "Study Hall"
            } ) );
        } );
    } );
} );
