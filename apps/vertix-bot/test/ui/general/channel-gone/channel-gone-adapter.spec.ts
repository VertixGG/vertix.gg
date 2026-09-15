import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ChannelGoneAdapter } from "@vertix.gg/bot/src/ui/general/channel-gone/channel-gone-adapter";

/**
 * A notice replacing the screen a press came from.
 *
 * The screen belongs to whichever adapter drew it, and args are kept per message under the name of
 * the adapter that stored them - so a notice taking that message over looks for args under an id it
 * has never written to and finds none. `editReply()` used to resolve args only for dynamic
 * adapters; every notice is static, so `build()` was handed an `undefined`, refused it, and
 * `getMessage()` was then left with no schema to read. The press died there: no answer, no notice,
 * and Discord's own "did not respond in time" where the screen had been.
 */

const MESSAGE_ID = "message-the-notice-did-not-write";

function createButtonPress() {
    return {
        id: "interaction-id",
        // A press carries the message it sits on - which is how `getArgsId` names the args.
        message: { id: MESSAGE_ID },
        // No guild, so nothing reaches for a language or a customization the mock cannot answer.
        guildId: undefined,
        user: { id: "user-id" },
        deferred: false,
        replied: false,

        isCommand: () => false,
        isMessageComponent: () => true,
        isModalSubmit: () => false,
        isUserSelectMenu: () => false,
        isChannelSelectMenu: () => false,

        deferUpdate: jest.fn<() => Promise<unknown>>().mockResolvedValue( undefined ),
        editReply: jest.fn<( message: unknown ) => Promise<unknown>>().mockResolvedValue( undefined )
    };
}

describe( "VertixBot/UI-General/ChannelGone", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should replace a message it has no args for", async() => {
        // Arrange - a fresh notice, and a press on somebody else's screen.
        const notice = new ChannelGoneAdapter( {} as never ),
            interaction = createButtonPress();

        // Act.
        await notice.editReply( interaction as never, {} );

        // Assert - it answered, which is what the press needed most.
        expect( interaction.editReply ).toHaveBeenCalledTimes( 1 );

        const message = interaction.editReply.mock.calls[ 0 ][ 0 ] as {
            embeds: unknown[];
            components: unknown[];
        };

        // The notice is there in place of the screen...
        expect( message.embeds ).toHaveLength( 1 );

        // ... and the buttons of the screen it replaced are not. A notice that left them would be
        // telling the member the channel is gone underneath the controls for it.
        expect( message.components ).toEqual( [] );
    } );
} );
