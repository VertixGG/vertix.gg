import { MessageFlags } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";
import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const ADAPTER_NAME = "VertixGUI/Test/EphemeralAdapter";

interface InteractionCalls {
    reply: unknown[];
    followUp: unknown[];
}

/**
 * A press, in the two states an interaction can be in by the time a screen is shown to it: freshly
 * arrived, and already answered. `deferred` is the one that matters - a wizard defers its finish
 * button before running the callback, so every screen the callback opens meets an answered
 * interaction.
 */
function createPress( state: { deferred?: boolean; replied?: boolean } = {} ) {
    const calls: InteractionCalls = { reply: [], followUp: [] };

    const interaction = {
        id: "interaction-id",
        customId: "hashed-custom-id",
        user: { id: "user-id" },
        message: { id: "message-id" },
        deferred: state.deferred ?? false,
        replied: state.replied ?? false,
        isCommand: () => false,
        isModalSubmit: () => false,
        isMessageComponent: () => true,

        reply: async( options: unknown ) => {
            calls.reply.push( options );

            // What discord.js itself does on an interaction already answered. The point of the
            // test is that this is never reached for one, so leaving it as a throw keeps the
            // failure loud rather than letting a silent reply pass.
            if ( interaction.deferred || interaction.replied ) {
                throw new Error( "The reply to this interaction has already been sent or deferred." );
            }

            return { resource: { message: { id: "reply-message-id" } } };
        },

        followUp: async( options: unknown ) => {
            calls.followUp.push( options );
            return { id: "follow-up-message-id" };
        }
    };

    return { interaction: interaction as unknown as UIAdapterReplyContext, calls };
}

async function buildAdapter( message: object = { content: "screen" } ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const Component = UIMockGeneratorUtil.createComponent()
        .withName( "VertixGUI/Test/EphemeralComponent" )
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

        protected getCustomIdForEntity() {
            return `${ ADAPTER_NAME }_TestEntity`;
        }

        protected async getReplyArgs() {
            return {};
        }

        public async build() {
            return null;
        }

        protected getMessage() {
            return message as never;
        }
    }

    return new TestAdapter( { instanceType: UIInstancesTypes.Dynamic } as never );
}

describe( "VertixGUI/UIAdapterBase/ephemeral", () => {

    it( "should reply to an interaction that has not been answered", async() => {
        // Arrange.
        const adapter = await buildAdapter(),
            { interaction, calls } = createPress();

        // Act.
        await adapter.ephemeral( interaction as never );

        // Assert.
        expect( calls.reply ).toHaveLength( 1 );
        expect( calls.followUp ).toHaveLength( 0 );
    } );

    /**
     * The regression this exists for: a wizard defers its finish button, the callback fails, and
     * the screen that would say why was opened with `reply()` - which throws on a deferred
     * interaction straight into a `catch` that only logs. The admin pressed finish four times in
     * eight minutes, was shown nothing at all any of them, and kicked the bot.
     */
    it.each( [
        [ "deferred", { deferred: true } ],
        [ "replied", { replied: true } ]
    ] )( "should follow up on an interaction already %s", async( _label, state ) => {
        // Arrange.
        const adapter = await buildAdapter(),
            { interaction, calls } = createPress( state );

        // Act.
        await adapter.ephemeral( interaction as never );

        // Assert - the screen went out, and it did not go out as a second reply.
        expect( calls.followUp ).toHaveLength( 1 );
        expect( calls.reply ).toHaveLength( 0 );
        expect( calls.followUp[ 0 ] ).toMatchObject( { flags: [ MessageFlags.Ephemeral ] } );
    } );

    /**
     * `ephemeral: true` was how this asked for a private screen, and discord.js is dropping it in
     * favour of the flag. The two cannot both be given, and a container screen already arrives
     * carrying `IsComponentsV2` - so setting the flag rather than merging it sends the container
     * as an ordinary message, which discord refuses, since a container has no `content` and no
     * `embeds` to fall back on. These two say the flag is asked for, and that the one already
     * there survives being asked.
     */
    it( "should ask for the screen by flag rather than by the option discord.js is dropping", async() => {
        // Arrange.
        const adapter = await buildAdapter(),
            { interaction, calls } = createPress();

        // Act.
        await adapter.ephemeral( interaction as never );

        // Assert.
        expect( calls.reply[ 0 ] ).toMatchObject( { flags: [ MessageFlags.Ephemeral ] } );
        expect( calls.reply[ 0 ] ).not.toHaveProperty( "ephemeral" );
    } );

    it( "should keep a container's own flag when it adds the ephemeral one", async() => {
        // Arrange.
        const adapter = await buildAdapter( {
                components: [],
                flags: MessageFlags.IsComponentsV2
            } ),
            { interaction, calls } = createPress();

        // Act.
        await adapter.ephemeral( interaction as never );

        // Assert.
        expect( calls.reply[ 0 ] ).toMatchObject( {
            flags: [ MessageFlags.Ephemeral, MessageFlags.IsComponentsV2 ]
        } );
    } );
} );
