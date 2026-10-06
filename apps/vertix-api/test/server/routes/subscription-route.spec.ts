import { jest } from "@jest/globals";

import Fastify from "fastify";

import { BILLING_TRIAL_START_REFUSALS } from "@vertix.gg/definitions/src/billing-definitions";

import type { FastifyReply } from "fastify";

const GUILD_ID = "820000000000000001";

const DAY_MS = 24 * 60 * 60 * 1000;

interface IWorld {
    /** Whether the signed-in user owns the guild - what discord would answer the owner check. */
    isOwner: boolean;
    guild: { isInGuild: boolean; trialEndsAt: Date | null } | null;
    subscription: { priceId: string; status: string; currentPeriodEnd: Date | null } | null;
    /** Whether the write finds the field still unset - false is another start landing first. */
    writes: boolean;
}

const world: IWorld = { isOwner: true, guild: null, subscription: null, writes: true };

// Mocked rather than stood up: the real check asks discord who owns the guild, and what is checked
// here is what the route does once it has the answer.
jest.unstable_mockModule( "@vertix.gg/api/src/server/middleware/guild-access", () => ( {
    requireGuildOwner: async( _request: unknown, reply: FastifyReply ) => {
        if ( world.isOwner ) {
            return true;
        }

        await reply.status( 404 ).send( { error: "Not found" } );

        return false;
    }
} ) );

jest.unstable_mockModule( "@vertix.gg/api/src/server/services/paddle-api-service", () => ( {
    fetchManagementUrls: async() => ( { updatePaymentMethodUrl: null, cancelUrl: null } )
} ) );

/**
 * The subscription routes on an api of their own, over models that answer from `world`.
 */
async function serve() {
    const { GuildModel } = await import( "@vertix.gg/data/src/models/guild-model" );
    const { SubscriptionModel } = await import( "@vertix.gg/data/src/models/subscription-model" );
    const { default: subscriptionRoutePlugin } = await import( "@vertix.gg/api/src/server/routes/subscription-route" );

    const startTrial = jest.fn( async( _guildId: string, _endsAt: Date ) => world.writes );

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( GuildModel, "$", "get" ).mockReturnValue( asInstance( {
        get: async() => world.guild,
        startTrial
    } ) );

    jest.spyOn( SubscriptionModel, "$", "get" ).mockReturnValue( asInstance( {
        get: async() => world.subscription
    } ) );

    const app = Fastify();

    await app.register( subscriptionRoutePlugin );

    return { app, startTrial };
}

/**
 * A server's free trial is started by its owner, from the dashboard - once, for a server the bot is
 * in, and never on top of paying for the plan it gives.
 */
describe( "VertixAPI/Routes/Subscription/startTrial", () => {
    const configuredPrice = process.env.PADDLE_PRICE_PRO;

    beforeEach( () => {
        // The trial is of a tier this deployment sells, and one whose id is not in the environment
        // is not sold - so without this the suite would be testing a deployment with nothing to try.
        process.env.PADDLE_PRICE_PRO = "pri_pro";

        Object.assign( world, {
            isOwner: true,
            guild: { isInGuild: true, trialEndsAt: null },
            subscription: null,
            writes: true
        } );
    } );

    afterEach( () => {
        jest.restoreAllMocks();

        if ( undefined === configuredPrice ) {
            delete process.env.PADDLE_PRICE_PRO;
        } else {
            process.env.PADDLE_PRICE_PRO = configuredPrice;
        }
    } );

    async function start() {
        const { app, startTrial } = await serve();

        const before = Date.now();

        const response = await app.inject( { method: "POST", url: `/subscription/${ GUILD_ID }/trial` } );

        await app.close();

        return { response, startTrial, before };
    }

    it( "should start fourteen days of Pro for the owner of a server that never had a trial", async() => {
        // Act.
        const { response, startTrial, before } = await start();

        // Assert.
        expect( response.statusCode ).toBe( 200 );
        expect( startTrial ).toHaveBeenCalledTimes( 1 );

        const [ guildId, endsAt ] = startTrial.mock.calls[ 0 ];

        expect( guildId ).toBe( GUILD_ID );
        expect( endsAt.getTime() ).toBeGreaterThanOrEqual( before + 14 * DAY_MS );
        expect( endsAt.getTime() ).toBeLessThanOrEqual( Date.now() + 14 * DAY_MS );

        expect( response.json() ).toEqual( {
            trial: { planName: "Pro", allowance: "Unlimited", endsAt: endsAt.toISOString(), isRunning: true }
        } );
    } );

    it( "should refuse a server that had its trial", async() => {
        // Arrange - ran out a month ago; once is still once.
        world.guild = { isInGuild: true, trialEndsAt: new Date( Date.now() - 30 * DAY_MS ) };

        // Act.
        const { response, startTrial } = await start();

        // Assert.
        expect( response.statusCode ).toBe( 409 );
        expect( response.json() ).toEqual( { error: BILLING_TRIAL_START_REFUSALS.ALREADY_USED } );
        expect( startTrial ).not.toHaveBeenCalled();
    } );

    it( "should refuse a server already paying for Pro", async() => {
        // Arrange.
        world.subscription = { priceId: "pri_pro", status: "active", currentPeriodEnd: new Date( Date.now() + 10 * DAY_MS ) };

        // Act.
        const { response, startTrial } = await start();

        // Assert.
        expect( response.statusCode ).toBe( 409 );
        expect( response.json() ).toEqual( { error: BILLING_TRIAL_START_REFUSALS.ALREADY_PAYING } );
        expect( startTrial ).not.toHaveBeenCalled();
    } );

    it( "should let a server whose subscription lapsed start one", async() => {
        // Arrange - a lapsed row buys nothing, so there is a plan to try.
        world.subscription = { priceId: "pri_pro", status: "canceled", currentPeriodEnd: new Date( Date.now() - DAY_MS ) };

        // Act.
        const { response, startTrial } = await start();

        // Assert.
        expect( response.statusCode ).toBe( 200 );
        expect( startTrial ).toHaveBeenCalledTimes( 1 );
    } );

    it( "should refuse a server the bot is not in, or never was", async() => {
        // Arrange.
        world.guild = { isInGuild: false, trialEndsAt: null };

        // Act.
        const left = await start();

        world.guild = null;

        const never = await start();

        // Assert.
        expect( left.response.json() ).toEqual( { error: BILLING_TRIAL_START_REFUSALS.BOT_NOT_IN_SERVER } );
        expect( never.response.json() ).toEqual( { error: BILLING_TRIAL_START_REFUSALS.BOT_NOT_IN_SERVER } );
        expect( left.startTrial ).not.toHaveBeenCalled();
        expect( never.startTrial ).not.toHaveBeenCalled();
    } );

    it( "should say the trial was had when another start wrote it first", async() => {
        // Arrange - two presses at once; the write is what keeps it to one.
        world.writes = false;

        // Act.
        const { response } = await start();

        // Assert.
        expect( response.statusCode ).toBe( 409 );
        expect( response.json() ).toEqual( { error: BILLING_TRIAL_START_REFUSALS.ALREADY_USED } );
    } );

    it( "should refuse where no plan on sale offers a trial", async() => {
        // Arrange.
        delete process.env.PADDLE_PRICE_PRO;

        // Act.
        const { response, startTrial } = await start();

        // Assert.
        expect( response.json() ).toEqual( { error: BILLING_TRIAL_START_REFUSALS.NOT_OFFERED } );
        expect( startTrial ).not.toHaveBeenCalled();
    } );

    it( "should start nothing for somebody who does not own the server", async() => {
        // Arrange.
        world.isOwner = false;

        // Act.
        const { response, startTrial } = await start();

        // Assert.
        expect( response.statusCode ).toBe( 404 );
        expect( startTrial ).not.toHaveBeenCalled();
    } );
} );
