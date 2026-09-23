import { TextChannel } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";
import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const ADAPTER_NAME = "VertixGUI/Test/RenderAdapter";

interface IBuild {
    args: UIArgs;
    from: UIAdapterBuildSource;
    context: unknown;
}

/**
 * A channel `send()` will post into, as much of one as it looks at: the class it checks for, and the
 * `send` it calls. What was posted is recorded, since posting nothing is half of what is asserted.
 */
function createChannel() {
    const posted: unknown[] = [];

    const channel = Object.assign( Object.create( TextChannel.prototype ), {
        id: "channel-id",
        guildId: "guild-id",
        send: async( message: unknown ) => {
            posted.push( message );

            return { id: "posted-message-id" };
        }
    } );

    return { channel, posted };
}

/**
 * Stands the adapter up with its component's build stubbed out, so what is drawn follows from what
 * the build was handed - the args `getStartArgs()` resolved - and nothing else.
 */
async function buildAdapter() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const Component = UIMockGeneratorUtil.createComponent()
        .withName( "VertixGUI/Test/RenderComponent" )
        .withInstanceType( UIInstancesTypes.Dynamic )
        .build();

    const builds: IBuild[] = [];

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

        protected async getStartArgs( _channel?: never, argsFromManager?: UIArgs ) {
            return { ...argsFromManager, resolved: true };
        }

        public async build( args: UIArgs, from: UIAdapterBuildSource, context: unknown ) {
            builds.push( { args, from, context } );

            return null;
        }

        protected getMessage() {
            const { args } = builds[ builds.length - 1 ];

            return { content: `drawn for ${ args.title }`, embeds: [], components: [] };
        }
    }

    const adapter = new TestAdapter( { instanceType: UIInstancesTypes.Dynamic } as never );

    return { adapter, builds };
}

/**
 * A caller deciding whether a message is worth a request - a control panel that has not changed since
 * it was last drawn - has to know what the message would say without it being sent.
 */
describe( "VertixGUI/UIAdapterBase/render", () => {
    it( "should draw what a send would post, without posting it", async() => {
        // Arrange.
        const { adapter, builds } = await buildAdapter(),
            { channel, posted } = createChannel();

        // Act.
        const drawing = await adapter.render( channel as never, { title: "panel" } );

        // Assert - built from the args a send resolves, and nothing reached the channel.
        expect( drawing ).toEqual( { content: "drawn for panel", embeds: [], components: [] } );
        expect( builds ).toHaveLength( 1 );
        expect( builds[ 0 ] ).toMatchObject( {
            args: { title: "panel", resolved: true },
            from: "send",
            context: channel
        } );
        expect( posted ).toHaveLength( 0 );
    } );

    // What makes it safe to decide on: comparing a drawing against a stored one only means something
    // when the drawing is the message that would go out.
    it( "should hand back exactly what a send then posts", async() => {
        // Arrange.
        const { adapter } = await buildAdapter(),
            { channel, posted } = createChannel();

        // Act.
        const drawing = await adapter.render( channel as never, { title: "panel" } );

        await adapter.send( channel as never, { title: "panel" } );

        // Assert.
        expect( posted ).toEqual( [ drawing ] );
    } );
} );
