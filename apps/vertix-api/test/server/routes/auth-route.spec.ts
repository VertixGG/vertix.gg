import { jest } from "@jest/globals";

import Fastify from "fastify";

const DASHBOARD_URL = "https://dashboard.example";

const STATE = "state-1";

// Read when the route is imported, so set before it is.
process.env.DASHBOARD_URL = DASHBOARD_URL;

// Mocked rather than stood up: the real ones talk to discord and the database, and what is checked
// here is only where somebody is sent once they have signed in.
jest.unstable_mockModule( "@vertix.gg/api/src/server/services/auth-service", () => ( {
    generateState: () => STATE,
    exchangeCodeForToken: async() => ( { access_token: "token" } ),
    getDiscordUser: async() => ( { id: "840000000000000001" } ),
    upsertUser: async() => ( { id: "user-1" } ),
    upsertToken: async() => undefined,
    getDiscordGuilds: async() => [],
    getUserById: async() => null,
    refreshAccessToken: async() => null,
    deleteUserToken: async() => undefined
} ) );

jest.unstable_mockModule( "@vertix.gg/api/src/server/config/discord", () => ( {
    discordConfig: { getAuthorizationUrl: ( state: string ) => `https://discord.example/authorize?state=${ state }` }
} ) );

jest.unstable_mockModule( "@vertix.gg/api/src/server/services/dashboard-service", () => ( {
    selectGuildIdsWithBot: async() => []
} ) );

jest.unstable_mockModule( "@vertix.gg/api/src/server/middleware/guild-access", () => ( {
    cacheOwnedGuilds: () => undefined,
    resolveGuildOwnership: async() => ( { outcome: "not-owned" } )
} ) );

interface ISession {
    oauthState?: string;
    oauthReturnTo?: string;
    userId?: string;
    save: () => Promise<void>;
}

/**
 * The auth routes on an api of their own, every request carrying `session`.
 */
async function serve( session: ISession ) {
    const { default: authRoutePlugin } = await import( "@vertix.gg/api/src/server/routes/auth-route" );

    const app = Fastify();

    app.decorateRequest( "session", null as never );

    app.addHook( "onRequest", async( request ) => {
        request.session = session as never;
    } );

    await app.register( authRoutePlugin );

    return app;
}

const makeSession = ( fields: Partial<ISession> = {} ): ISession => ( { save: async() => undefined, ... fields } );

/**
 * Somebody sent to sign in from a page of the dashboard comes back to that page, not its front -
 * and a sign-in link can never send them anywhere but the dashboard.
 */
describe( "VertixAPI/Routes/Auth/returnTo", () => {
    it( "should keep the page a sign-in was started from", async() => {
        // Arrange.
        const session = makeSession(),
            app = await serve( session );

        // Act.
        const response = await app.inject( {
            method: "GET",
            url: `/auth/discord?returnTo=${ encodeURIComponent( "/billing?plan=pro" ) }`
        } );

        await app.close();

        // Assert.
        expect( response.statusCode ).toBe( 302 );
        expect( session.oauthReturnTo ).toBe( "/billing?plan=pro" );
    } );

    it( "should keep nothing a link typed to point elsewhere", async() => {
        // Arrange - and one left from an earlier sign-in is not inherited either.
        const session = makeSession( { oauthReturnTo: "/events" } ),
            app = await serve( session );

        // Act.
        await app.inject( {
            method: "GET",
            url: `/auth/discord?returnTo=${ encodeURIComponent( "https://evil.example" ) }`
        } );

        await app.close();

        // Assert.
        expect( session.oauthReturnTo ).toBeUndefined();
    } );

    it( "should send somebody back to that page once discord answers, and forget it", async() => {
        // Arrange.
        const session = makeSession( { oauthState: STATE, oauthReturnTo: "/billing?plan=pro" } ),
            app = await serve( session );

        // Act.
        const response = await app.inject( {
            method: "GET",
            url: `/auth/discord/callback?code=abc&state=${ STATE }`
        } );

        await app.close();

        // Assert.
        expect( response.statusCode ).toBe( 302 );
        expect( response.headers.location ).toBe( `${ DASHBOARD_URL }/billing?plan=pro` );
        expect( session.oauthReturnTo ).toBeUndefined();
    } );

    it( "should send somebody with no page to come back to the dashboard's front", async() => {
        // Arrange.
        const session = makeSession( { oauthState: STATE } ),
            app = await serve( session );

        // Act.
        const response = await app.inject( {
            method: "GET",
            url: `/auth/discord/callback?code=abc&state=${ STATE }`
        } );

        await app.close();

        // Assert.
        expect( response.headers.location ).toBe( DASHBOARD_URL );
    } );
} );
