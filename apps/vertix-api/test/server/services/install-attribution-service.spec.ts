import { jest } from "@jest/globals";

import type { TInstallSource } from "@vertix.gg/definitions/src/discord-invite-definitions";

import type {
    IInstallCallbackDependencies
} from "@vertix.gg/api/src/server/services/install-attribution-service";

import type { TokenResponse } from "@vertix.gg/api/src/server/services/auth-service";

const CALLBACK_URL = "https://api.voicechannels.online/api/install/callback",
    WEBSITE_URL = "https://voicechannels.online";

const GUILD_ID = "830000000000000001",
    SOMEBODY_ELSES_GUILD_ID = "830000000000000009";

function makeToken( guildId: string | null ): TokenResponse {
    return {
        access_token: "access",
        token_type: "Bearer",
        expires_in: 604800,
        refresh_token: "refresh",
        scope: "bot applications.commands",
        ... ( guildId ? { guild: { id: guildId } } : {} )
    };
}

function makeDependencies( overrides: Partial<IInstallCallbackDependencies> = {} ) {
    const recorded: { guildId: string; source: TInstallSource; permissions: string | null }[] = [];

    const exchange = jest.fn( async( _code: string, _redirectUri: string ) => makeToken( GUILD_ID ) );

    const dependencies: IInstallCallbackDependencies = {
        callbackUrl: CALLBACK_URL,
        websiteUrl: WEBSITE_URL,
        exchange,
        record: async( guildId, source, permissions ) => {
            recorded.push( { guildId, source, permissions } );
        },
        ... overrides
    };

    return { dependencies, recorded, exchange };
}

/**
 * Where somebody lands after adding the bot through a counted link, and what gets written down.
 *
 * Worth pinning because the callback is public: anything in its query string is whatever somebody
 * typed, and only an install discord confirmed may be counted.
 */
describe( "VertixAPI/Services/InstallAttribution", () => {
    it( "should count an install against the server the code was issued for, and send them to the welcome page", async() => {
        // Arrange.
        const { handleInstallCallback } = await import( "@vertix.gg/api/src/server/services/install-attribution-service" );
        const { dependencies, recorded, exchange } = makeDependencies();

        // Act.
        const result = await handleInstallCallback( { code: "code", state: "site-home", permissions: "286354576" }, dependencies );

        // Assert.
        expect( exchange ).toHaveBeenCalledWith( "code", CALLBACK_URL );
        expect( recorded ).toEqual( [ { guildId: GUILD_ID, source: "site-home", permissions: "286354576" } ] );
        expect( result ).toEqual( { redirectTo: `${ WEBSITE_URL }/welcome?src=site-home`, recorded: true } );
    } );

    it( "should take the server from the exchange, never from the query string", async() => {
        // Arrange - a query naming somebody else's server, which discord never sends and anyone can type.
        const { handleInstallCallback } = await import( "@vertix.gg/api/src/server/services/install-attribution-service" );
        const { dependencies, recorded } = makeDependencies();

        const query = { code: "code", state: "site-home", guild_id: SOMEBODY_ELSES_GUILD_ID };

        // Act.
        await handleInstallCallback( query, dependencies );

        // Assert.
        expect( recorded[ 0 ].guildId ).toBe( GUILD_ID );
    } );

    it( "should count nothing when the code cannot be exchanged, and still send them on", async() => {
        // Arrange.
        const { handleInstallCallback } = await import( "@vertix.gg/api/src/server/services/install-attribution-service" );
        const { dependencies, recorded } = makeDependencies( {
            exchange: async() => {
                throw new Error( "invalid_grant" );
            }
        } );

        // Act.
        const result = await handleInstallCallback( { code: "used-already", state: "site-home" }, dependencies );

        // Assert.
        expect( recorded ).toHaveLength( 0 );
        expect( result.redirectTo ).toBe( `${ WEBSITE_URL }/welcome?src=site-home` );
    } );

    it( "should count nothing for a source that is not one of ours", async() => {
        // Arrange.
        const { handleInstallCallback } = await import( "@vertix.gg/api/src/server/services/install-attribution-service" );
        const { dependencies, recorded, exchange } = makeDependencies();

        // Act.
        const result = await handleInstallCallback( { code: "code", state: "<script>" }, dependencies );

        // Assert.
        expect( exchange ).not.toHaveBeenCalled();
        expect( recorded ).toHaveLength( 0 );
        expect( result.redirectTo ).toBe( `${ WEBSITE_URL }/welcome` );
    } );

    it( "should count nothing while it is switched off", async() => {
        // Arrange.
        const { handleInstallCallback } = await import( "@vertix.gg/api/src/server/services/install-attribution-service" );
        const { dependencies, recorded, exchange } = makeDependencies( { callbackUrl: null } );

        // Act.
        await handleInstallCallback( { code: "code", state: "site-home" }, dependencies );

        // Assert.
        expect( exchange ).not.toHaveBeenCalled();
        expect( recorded ).toHaveLength( 0 );
    } );

    it( "should send somebody who cancelled back to the invite page", async() => {
        // Arrange.
        const { handleInstallCallback } = await import( "@vertix.gg/api/src/server/services/install-attribution-service" );
        const { dependencies, recorded } = makeDependencies();

        // Act.
        const result = await handleInstallCallback( { error: "access_denied", state: "site-home" }, dependencies );

        // Assert.
        expect( recorded ).toHaveLength( 0 );
        expect( result.redirectTo ).toBe( `${ WEBSITE_URL }/invite-vertix` );
    } );

    it( "should keep the permissions only when they are a number", async() => {
        // Arrange.
        const { handleInstallCallback } = await import( "@vertix.gg/api/src/server/services/install-attribution-service" );
        const { dependencies, recorded } = makeDependencies();

        // Act.
        await handleInstallCallback( { code: "code", state: "site-pricing", permissions: "8; DROP" }, dependencies );

        // Assert.
        expect( recorded[ 0 ].permissions ).toBeNull();
    } );
} );
