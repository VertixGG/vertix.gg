import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { UI_IMAGE_BLUE_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const STARTS_AT = 1791057600;

/** Ten minutes after the start - where a server that set nothing stops counting anybody on time. */
const LATE_AT = STARTS_AT + 600;

async function draw( args: UIArgs ) {
    const { EventBoardEmbed } = await import( "@vertix.gg/bot/src/ui/general/events/board/event-board-embed" );

    const { attributes } = await instantiateEmbed( EventBoardEmbed ).build( {
        eventName: "Raid Night",
        startsAt: STARTS_AT,
        lateAt: LATE_AT,
        voiceChannelId: "123",
        ... args
    } );

    return { title: String( attributes.title ), description: String( attributes.description ), image: attributes.image };
}

/**
 * The one message a run keeps from check-in to attendance.
 *
 * Its wording is chosen by state and its lists are dropped when empty, all through nested template
 * options - pinned here because a variable that fails to resolve does not throw, it shows up in
 * somebody's server as `{waitingBlock}`.
 */
describe( "VertixBot/UI-General/EventBoardEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should list who is here and who is not yet while check-in is open", async() => {
        // Act.
        const { title, description } = await draw( {
            boardState: "check-in",
            checkedIn: [ "<@1>" ],
            checkedInCount: 1,
            waiting: [ "<@2>", "<@3>" ],
            waitingCount: 2
        } );

        // Assert.
        expect( title ).toBe( "📅  Raid Night · Check-in" );
        expect( description ).toBe(
            `Starts <t:${ STARTS_AT }:F> (<t:${ STARTS_AT }:R>) in <#123>.\n` +
            `Said you're coming? Join the voice channel to check in - by <t:${ LATE_AT }:t> to count as on time.` +
            "\n\n**✅ Here (1)**\n<@1>" +
            "\n\n**⏳ Not here yet (2)**\n<@2>\n<@3>"
        );
    } );

    it( "should leave out a list with nobody on it", async() => {
        // Act.
        const { description } = await draw( {
            boardState: "running",
            onTime: [ "<@1>" ],
            onTimeCount: 1,
            late: [],
            lateCount: 0,
            noShow: [ "<@2>" ],
            noShowCount: 1
        } );

        // Assert.
        expect( description ).toContain( "**✅ Came (1)**\n<@1>" );
        expect( description ).toContain( "**❌ Didn't come (1)**\n<@2>" );
        expect( description ).not.toContain( "Late" );
        expect( description ).not.toContain( "Walked in" );
    } );

    it( "should count the members a list has no room to show", async() => {
        // Act.
        const { description } = await draw( {
            boardState: "ended",
            onTime: [ "<@1> · 1:05" ],
            onTimeCount: 4,
            onTimeHidden: 3
        } );

        // Assert.
        expect( description ).toContain( "**✅ Came (4)**\n<@1> · 1:05\n+3 more" );
    } );

    it( "should say how little time in voice counted as not coming, on an attendance held to one", async() => {
        // Act.
        const held = await draw( { boardState: "ended", minVoiceMinutes: 5 } ),
            notHeld = await draw( { boardState: "ended", minVoiceMinutes: 0 } );

        // Assert.
        expect( held.description ).toBe(
            `Held <t:${ STARTS_AT }:F> in <#123>.\n` +
            "Times are hours:minutes in voice.\n" +
            "Less than 5 min in voice counts as not coming."
        );
        expect( notHeld.description ).toBe( `Held <t:${ STARTS_AT }:F> in <#123>.\nTimes are hours:minutes in voice.` );
    } );

    it( "should say only that a canceled event is off", async() => {
        // Act.
        const { title, description } = await draw( {
            boardState: "canceled",
            waiting: [ "<@2>" ],
            waitingCount: 1
        } );

        // Assert.
        expect( title ).toBe( "📅  Raid Night · Canceled" );
        expect( description ).toBe( `Canceled - it was set for <t:${ STARTS_AT }:F>.` );
    } );

    it( "should say where a moved event went", async() => {
        // Act.
        const { description } = await draw( { boardState: "moved", movedToAt: STARTS_AT + 3600 } );

        // Assert.
        expect( description ).toBe( `Moved to <t:${ STARTS_AT + 3600 }:F>. A new board goes up before then.` );
    } );

    it( "should draw the blue line along its bottom", async() => {
        // Act.
        const { image } = await draw( { boardState: "check-in" } );

        // Assert.
        expect( image ).toEqual( { url: UI_IMAGE_BLUE_LINE_URL } );
    } );

    it.each( [ "check-in", "running", "ended", "canceled", "moved" ] )(
        "should leave no variable unfilled on a %s board",
        async( boardState ) => {
            // Act.
            const { title, description } = await draw( {
                boardState,
                minVoiceMinutes: 5,
                checkedIn: [ "<@1>" ],
                checkedInCount: 1,
                onTime: [ "<@1>" ],
                onTimeCount: 1,
                walkIns: [ "<@4>" ],
                walkInsCount: 1,
                walkInsHidden: 2
            } );

            // Assert.
            expect( title ).not.toMatch( /\{[a-zA-Z]+\}/ );
            expect( description ).not.toMatch( /\{[a-zA-Z]+\}/ );
        }
    );
} );
