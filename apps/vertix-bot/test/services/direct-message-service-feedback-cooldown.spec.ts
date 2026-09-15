import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const USER_ID = "830000000000000001",
    OTHER_USER_ID = "830000000000000002";

// Set before the service is pulled in, because the window is read once as the module loads. Chosen
// here rather than inherited from the default so the test says how long it is waiting and why.
const COOLDOWN = 60 * 60 * 1000;

process.env.DIRECT_MESSAGE_FEEDBACK_COOLDOWN = String( COOLDOWN );

/**
 * Neither of these reads anything off the service but the map, so they are called against the
 * prototype with a map handed to them - rather than standing up a service and everything the
 * locator would want along with it.
 */
type Cooldown = {
    wasFeedbackSentRecently( userId: string ): boolean;
    rememberFeedbackSent( userId: string ): void;
};

async function makeCooldown() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DirectMessageService } = await import( "@vertix.gg/bot/src/services/direct-message-service" );

    const state = { feedbackSentAt: new Map<string, number>() },
        proto = DirectMessageService.prototype as unknown as Cooldown;

    return {
        state,
        wasSentRecently: ( userId: string ) => proto.wasFeedbackSentRecently.call( state, userId ),
        remember: ( userId: string ) => proto.rememberFeedbackSent.call( state, userId )
    };
}

/**
 * The feedback screen is the bot's answer to a direct message, and it should not be the answer to
 * every line somebody types in a row. It used to be held back by a set of ids that nothing ever
 * took anything out of: one answer each, for as long as the process happened to live, and a list
 * that grew by one for every person who ever wrote in.
 */
describe( "VertixBot/Services/DirectMessage/feedback cooldown", () => {
    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( new Date( "2026-01-01T00:00:00.000Z" ) );
    } );

    afterEach( () => {
        jest.useRealTimers();
    } );

    it( "should answer somebody who has not been answered", async() => {
        const { wasSentRecently } = await makeCooldown();

        expect( wasSentRecently( USER_ID ) ).toBe( false );
    } );

    it( "should hold back a second answer inside the window", async() => {
        const { remember, wasSentRecently } = await makeCooldown();

        remember( USER_ID );

        jest.advanceTimersByTime( COOLDOWN - 1 );

        expect( wasSentRecently( USER_ID ) ).toBe( true );
    } );

    it( "should answer again once the window is up", async() => {
        const { remember, wasSentRecently } = await makeCooldown();

        remember( USER_ID );

        jest.advanceTimersByTime( COOLDOWN );

        expect( wasSentRecently( USER_ID ) ).toBe( false );
    } );

    it( "should hold each person back on their own clock", async() => {
        const { remember, wasSentRecently } = await makeCooldown();

        remember( USER_ID );

        expect( wasSentRecently( OTHER_USER_ID ) ).toBe( false );
        expect( wasSentRecently( USER_ID ) ).toBe( true );
    } );

    it( "should let go of somebody whose window is up rather than keep them", async() => {
        const { state, remember, wasSentRecently } = await makeCooldown();

        remember( USER_ID );

        jest.advanceTimersByTime( COOLDOWN );

        wasSentRecently( USER_ID );

        expect( state.feedbackSentAt.has( USER_ID ) ).toBe( false );
    } );

    /**
     * The leak. Somebody who writes in once and never comes back is never asked about again, so
     * nothing would ever drop them - the sweep on the way in is what does.
     */
    it( "should drop everyone whose window is up when the next person writes in", async() => {
        const { state, remember } = await makeCooldown();

        remember( USER_ID );

        jest.advanceTimersByTime( COOLDOWN );

        remember( OTHER_USER_ID );

        expect( state.feedbackSentAt.has( USER_ID ) ).toBe( false );
        expect( state.feedbackSentAt.has( OTHER_USER_ID ) ).toBe( true );
    } );

    it( "should keep somebody still inside their window when another writes in", async() => {
        const { state, remember } = await makeCooldown();

        remember( USER_ID );

        jest.advanceTimersByTime( COOLDOWN - 1 );

        remember( OTHER_USER_ID );

        expect( state.feedbackSentAt.has( USER_ID ) ).toBe( true );
    } );
} );
