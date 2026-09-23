import { jest } from "@jest/globals";

import { ComponentType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";
import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { Logger } from "@vertix.gg/base/src/modules/logger";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const ADAPTER_NAME = "VertixGUI/Test/EditReplyAdapter";

// The screen a press redraws to. What it says does not matter here - only which request carries it.
const SCREEN = { embeds: [ { title: "screen" } ], components: [] };

type PressKind = "component" | "modal-from-message" | "modal" | "command" | "user-select";

interface PressState {
    kind?: PressKind;
    deferred?: boolean;
    replied?: boolean;
}

let pressCount = 0;

/**
 * An interaction as far as `editReply()` reads one, recording each request it would have sent to
 * discord. Every press gets a message of its own, because args are kept per message in a manager
 * the whole process shares - a second test on the same id would find the first one's args waiting.
 */
function createPress( state: PressState = {} ) {
    const kind = state.kind ?? "component",
        requests: { method: string; options?: unknown }[] = [];

    const record = ( method: string ) => async( options?: unknown ) => {
        requests.push( { method, options } );
    };

    const interaction = {
        id: `interaction-${ ++pressCount }`,
        message: { id: `message-${ pressCount }` },
        // No guild, so the build reaches for no language and no customization.
        guildId: undefined,
        deferred: state.deferred ?? false,
        replied: state.replied ?? false,

        isCommand: () => "command" === kind,
        isMessageComponent: () => "component" === kind || "user-select" === kind,
        isModalSubmit: () => "modal" === kind || "modal-from-message" === kind,
        isFromMessage: () => "modal-from-message" === kind,
        isUserSelectMenu: () => "user-select" === kind,
        isChannelSelectMenu: () => false,

        update: jest.fn( record( "update" ) ),
        deferUpdate: jest.fn( record( "deferUpdate" ) ),
        editReply: jest.fn( record( "editReply" ) )
    };

    return {
        interaction: interaction as unknown as UIAdapterReplyContext,
        mock: interaction,
        sent: () => requests.map( ( request ) => request.method ),
        requests
    };
}

async function buildAdapter( screen: object = SCREEN ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const Component = UIMockGeneratorUtil.createComponent()
        .withName( "VertixGUI/Test/EditReplyComponent" )
        .withInstanceType( UIInstancesTypes.Dynamic )
        .build();

    class TestAdapter extends UIAdapterBase<never, never> {
        public static getName() {
            return ADAPTER_NAME;
        }

        public static getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        public static getComponent() {
            return Component;
        }

        protected shouldDisableMiddleware() {
            return true;
        }

        protected async getReplyArgs() {
            return {};
        }

        public async build() {
            return null;
        }

        protected getMessage() {
            return screen as never;
        }
    }

    return new TestAdapter( { instanceType: UIInstancesTypes.Dynamic } as never );
}

/**
 * How a redrawn screen reaches discord.
 *
 * A press that nothing has answered yet is answered by the screen itself: `update()` acknowledges it
 * and edits its message in one request. It used to be two - `deferUpdate()`, then `editReply()` -
 * sent back to back once the screen was built, so the defer bought no time and cost a round trip of
 * three to four hundred milliseconds on every press that redraws a screen. Whatever has already been
 * answered, or has no message of its own to update, keeps the edit it always had.
 */
describe( "VertixGUI/UIAdapterBase/editReply", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should answer a fresh press with the screen itself, in one request", async() => {
        // Arrange.
        const adapter = await buildAdapter(),
            press = createPress();

        // Act.
        await adapter.editReply( press.interaction as never );

        // Assert.
        expect( press.sent() ).toEqual( [ "update" ] );
        expect( press.requests[ 0 ].options ).toEqual( SCREEN );
    } );

    it( "should answer a modal opened from a message the same way", async() => {
        // Arrange.
        const adapter = await buildAdapter(),
            press = createPress( { kind: "modal-from-message" } );

        // Act.
        await adapter.editReply( press.interaction as never );

        // Assert.
        expect( press.sent() ).toEqual( [ "update" ] );
    } );

    /**
     * Answered already - deferred by a handler that had slow work to do, or updated by a screen
     * that greyed its own controls first. A second answer would be refused as "already
     * acknowledged", so the screen goes out as an edit of the answer that was given.
     */
    it.each( [
        [ "deferred", { deferred: true } ],
        [ "replied", { replied: true } ]
    ] )( "should edit a press already %s rather than answer it again", async( _label, state ) => {
        // Arrange.
        const adapter = await buildAdapter(),
            press = createPress( state );

        // Act.
        await adapter.editReply( press.interaction as never );

        // Assert.
        expect( press.sent() ).toEqual( [ "editReply" ] );
    } );

    it( "should defer and then edit a modal that did not come from a message", async() => {
        // Arrange - a modal opened by a command has no message behind it to update.
        const adapter = await buildAdapter(),
            press = createPress( { kind: "modal" } );

        // Act.
        await adapter.editReply( press.interaction as never );

        // Assert.
        expect( press.sent() ).toEqual( [ "deferUpdate", "editReply" ] );
    } );

    it( "should edit a command's reply without deferring it", async() => {
        // Arrange.
        const adapter = await buildAdapter(),
            press = createPress( { kind: "command" } );

        // Act.
        await adapter.editReply( press.interaction as never );

        // Assert.
        expect( press.sent() ).toEqual( [ "editReply" ] );
    } );

    /**
     * Not the path this changed, and deliberately still two requests: the first sends the screen
     * without its user select and the second puts it back, which is what clears the pick discord
     * would otherwise go on showing in the menu.
     */
    it( "should still reset a user select with an update and then an edit", async() => {
        // Arrange.
        const adapter = await buildAdapter( {
                embeds: [],
                components: [ {
                    type: ComponentType.ActionRow,
                    components: [ { type: ComponentType.UserSelect, custom_id: "user-select" } ]
                } ]
            } ),
            press = createPress( { kind: "user-select" } );

        // Act.
        await adapter.editReply( press.interaction as never );

        // Assert.
        expect( press.sent() ).toEqual( [ "update", "editReply" ] );
        expect( press.requests[ 0 ].options ).toEqual( { components: [], embeds: [] } );
    } );

    it( "should log an update discord refuses rather than throw it at the press", async() => {
        // Arrange.
        const adapter = await buildAdapter(),
            press = createPress(),
            refused = new Error( "Unknown interaction" ),
            logger = ( UIAdapterBase as unknown as { staticLogger: Logger } ).staticLogger,
            logged = jest.spyOn( logger, "error" ).mockImplementation( () => {} );

        press.mock.update.mockRejectedValueOnce( refused );

        // Act.
        await expect( adapter.editReply( press.interaction as never ) ).resolves.toBeUndefined();

        // Assert - one attempt, reported, and no second request sent after it. Read off the mocks
        // rather than `sent()`: the refusal replaces the recording for that one call.
        expect( press.mock.update ).toHaveBeenCalledTimes( 1 );
        expect( press.mock.deferUpdate ).not.toHaveBeenCalled();
        expect( press.mock.editReply ).not.toHaveBeenCalled();
        expect( logged ).toHaveBeenCalledWith( expect.any( Function ), "", refused );
    } );
} );
