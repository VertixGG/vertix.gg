import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    installProbes,
    measure,
    PerformanceProbe,
    PerformanceReport,
    round
} from "@vertix.gg/gui/test/__test_utils__/performance-probe";

import type { UIArgs, UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Where a button press spends its time, from `run()` to the edited message.
 *
 * The component build is measured on its own in `ui-component-base-performance.spec.ts`. What this
 * adds is how many times a single press pays for it: `run()` resolves the args and builds the
 * screen before it hands the press to the handler, and a handler that answers by editing the
 * screen - which is what most of them do - resolves the args and builds it again. Each of those
 * builds carries its own round of language and customization lookups, and each argument
 * resolution is `getReplyArgs()`, which in the bot is where the database reads live.
 *
 * As in the component spec, the counts asserted are today's cost, not a goal. Lower one, and
 * update the number.
 */

const ADAPTER_NAME = "VertixGUI/Test/PerformanceAdapter",
    COMPONENT_NAME = "VertixGUI/Test/PerformanceAdapterComponent",
    GUILD_ID = "guild-id",
    MESSAGE_ID = "message-id";

const EMBED_COUNT = 2,
    BUTTON_COUNT = 10;

function createButton( index: number ) {
    return class extends UIElementButtonBase {
        public static getName() {
            return `VertixGUI/Test/PerformanceAdapterButton${ index }`;
        }

        public static getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        protected async getLabel() {
            return `Button ${ index }`;
        }

        protected async getStyle(): Promise<UIButtonStyleTypes> {
            return "secondary";
        }
    };
}

function createEmbed( index: number ) {
    return class extends UIEmbedBase {
        public static getName() {
            return `VertixGUI/Test/PerformanceAdapterEmbed${ index }`;
        }

        public static getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        protected getTitle() {
            return "Channel {channelName}";
        }

        protected getLogic( args?: UIArgs ) {
            return { channelName: args?.channelName };
        }
    };
}

const Component = class extends UIComponentBase {
    private static rows = [ 0, 5 ].map( ( start ) =>
        Array.from( { length: 5 }, ( _, i ) => createButton( start + i ) )
    );

    private static embeds = Array.from( { length: EMBED_COUNT }, ( _, i ) => createEmbed( i ) );

    public static getName() {
        return COMPONENT_NAME;
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected static getElements() {
        return this.rows;
    }

    protected static getEmbeds() {
        return this.embeds;
    }
};

/**
 * A button press on a guild message, as much of one as the path from `run()` through
 * `editReply()` reads. `editReply` is recorded rather than sent, so the test can confirm the
 * press actually reached the end.
 */
function createPress() {
    const edits: object[] = [];

    const press = {
        id: "interaction-id",
        customId: "hashed-custom-id",
        guildId: GUILD_ID,
        message: { id: MESSAGE_ID },
        deferred: false,
        replied: false,
        isCommand: () => false,
        isModalSubmit: () => false,
        isMessageComponent: () => true,
        isUserSelectMenu: () => false,
        isChannelSelectMenu: () => false,
        deferUpdate: async() => {
            press.deferred = true;
        },
        editReply: async( message: object ) => {
            edits.push( message );
        }
    };

    return { press: press as unknown as UIAdapterReplyContext, edits };
}

interface SetupOptions {
    replyArgsLatencyMs?: number;
    customizationLatencyMs?: number;
    guildDataLatencyMs?: number;
}

async function setup( options: SetupOptions = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const probes = installProbes( { customizationLatencyMs: options.customizationLatencyMs } ),
        replyArgs = new PerformanceProbe( "getReplyArgs", options.replyArgsLatencyMs ?? 0 ),
        guildData = new PerformanceProbe( "GuildDataManager.getData", options.guildDataLatencyMs ?? 0 );

    // The guild's language, which `build()` looks up whenever the args do not already carry one.
    // In the bot this is a cached settings read; here it is counted.
    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( {
        getData: () => guildData.around( () => ( { values: [ "en" ] } ) )
    } as unknown as GuildDataManager );

    const buildSpy = jest.spyOn( Component.prototype, "build" );

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
            return `${ ADAPTER_NAME }:VertixGUI/Test/PerformanceAdapterButton0`;
        }

        // Stands in for the per-adapter work the bot does here: reading the channel, its owner,
        // the master channel's settings.
        protected async getReplyArgs() {
            return replyArgs.around( () => ( { channelName: "Lobby #1" } ) );
        }

        // What most handlers do with a press: change something, then redraw the screen.
        protected async runEntityCallback( _entityName: string, interaction: UIAdapterReplyContext ) {
            await this.editReply( interaction as never, {} );
        }

        public clearStoredArgs() {
            this.getArgsManager().deleteArgs( this, MESSAGE_ID );
        }

        public storeArgs( args: UIArgs ) {
            this.getArgsManager().setInitialArgs( this, MESSAGE_ID, args, { overwrite: true, silent: true } );
        }
    }

    const adapter = new ( TestAdapter as unknown as new( options: object ) => InstanceType<typeof TestAdapter> )( {} );

    await adapter.waitUntilInitialized();

    adapter.clearStoredArgs();

    return {
        adapter,
        probes,
        replyArgs,
        guildData,
        buildSpy,
        reset() {
            probes.reset();
            replyArgs.reset();
            guildData.reset();
            buildSpy.mockClear();
        }
    };
}

describe( "VertixGUI/UIAdapterBase/performance", () => {
    const report = new PerformanceReport( "VertixGUI/UIAdapterBase - one button press ( run() -> handler -> editReply() )" );

    afterAll( () => report.print() );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    describe( "work per press", () => {
        it.each( [
            [ "after a restart ( nothing stored for the message )", false, 1 ],
            [ "on a message this process sent ( args stored )", true, 2 ]
        ] )( "should report what one press costs - %s", async( _label, hasStoredArgs, guildLanguageReads ) => {
            const ctx = await setup();

            if ( hasStoredArgs ) {
                ctx.adapter.storeArgs( { channelName: "Lobby #1" } );
            }

            const { press, edits } = createPress();

            await ctx.adapter.run( press as never );

            // The press did reach the end - otherwise the counts below describe a path nobody takes.
            expect( edits ).toHaveLength( 1 );

            // Two full builds for one press: `run()` draws the screen only to throw the drawing
            // away, and the handler's `editReply()` draws it again to send.
            expect( ctx.buildSpy ).toHaveBeenCalledTimes( 2 );

            // `run()` resolves once, and `editReply()` again because the handler handed it new
            // args - the database reads behind `getReplyArgs()` happen twice.
            expect( ctx.replyArgs.calls ).toBe( 2 );

            // A round of lookups per entity, per build.
            expect( ctx.probes.customization.calls ).toBe( 2 * ( EMBED_COUNT + BUTTON_COUNT ) );
            expect( ctx.probes.language.calls ).toBe( 2 * ( EMBED_COUNT + BUTTON_COUNT ) );
            expect( ctx.probes.customizationTargets.distinctTargets() ).toBe( 1 );

            // The guild's language is read again whenever the args being built lack `_language`.
            // After a restart `run()` stores the args it just built - language included - so the
            // edit finds it; when args were already stored the edit resolves fresh ones without it.
            expect( ctx.guildData.calls ).toBe( guildLanguageReads );

            report.add( {
                case: hasStoredArgs ? "args stored" : "after restart",
                "component builds": ctx.buildSpy.mock.calls.length,
                "getReplyArgs": ctx.replyArgs.calls,
                "guild language reads": ctx.guildData.calls,
                "customization lookups": ctx.probes.customization.calls,
                "language lookups": ctx.probes.language.calls
            } );
        } );
    } );

    describe( "latency", () => {
        // What each kind of wait is made to cost. The totals printed are what a press would take
        // if the bot's lookups cost this much - a cold cache, or a busy database.
        const REPLY_ARGS_MS = 10,
            CUSTOMIZATION_MS = 2;

        it( "should add up every wait on the path, one after another", async() => {
            const ctx = await setup( {
                replyArgsLatencyMs: REPLY_ARGS_MS,
                customizationLatencyMs: CUSTOMIZATION_MS
            } );

            const runOnce = async() => {
                ctx.adapter.clearStoredArgs();

                const { press } = createPress();

                await ctx.adapter.run( press as never );
            };

            await runOnce();
            ctx.reset();

            const sample = await measure( runOnce, 3, 0 ),
                perPress = {
                    replyArgs: ctx.replyArgs.calls / sample.iterations,
                    customization: ctx.probes.customization.calls / sample.iterations
                },
                replyArgsMs = perPress.replyArgs * REPLY_ARGS_MS,
                customizationMs = perPress.customization * CUSTOMIZATION_MS;

            // Nothing on the path overlaps, so a press cannot come in under the sum of its waits.
            expect( sample.perOpMs ).toBeGreaterThanOrEqual( ( replyArgsMs + customizationMs ) * 0.9 );

            report.add( {
                case: `latency: getReplyArgs ${ REPLY_ARGS_MS }ms, customization ${ CUSTOMIZATION_MS }ms`,
                "ms / press": round( sample.perOpMs, 1 ),
                "of which getReplyArgs": replyArgsMs,
                "of which customization": customizationMs,
                "ms if 1 getReplyArgs + 1 lookup": REPLY_ARGS_MS + CUSTOMIZATION_MS
            } );
        } );
    } );

    describe( "cpu", () => {
        it( "should report the cost of a press when every lookup is instant", async() => {
            const ctx = await setup();

            const sample = await measure( async() => {
                ctx.adapter.clearStoredArgs();

                const { press } = createPress();

                await ctx.adapter.run( press as never );
            }, 200 );

            // A guard against a pathological regression, not a benchmark gate.
            expect( sample.perOpMs ).toBeLessThan( 20 );

            report.add( {
                case: "instant lookups",
                "ms / press": round( sample.perOpMs ),
                "presses / s": Math.round( 1000 / sample.perOpMs )
            } );
        } );
    } );
} );
