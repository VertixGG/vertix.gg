import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { ChannelGoneAdapter } from "@vertix.gg/bot/src/ui/general/channel-gone/channel-gone-adapter";

import type { UIArgsManager } from "@vertix.gg/gui/src/bases/ui-args-manager";
import type { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

/**
 * A notice replacing the screen a press came from.
 *
 * The screen belongs to whichever adapter drew it, and args are kept per message under the name of
 * the adapter that stored them - so a notice taking that message over looks for args under an id it
 * has never written to and finds none. `editReply()` used to resolve args only for dynamic
 * adapters; every notice is static, so `build()` was handed an `undefined`, refused it, and
 * `getMessage()` was then left with no schema to read. The press died there: no answer, no notice,
 * and Discord's own "did not respond in time" where the screen had been.
 *
 * The gate answers two ways, and both are here: a press has a screen to replace, and anything else
 * is answered fresh with `ephemeral()`. What they have in common is that args have to end up where
 * the next press will look for them.
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

        // A press nothing has answered yet is answered by the screen itself, in one `update()`.
        update: jest.fn<( message: unknown ) => Promise<unknown>>().mockResolvedValue( undefined ),
        deferUpdate: jest.fn<() => Promise<unknown>>().mockResolvedValue( undefined ),
        editReply: jest.fn<( message: unknown ) => Promise<unknown>>().mockResolvedValue( undefined )
    };
}

const REPLY_ID = "the-message-the-reply-created";

function createCommand() {
    return {
        id: "interaction-id",
        // A command has no message behind it - the reply it makes is the first one there is.
        guildId: undefined,
        user: { id: "user-id" },
        deferred: false,
        replied: false,

        isCommand: () => true,
        isMessageComponent: () => false,
        isModalSubmit: () => false,
        isUserSelectMenu: () => false,
        isChannelSelectMenu: () => false,

        reply: jest.fn<( options: unknown ) => Promise<unknown>>()
            .mockResolvedValue( { resource: { message: { id: REPLY_ID } } } )
    };
}

/** Where a static adapter's args are kept, reached the way the gui's own cleanup spec reaches it. */
const staticArgs = () =>
    ( UIAdapterBase as unknown as { staticArgs: UIArgsManager } ).staticArgs;

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
        expect( interaction.update ).toHaveBeenCalledTimes( 1 );

        const message = interaction.update.mock.calls[ 0 ][ 0 ] as {
            embeds: unknown[];
            components: unknown[];
        };

        // The notice is there in place of the screen...
        expect( message.embeds ).toHaveLength( 1 );

        // ... and the buttons of the screen it replaced are not. A notice that left them would be
        // telling the member the channel is gone underneath the controls for it.
        expect( message.components ).toEqual( [] );
    } );

    /**
     * The other half, and the bug that named this file's sibling: a reply is a message in its own
     * right, and every component drawn on it arrives naming *it* rather than whatever was pressed
     * to open it. Args are kept per message, so an `ephemeral()` that stored none against the
     * message it just made left the first press on that screen asking for an id nothing was written
     * under - `ArgsNotFound`, and then a `TypeError` reading a name off the args that never arrived.
     */
    it( "should store its args against the reply it creates", async() => {
        // Arrange - a command, so there is no earlier message the args could be hiding on.
        const notice = new ChannelGoneAdapter( {} as never ),
            interaction = createCommand();

        // Act.
        await notice.ephemeral( interaction as never, { channelId: "a-channel" } );

        // Assert - discord only hands back the message it created when asked to, and being able to
        // store against it is the entire reason for asking.
        const options = interaction.reply.mock.calls[ 0 ][ 0 ] as { withResponse?: boolean };

        expect( options.withResponse ).toBe( true );

        // And the args are under that message's id, which is where the next press will look.
        const stored = staticArgs().getArgsById( notice as unknown as UIBase, REPLY_ID );

        expect( stored ).toBeDefined();
        expect( stored.channelId ).toBe( "a-channel" );
    } );
} );
