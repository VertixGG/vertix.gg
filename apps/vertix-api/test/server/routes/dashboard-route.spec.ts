import { jest } from "@jest/globals";

import Fastify from "fastify";

const OWNER_ID = "840000000000000001",
    SOMEBODY_ELSE = "840000000000000002";

/** Every route of the owner's statistics page. */
const OWNER_STATISTICS_ROUTES = [
    "/dashboard/stats/growth",
    "/dashboard/stats/activation",
    "/dashboard/stats/usage",
    "/dashboard/stats/revenue",
    "/dashboard/stats/adoption"
];

// Mocked rather than stood up: the real ones read the database, and what is checked here is only who
// gets to ask them.
jest.unstable_mockModule( "@vertix.gg/api/src/server/services/statistics-service", () => ( {
    getGrowthStats: async() => ( {} ),
    getActivationStats: async() => ( {} ),
    getUsageStats: async() => ( {} ),
    getRevenueStats: async() => ( {} ),
    getAdoptionStats: async() => ( {} )
} ) );

/** A request as far as the check reads one - the session and the user on it. */
function requestFrom( userId: string | undefined ) {
    return { session: { userId } } as never;
}

/**
 * The dashboard's routes on an api of their own, with every request signed in as `userId`.
 */
async function serveAs( userId: string ) {
    const { default: dashboardRoutePlugin } = await import( "@vertix.gg/api/src/server/routes/dashboard-route" );

    const app = Fastify();

    app.decorateRequest( "session", null as never );

    app.addHook( "onRequest", async( request ) => {
        request.session = { userId } as never;
    } );

    await app.register( dashboardRoutePlugin );

    return app;
}

/**
 * What keeps the owner's statistics - installs by the link they came through, what the servers pay -
 * to the owner.
 */
describe( "VertixAPI/Routes/Dashboard/isOwnerRequest", () => {
    const configured = process.env.OWNERD_ID;

    afterEach( () => {
        if ( undefined === configured ) {
            delete process.env.OWNERD_ID;
        } else {
            process.env.OWNERD_ID = configured;
        }
    } );

    it( "should know the owner, and nobody else", async() => {
        process.env.OWNERD_ID = OWNER_ID;

        const { isOwnerRequest } = await import( "@vertix.gg/api/src/server/routes/dashboard-route" );

        expect( isOwnerRequest( requestFrom( OWNER_ID ) ) ).toBe( true );
        expect( isOwnerRequest( requestFrom( SOMEBODY_ELSE ) ) ).toBe( false );
    } );

    it( "should know nobody while no owner is configured - not even a session without a user", async() => {
        delete process.env.OWNERD_ID;

        const { isOwnerRequest } = await import( "@vertix.gg/api/src/server/routes/dashboard-route" );

        expect( isOwnerRequest( requestFrom( undefined ) ) ).toBe( false );
        expect( isOwnerRequest( requestFrom( OWNER_ID ) ) ).toBe( false );
    } );
} );

/**
 * Every route of the statistics page sits behind the owner check - a route added beside the others
 * rather than inside their scope would answer anybody signed in.
 */
describe( "VertixAPI/Routes/Dashboard/statistics", () => {
    const configured = process.env.OWNERD_ID;

    beforeEach( () => {
        process.env.OWNERD_ID = OWNER_ID;
    } );

    afterEach( () => {
        if ( undefined === configured ) {
            delete process.env.OWNERD_ID;
        } else {
            process.env.OWNERD_ID = configured;
        }
    } );

    it.each( OWNER_STATISTICS_ROUTES )( "should refuse %s to anybody but the owner", async( url ) => {
        const app = await serveAs( SOMEBODY_ELSE );

        const response = await app.inject( { method: "GET", url } );

        await app.close();

        expect( response.statusCode ).toBe( 403 );
    } );

    it.each( OWNER_STATISTICS_ROUTES )( "should answer %s to the owner", async( url ) => {
        const app = await serveAs( OWNER_ID );

        const response = await app.inject( { method: "GET", url } );

        await app.close();

        expect( response.statusCode ).toBe( 200 );
    } );
} );
