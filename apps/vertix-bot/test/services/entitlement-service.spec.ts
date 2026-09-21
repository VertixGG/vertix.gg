import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const GUILD_ID = "820000000000000001";

/**
 * The prices this deployment knows, set before the service is imported.
 *
 * The tiers are read out of the environment, and one whose id is not there is dropped rather than
 * carried with an empty id - so a suite that did not set these would be testing a deployment that
 * can sell nothing, and every subscription in it would be worth the free allowance.
 */
process.env.PADDLE_PRICE_PLUS = "pri_plus";
process.env.PADDLE_PRICE_PRO = "pri_pro";
process.env.PADDLE_PRICE_ULTIMATE = "pri_unlimited";

/** What the tiers above are worth, so a test can say `PRO_ALLOWANCE` rather than `9`. */
const PLUS_ALLOWANCE = 4,
    PRO_ALLOWANCE = 9;

const NOW = new Date( "2026-09-21T12:00:00.000Z" );

const daysFromNow = ( days: number ) => new Date( NOW.getTime() + days * 24 * 60 * 60 * 1000 );

interface ISubscriptionRow {
    priceId: string;
    status: string;
    currentPeriodEnd: Date | null;
}

interface IWorld {
    /** What the guild's own settings row allows, before anything is paid for. */
    granted: number;
    subscription: ISubscriptionRow | null;
    /** The guild's generators, in the order the database returns them - oldest first. */
    masterIds: string[];
}

/**
 * Stands up the service with the three things it reads and nothing else.
 *
 * Built off the prototype rather than constructed, so none of the base class's wiring has to exist;
 * the collaborators are static singletons, which is why they are intercepted at `getInstance`
 * rather than assigned onto the instance like an ordinary dependency.
 */
async function makeService( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = { granted: 2, subscription: null, masterIds: [], ... world };

    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { SubscriptionModel } = await import( "@vertix.gg/data/src/models/subscription-model" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { EntitlementService } = await import( "@vertix.gg/bot/src/services/entitlement-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    // Spied as getters rather than on an instance method: `$` is a lazy accessor that builds the
    // singleton on first touch, and the three of them do not agree on what is behind it.
    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getAllSettings: async() => ( { maxMasterChannels: settled.granted } )
    } ) );

    jest.spyOn( SubscriptionModel, "$", "get" ).mockReturnValue( asInstance( {
        get: async() => settled.subscription
    } ) );

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getMasterIdsByCreation: async() => settled.masterIds
    } ) );

    const service = Object.create( EntitlementService.prototype ) as InstanceType<typeof EntitlementService>;

    Object.assign( service, { debugger: { log: () => undefined } } );

    // The world is handed back mutable on purpose. The singletons are shared, so a second service
    // would re-point them and quietly answer for the first one too - changing the world under one
    // service is what "the same server, before and after" actually looks like.
    return { service, world: settled };
}

/**
 * What a server is allowed, and which of its generators that reaches.
 *
 * Worth covering directly because nothing else does: the money is proven end to end, but this is
 * the half people are actually paying for - and an allowance that reaches the wrong generators is
 * worse than one that reaches none, since it takes down whichever the server had been relying on.
 */
describe( "VertixBot/Services/Entitlement", () => {
    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    } );

    describe( "getMaxMasterChannels()", () => {
        it( "should give a server that pays for nothing what it was granted", async() => {
            // Act.
            const { service } = await makeService( { granted: 2 } );

            // Assert.
            await expect( service.getMaxMasterChannels( GUILD_ID ) ).resolves.toBe( 2 );
        } );

        it( "should raise a server to the tier it pays for", async() => {
            // Act.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_pro", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            await expect( service.getMaxMasterChannels( GUILD_ID ) ).resolves.toBe( PRO_ALLOWANCE );
        } );

        it( "should keep a grant that is worth more than the tier paid for", async() => {
            // Act - a grant is given for a reason, and paying should not be able to take it away.
            const { service } = await makeService( {
                granted: 20,
                subscription: { priceId: "pri_plus", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            await expect( service.getMaxMasterChannels( GUILD_ID ) ).resolves.toBe( 20 );
        } );

        it( "should stop honouring a subscription once the period it paid for has passed", async() => {
            // Act.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_pro", status: "canceled", currentPeriodEnd: daysFromNow( -1 ) }
            } );

            // Assert.
            await expect( service.getMaxMasterChannels( GUILD_ID ) ).resolves.toBe( 2 );
        } );

        it( "should honour a cancelled subscription until the period it paid for ends", async() => {
            // Act - cancelling is not a refund; the rest of the month was bought.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_pro", status: "canceled", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            await expect( service.getMaxMasterChannels( GUILD_ID ) ).resolves.toBe( PRO_ALLOWANCE );
        } );

        it( "should be worth nothing for a price this deployment does not know", async() => {
            // Act - a price from the other paddle account, or one added after this build.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_from_somewhere_else", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            await expect( service.getMaxMasterChannels( GUILD_ID ) ).resolves.toBe( 2 );
        } );
    } );

    describe( "getCoveredMasterChannelIds()", () => {
        it( "should answer null for a server inside its allowance", async() => {
            // Act - null rather than a set of everything, so a caller can tell "all of them" from
            // "these particular ones" without counting.
            const { service } = await makeService( { granted: 2, masterIds: [ "a", "b" ] } );

            // Assert.
            await expect( service.getCoveredMasterChannelIds( GUILD_ID ) ).resolves.toBeNull();
        } );

        it( "should keep the generators that were set up first", async() => {
            // Act - the oldest keep working and the extras are the ones that stop. Nobody chooses
            // and nothing is stored, so this ordering is the whole of the rule.
            const { service } = await makeService( {
                granted: 2,
                masterIds: [ "oldest", "middle", "newest" ]
            } );

            const covered = await service.getCoveredMasterChannelIds( GUILD_ID );

            // Assert.
            expect( covered ).toEqual( new Set( [ "oldest", "middle" ] ) );
        } );

        it( "should cover everything on a tier with no ceiling", async() => {
            // Act.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_unlimited", status: "active", currentPeriodEnd: daysFromNow( 10 ) },
                masterIds: Array.from( { length: 50 }, ( _unused, index ) => `master-${ index }` )
            } );

            // Assert.
            await expect( service.getCoveredMasterChannelIds( GUILD_ID ) ).resolves.toBeNull();
        } );

        it( "should widen when a plan is bought, without anything being moved", async() => {
            // Act - the same five generators, before and after paying.
            const masterIds = [ "a", "b", "c", "d", "e" ];

            const { service, world } = await makeService( { granted: 2, masterIds } );

            const onFree = await service.getCoveredMasterChannelIds( GUILD_ID );

            world.subscription = {
                priceId: "pri_plus",
                status: "active",
                currentPeriodEnd: daysFromNow( 10 )
            };

            const onPlus = await service.getCoveredMasterChannelIds( GUILD_ID );

            // Assert - the ones already covered stay covered; paying only reaches further.
            expect( onFree ).toEqual( new Set( [ "a", "b" ] ) );
            expect( onPlus ).toEqual( new Set( masterIds.slice( 0, PLUS_ALLOWANCE ) ) );
        } );
    } );

    describe( "isMasterChannelCovered()", () => {
        it( "should cover every generator on a server inside its allowance", async() => {
            // Act.
            const { service } = await makeService( { granted: 2, masterIds: [ "a", "b" ] } );

            // Assert.
            await expect( service.isMasterChannelCovered( GUILD_ID, "b" ) ).resolves.toBe( true );
        } );

        it( "should cover the oldest generator on a server that is over", async() => {
            // Act.
            const { service } = await makeService( { granted: 2, masterIds: [ "oldest", "middle", "newest" ] } );

            // Assert.
            await expect( service.isMasterChannelCovered( GUILD_ID, "oldest" ) ).resolves.toBe( true );
        } );

        it( "should refuse the newest generator on a server that is over", async() => {
            // Act - this is the refusal the join-to-create and scaling paths both act on.
            const { service } = await makeService( { granted: 2, masterIds: [ "oldest", "middle", "newest" ] } );

            // Assert.
            await expect( service.isMasterChannelCovered( GUILD_ID, "newest" ) ).resolves.toBe( false );
        } );

        it( "should refuse a generator the guild does not have", async() => {
            // Act - not a case the product reaches, but the answer should be no rather than yes.
            const { service } = await makeService( { granted: 2, masterIds: [ "a", "b", "c" ] } );

            // Assert.
            await expect( service.isMasterChannelCovered( GUILD_ID, "somebody-elses" ) ).resolves.toBe( false );
        } );

        it( "should start refusing once a subscription lapses", async() => {
            // Act - the same five generators, paid for and then not.
            const masterIds = [ "a", "b", "c", "d", "e" ];

            const { service, world } = await makeService( {
                granted: 2,
                masterIds,
                subscription: { priceId: "pri_plus", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // `d` is the fourth: inside Plus, outside the free allowance.
            const whilePaying = await service.isMasterChannelCovered( GUILD_ID, "d" );

            world.subscription = {
                priceId: "pri_plus",
                status: "canceled",
                currentPeriodEnd: daysFromNow( -1 )
            };

            // Assert - the extras go, and the ones set up first are left alone.
            expect( whilePaying ).toBe( true );
            expect( await service.isMasterChannelCovered( GUILD_ID, "d" ) ).toBe( false );
            expect( await service.isMasterChannelCovered( GUILD_ID, "a" ) ).toBe( true );
        } );
    } );
} );
