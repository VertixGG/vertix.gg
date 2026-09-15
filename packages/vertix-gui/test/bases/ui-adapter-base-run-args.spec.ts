import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";
import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const ADAPTER_NAME = "VertixGUI/Test/RunArgsAdapter",
    MESSAGE_ID = "message-id";

// A button press, as much of one as `getArgsId` and `getArgsInternal` actually look at: the branch
// they take, and the message the screen's args are filed under.
const PRESS = {
    id: "interaction-id",
    customId: "hashed-custom-id",
    message: { id: MESSAGE_ID },
    isCommand: () => false,
    isModalSubmit: () => false,
    isMessageComponent: () => true
} as unknown as UIAdapterReplyContext;

/**
 * Stands the adapter up with everything around the part under test stubbed out - the component's
 * schema, the entity the press names, and what the adapter would rebuild from a channel. What is
 * left running is `run()` itself, and what is recorded is the one thing a handler actually sees.
 */
async function buildAdapter( rebuilt: UIArgs ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const Component = UIMockGeneratorUtil.createComponent()
        .withName( "VertixGUI/Test/RunArgsComponent" )
        .withInstanceType( UIInstancesTypes.Dynamic )
        .build();

    const seen: ( UIArgs | undefined )[] = [];

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

        protected getCustomIdForEntity() {
            return `${ ADAPTER_NAME }_TestEntity`;
        }

        protected async getReplyArgs() {
            return { ... rebuilt };
        }

        public async build() {
            return null;
        }

        protected async runEntityCallback() {
            seen.push( this.getArgsManager().getArgs( this, PRESS ) );
        }

        public storedArgs() {
            return this.getArgsManager().getArgsById( this, MESSAGE_ID );
        }

        public setStoredArgs( args: UIArgs ) {
            this.getArgsManager().setInitialArgs( this, MESSAGE_ID, args, { overwrite: true, silent: true } );
        }

        public clearStoredArgs() {
            this.getArgsManager().deleteArgs( this, MESSAGE_ID );
        }
    }

    const adapter = new ( TestAdapter as unknown as new( options: object ) => InstanceType<typeof TestAdapter> )( {} );

    await Component.prototype.waitUntilInitialized.call( adapter[ "component" ] );

    // The args manager is one object for the whole process, filed by adapter name and message id -
    // which is the very thing being tested, and also what carries one test's screen into the next.
    adapter.clearStoredArgs();

    return { adapter, seen };
}

/**
 * A handler reads its screen's args through the manager, and the manager is filled by whatever sent
 * the message. After a restart nothing in this process sent anything, so a handler reaching for a
 * field found `undefined.field` and threw - caught well above, which left the press unanswered and
 * whoever made it looking at "this interaction failed".
 */
describe( "VertixGUI/UIAdapterBase/run args", () => {
    it( "should hand the handler what it rebuilt when the screen has nothing stored", async() => {
        const { adapter, seen } = await buildAdapter( { channelName: "rebuilt" } );

        await adapter.run( PRESS as never );

        expect( seen[ 0 ] ).toMatchObject( { channelName: "rebuilt" } );
    } );

    it( "should leave stored args alone rather than write a rebuild over them", async() => {
        const { adapter, seen } = await buildAdapter( { channelName: "rebuilt" } );

        // What only the message it was sent with could know, and no rebuild could produce.
        adapter.setStoredArgs( { knockerId: "who-knocked" } );

        await adapter.run( PRESS as never );

        expect( adapter.storedArgs() ).toEqual( { knockerId: "who-knocked" } );
        expect( seen[ 0 ] ).toMatchObject( { knockerId: "who-knocked" } );
    } );

    it( "should give the handler an answerable screen even when the rebuild knows nothing", async() => {
        const { adapter, seen } = await buildAdapter( {} );

        await adapter.run( PRESS as never );

        // Not the missing field - that is gone for good. What matters is that reading it is a
        // question with an answer rather than a throw, so the adapter reaches its own "cannot".
        expect( seen[ 0 ] ).toBeDefined();
        expect( seen[ 0 ]?.knockerId ).toBeUndefined();
    } );
} );
