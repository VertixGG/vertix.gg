import { jest } from "@jest/globals";

import { fetchManagementUrls } from "@vertix.gg/api/src/server/services/paddle-api-service";

const SUBSCRIPTION_ID = "sub_01test";

type TFetch = typeof globalThis.fetch;

/** A paddle answer, as much of it as the lookup reads. */
const answering = ( body: object, ok = true, status = 200 ) =>
    jest.spyOn( globalThis, "fetch" ).mockImplementation( ( async() => ( {
        ok,
        status,
        json: async() => body
    } ) ) as unknown as TFetch );

/** Where the one call went, so a test can say which paddle was asked. */
const calledUrl = ( spy: ReturnType<typeof answering> ) => String( spy.mock.calls[ 0 ]?.[ 0 ] );

/**
 * Paddle's hosted pages for one subscription.
 *
 * Worth covering because both of its answers are quiet ones: with no key it returns nulls rather
 * than failing, and the screen simply stops offering the buttons - which is indistinguishable, from
 * the outside, from a subscription that has no links.
 */
describe( "VertixAPI/Services/PaddleAPI", () => {
    beforeEach( () => {
        process.env.PADDLE_API_KEY = "pdl_test_key";
        process.env.PADDLE_ENVIRONMENT = "sandbox";
    } );

    afterEach( () => {
        jest.restoreAllMocks();

        delete process.env.PADDLE_API_KEY;
        delete process.env.PADDLE_ENVIRONMENT;
    } );

    it( "should read both links off paddle's answer", async() => {
        // Act.
        answering( {
            data: {
                management_urls: {
                    update_payment_method: "https://paddle.test/cpl_1/update",
                    cancel: "https://paddle.test/cpl_1/cancel"
                }
            }
        } );

        // Assert.
        await expect( fetchManagementUrls( SUBSCRIPTION_ID ) ).resolves.toEqual( {
            updatePaymentMethodUrl: "https://paddle.test/cpl_1/update",
            cancelUrl: "https://paddle.test/cpl_1/cancel"
        } );
    } );

    it( "should answer nulls when paddle sends no management urls", async() => {
        // Act - a key without customer portal session (write) gets the subscription and no links.
        answering( { data: { id: SUBSCRIPTION_ID } } );

        // Assert.
        await expect( fetchManagementUrls( SUBSCRIPTION_ID ) ).resolves.toEqual( {
            updatePaymentMethodUrl: null,
            cancelUrl: null
        } );
    } );

    it( "should not ask paddle at all when no key is configured", async() => {
        // Act - the deployment cannot ask, and says so by answering nothing rather than failing.
        delete process.env.PADDLE_API_KEY;

        const spy = answering( {} );

        const urls = await fetchManagementUrls( SUBSCRIPTION_ID );

        // Assert.
        expect( urls ).toEqual( { updatePaymentMethodUrl: null, cancelUrl: null } );
        expect( spy ).not.toHaveBeenCalled();
    } );

    it( "should treat a blank key as no key", async() => {
        // Act.
        process.env.PADDLE_API_KEY = "   ";

        const spy = answering( {} );

        // Assert.
        await expect( fetchManagementUrls( SUBSCRIPTION_ID ) ).resolves.toEqual( {
            updatePaymentMethodUrl: null,
            cancelUrl: null
        } );
        expect( spy ).not.toHaveBeenCalled();
    } );

    it( "should throw with the status when paddle refuses", async() => {
        // Act - the status is the difference between a rate limit and a key that has been revoked,
        // and the caller logs this rather than failing the whole answer.
        answering( {}, false, 403 );

        // Assert.
        await expect( fetchManagementUrls( SUBSCRIPTION_ID ) ).rejects.toThrow( "403" );
    } );

    it( "should ask the sandbox api unless told otherwise", async() => {
        // Act.
        const spy = answering( { data: {} } );

        await fetchManagementUrls( SUBSCRIPTION_ID );

        // Assert.
        expect( calledUrl( spy ) ).toContain( "sandbox-api.paddle.com" );
    } );

    it( "should ask the live api only for production", async() => {
        // Act.
        process.env.PADDLE_ENVIRONMENT = "production";

        const spy = answering( { data: {} } );

        await fetchManagementUrls( SUBSCRIPTION_ID );

        // Assert - and not the sandbox one, which is the half that would take real money quietly.
        expect( calledUrl( spy ) ).toContain( "//api.paddle.com" );
        expect( calledUrl( spy ) ).not.toContain( "sandbox" );
    } );

    it( "should ask about the subscription it was given", async() => {
        // Act.
        const spy = answering( { data: {} } );

        await fetchManagementUrls( SUBSCRIPTION_ID );

        // Assert.
        expect( calledUrl( spy ) ).toContain( `/subscriptions/${ SUBSCRIPTION_ID }` );
    } );
} );
