import { jest } from "@jest/globals";

import { isUnlimitedAllowance } from "@vertix.gg/definitions/src/billing-definitions";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const GUILD_ID = "820000000000000001";

/**
 * The prices this deployment knows, set before the service is imported.
 *
 * The tiers are read out of the environment, and one whose id is not there is dropped rather than
 * carried with an empty id - so a suite that did not set these would be testing a deployment that
 * can sell nothing, and every subscription in it would be worth the free allowance.
 */
process.env.PADDLE_PRICE_PRO = "pri_pro";

/**
 * The keys of the two retired tiers, as an env file written before they were retired still sets
 * them. Set here so the suite answers for that environment rather than a tidier one - the bot must
 * sell nothing on them however long they linger.
 */
process.env.PADDLE_PRICE_PLUS = "pri_retired_plus";
process.env.PADDLE_PRICE_ULTIMATE = "pri_retired_ultimate";

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
    /** When the guild's free trial runs out, or null for one that never had a trial. */
    trialEndsAt: Date | null;
    /** The guild's generators, in the order the database returns them - oldest first. */
    masterIds: string[];
}

/**
 * Stands up the service with the four things it reads and nothing else.
 *
 * Built off the prototype rather than constructed, so none of the base class's wiring has to exist;
 * the collaborators are static singletons, which is why they are intercepted at `getInstance`
 * rather than assigned onto the instance like an ordinary dependency.
 */
async function makeService( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = { granted: 2, subscription: null, trialEndsAt: null, masterIds: [], ... world };

    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { GuildModel } = await import( "@vertix.gg/data/src/models/guild-model" );
    const { SubscriptionModel } = await import( "@vertix.gg/data/src/models/subscription-model" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { EntitlementService } = await import( "@vertix.gg/bot/src/services/entitlement-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    // Spied as getters rather than on an instance method: `$` is a lazy accessor that builds the
    // singleton on first touch, and they do not agree on what is behind it.
    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getAllSettings: async() => ( { maxMasterChannels: settled.granted } )
    } ) );

    jest.spyOn( GuildModel, "$", "get" ).mockReturnValue( asInstance( {
        get: async() => ( { trialEndsAt: settled.trialEndsAt } )
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

        it( "should lift the ceiling for a server paying for Pro", async() => {
            // Act.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_pro", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            expect( isUnlimitedAllowance( await service.getMaxMasterChannels( GUILD_ID ) ) ).toBe( true );
        } );

        it( "should be worth nothing for a retired price, with its key still in the environment", async() => {
            // Act - a row naming Plus, which is no longer sold. It is a price this build does not
            // know, not a tier, so it buys nothing.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_retired_plus", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            await expect( service.getMaxMasterChannels( GUILD_ID ) ).resolves.toBe( 2 );
        } );

        it( "should keep a grant for a server on a retired price", async() => {
            // Act - a grant is given for a reason, and nothing about a subscription can take it away.
            const { service } = await makeService( {
                granted: 20,
                subscription: { priceId: "pri_retired_ultimate", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
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
            expect( isUnlimitedAllowance( await service.getMaxMasterChannels( GUILD_ID ) ) ).toBe( true );
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

        it( "should lift the ceiling while a server's free trial runs", async() => {
            // Act - nothing paid for, and Pro all the same until the date.
            const { service } = await makeService( { granted: 2, trialEndsAt: daysFromNow( 3 ) } );

            // Assert.
            expect( isUnlimitedAllowance( await service.getMaxMasterChannels( GUILD_ID ) ) ).toBe( true );
        } );

        it( "should give back the free allowance once the trial has run out", async() => {
            // Act.
            const { service } = await makeService( { granted: 2, trialEndsAt: daysFromNow( -1 ) } );

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

        it( "should cover everything on Pro, which has no ceiling", async() => {
            // Act.
            const { service } = await makeService( {
                granted: 2,
                subscription: { priceId: "pri_pro", status: "active", currentPeriodEnd: daysFromNow( 10 ) },
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
                priceId: "pri_pro",
                status: "active",
                currentPeriodEnd: daysFromNow( 10 )
            };

            const onPro = await service.getCoveredMasterChannelIds( GUILD_ID );

            // Assert - the ones already covered stay covered, and paying reaches every one of the
            // rest: null is "all of them".
            expect( onFree ).toEqual( new Set( [ "a", "b" ] ) );
            expect( onPro ).toBeNull();
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
                subscription: { priceId: "pri_pro", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // `d` is the fourth: covered on Pro, outside the free allowance.
            const whilePaying = await service.isMasterChannelCovered( GUILD_ID, "d" );

            world.subscription = {
                priceId: "pri_pro",
                status: "canceled",
                currentPeriodEnd: daysFromNow( -1 )
            };

            // Assert - the extras go, and the ones set up first are left alone.
            expect( whilePaying ).toBe( true );
            expect( await service.isMasterChannelCovered( GUILD_ID, "d" ) ).toBe( false );
            expect( await service.isMasterChannelCovered( GUILD_ID, "a" ) ).toBe( true );
        } );

        it( "should start refusing the extras once a trial runs out, as a lapsed plan does", async() => {
            // Act - the same five generators, set up during a trial and then past it.
            const { service, world } = await makeService( {
                granted: 2,
                masterIds: [ "a", "b", "c", "d", "e" ],
                trialEndsAt: daysFromNow( 3 )
            } );

            const duringTrial = await service.isMasterChannelCovered( GUILD_ID, "d" );

            world.trialEndsAt = daysFromNow( -1 );

            // Assert.
            expect( duringTrial ).toBe( true );
            expect( await service.isMasterChannelCovered( GUILD_ID, "d" ) ).toBe( false );
            expect( await service.isMasterChannelCovered( GUILD_ID, "a" ) ).toBe( true );
        } );
    } );

    describe( "canBrand()", () => {
        it( "should let a server paying for Pro give the bot its own profile", async() => {
            // Act.
            const { service } = await makeService( {
                subscription: { priceId: "pri_pro", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            await expect( service.canBrand( GUILD_ID ) ).resolves.toBe( true );
        } );

        it( "should not let a server that was only granted generators brand the bot", async() => {
            // Act - a grant bigger than anything, and nothing paid for.
            const { service } = await makeService( { granted: 50 } );

            // Assert.
            await expect( service.canBrand( GUILD_ID ) ).resolves.toBe( false );
        } );

        it( "should stop once the month a cancelled subscription paid for is up", async() => {
            // Act.
            const { service, world } = await makeService( {
                subscription: { priceId: "pri_pro", status: "canceled", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            const whilePaidUp = await service.canBrand( GUILD_ID );

            world.subscription = { priceId: "pri_pro", status: "canceled", currentPeriodEnd: daysFromNow( -1 ) };

            // Assert.
            expect( whilePaidUp ).toBe( true );
            await expect( service.canBrand( GUILD_ID ) ).resolves.toBe( false );
        } );

        it( "should not be bought by a retired price", async() => {
            // Act.
            const { service } = await makeService( {
                subscription: { priceId: "pri_retired_ultimate", status: "active", currentPeriodEnd: daysFromNow( 10 ) }
            } );

            // Assert.
            await expect( service.canBrand( GUILD_ID ) ).resolves.toBe( false );
        } );

        it( "should let a server on its free trial brand the bot, until the trial runs out", async() => {
            // Act - unlike a grant, a trial is the plan itself for a while, profile included.
            const { service, world } = await makeService( { trialEndsAt: daysFromNow( 3 ) } );

            const duringTrial = await service.canBrand( GUILD_ID );

            world.trialEndsAt = daysFromNow( -1 );

            // Assert.
            expect( duringTrial ).toBe( true );
            await expect( service.canBrand( GUILD_ID ) ).resolves.toBe( false );
        } );
    } );

    describe( "shouldWarnOfTrialEnd()", () => {
        it( "should warn a server in its trial's last days", async() => {
            // Act.
            const { service } = await makeService( { trialEndsAt: daysFromNow( 1 ) } );

            // Assert.
            await expect( service.shouldWarnOfTrialEnd( GUILD_ID ) ).resolves.toBe( true );
        } );

        it( "should not warn a server with most of its trial still to go", async() => {
            // Act.
            const { service } = await makeService( { trialEndsAt: daysFromNow( 10 ) } );

            // Assert.
            await expect( service.shouldWarnOfTrialEnd( GUILD_ID ) ).resolves.toBe( false );
        } );

        it( "should not warn a server that started paying for Pro during its trial", async() => {
            // Act - it loses nothing when the date passes.
            const { service } = await makeService( {
                trialEndsAt: daysFromNow( 1 ),
                subscription: { priceId: "pri_pro", status: "active", currentPeriodEnd: daysFromNow( 30 ) }
            } );

            // Assert.
            await expect( service.shouldWarnOfTrialEnd( GUILD_ID ) ).resolves.toBe( false );
        } );

        it( "should still warn a server whose subscription has lapsed", async() => {
            // Act - a lapsed row buys nothing, so the trial is all that holds Pro.
            const { service } = await makeService( {
                trialEndsAt: daysFromNow( 1 ),
                subscription: { priceId: "pri_pro", status: "canceled", currentPeriodEnd: daysFromNow( -3 ) }
            } );

            // Assert.
            await expect( service.shouldWarnOfTrialEnd( GUILD_ID ) ).resolves.toBe( true );
        } );
    } );

    describe( "getMaxMasterChannelsAfterTrial()", () => {
        it( "should give what the server keeps with the trial taken out", async() => {
            // Act - unlimited while the trial runs, the grant once it is over.
            const { service } = await makeService( { granted: 2, trialEndsAt: daysFromNow( 1 ) } );

            const duringTrial = await service.getMaxMasterChannels( GUILD_ID );

            // Assert.
            expect( isUnlimitedAllowance( duringTrial ) ).toBe( true );
            await expect( service.getMaxMasterChannelsAfterTrial( GUILD_ID ) ).resolves.toBe( 2 );
        } );

        it( "should keep a grant higher than the free allowance", async() => {
            // Act.
            const { service } = await makeService( { granted: 5, trialEndsAt: daysFromNow( 1 ) } );

            // Assert.
            await expect( service.getMaxMasterChannelsAfterTrial( GUILD_ID ) ).resolves.toBe( 5 );
        } );
    } );
} );
