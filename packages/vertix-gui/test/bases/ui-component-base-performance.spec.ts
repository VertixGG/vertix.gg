import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    installProbes,
    measure,
    PerformanceReport,
    round
} from "@vertix.gg/gui/test/__test_utils__/performance-probe";

import type { UIArgs, UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Where a component build spends its time.
 *
 * A build throws away every dynamic entity and constructs it again, one after another, and each
 * one awaits a language lookup and a customization lookup before the next is started. Nothing in
 * that is slow by itself; what makes it slow is that it is multiplied - by the entities on the
 * screen, and by the builds a single press triggers (see `ui-adapter-base-performance.spec.ts`).
 *
 * The counts asserted here are today's cost, not a target. A change that lowers one - asking the
 * customization provider once per build, say, or awaiting the entities together - should make the
 * matching test fail, and the number in it should be updated to the new, smaller one.
 */

const COMPONENT_NAME = "VertixGUI/Test/PerformanceComponent",
    GUILD_ID = "guild-id";

// What `UIAdapterBase.build()` puts on the args before it hands them to the component: without a
// guild and a component name the entities skip the customization lookup entirely, and the build
// being measured would not be the one the bot runs.
const BUILD_ARGS: UIArgs = {
    _guildId: GUILD_ID,
    _customizationComponent: COMPONENT_NAME,
    _customizationState: "VertixGUI/Test/PerformanceState",
    _language: "en",
    channelName: "Lobby #1",
    userCount: 4
};

function createButton( index: number ) {
    return class extends UIElementButtonBase {
        public static getName() {
            return `VertixGUI/Test/PerformanceButton${ index }`;
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

        protected async getEmoji() {
            return "🔒";
        }
    };
}

function createEmbed( index: number ) {
    return class extends UIEmbedBase {
        public static getName() {
            return `VertixGUI/Test/PerformanceEmbed${ index }`;
        }

        public static getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        protected getTitle() {
            return "Channel {channelName}";
        }

        protected getDescription() {
            return "There are {userCount} members in {channelName}, state: {state}";
        }

        protected getOptions() {
            return {
                state: {
                    open: "Open",
                    closed: "Closed"
                }
            };
        }

        protected getLogic( args?: UIArgs ) {
            return {
                channelName: args?.channelName,
                userCount: args?.userCount,
                state: "open"
            };
        }
    };
}

/**
 * A component shaped like the ones the bot draws: a handful of embeds over rows of five buttons.
 */
function createComponent( embedCount: number, buttonCount: number ) {
    const embeds = Array.from( { length: embedCount }, ( _, i ) => createEmbed( i ) ),
        buttons = Array.from( { length: buttonCount }, ( _, i ) => createButton( i ) ),
        rows: ( typeof buttons )[] = [];

    for ( let i = 0; i < buttons.length; i += 5 ) {
        rows.push( buttons.slice( i, i + 5 ) );
    }

    return class extends UIComponentBase {
        public static getName() {
            return COMPONENT_NAME;
        }

        public static getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        protected static getElements() {
            return rows;
        }

        protected static getEmbeds() {
            return embeds;
        }
    };
}

async function setup( options: { embeds: number; buttons: number; languageLatencyMs?: number; customizationLatencyMs?: number } ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const probes = installProbes( options ),
        Component = createComponent( options.embeds, options.buttons ),
        component = new Component();

    await component.waitUntilInitialized();

    return { probes, component };
}

describe( "VertixGUI/UIComponentBase/performance", () => {
    const report = new PerformanceReport( "VertixGUI/UIComponentBase - build()" );

    afterAll( () => report.print() );

    describe( "lookups per build", () => {
        it( "should ask the language manager once per entity", async() => {
            const { probes, component } = await setup( { embeds: 2, buttons: 10 } );

            await component.build( { ...BUILD_ARGS } );

            expect( probes.language.calls ).toBe( 12 );

            report.add( { case: "2 embeds + 10 buttons", probe: "language", calls: probes.language.calls } );
        } );

        it( "should ask the customization provider once per entity, for the very same target", async() => {
            const { probes, component } = await setup( { embeds: 2, buttons: 10 } );

            await component.build( { ...BUILD_ARGS } );

            // Twelve asks, one answer: every entity on the screen resolves the same guild,
            // component, state and language. On a cache miss in `GuildCustomizationManager` each
            // of these is a database read.
            expect( probes.customization.calls ).toBe( 12 );
            expect( probes.customizationTargets.distinctTargets() ).toBe( 1 );

            report.add( {
                case: "2 embeds + 10 buttons",
                probe: "customization",
                calls: probes.customization.calls,
                distinct: probes.customizationTargets.distinctTargets()
            } );
        } );

        it( "should wait for each lookup before starting the next", async() => {
            const { probes, component } = await setup( { embeds: 2, buttons: 10 } );

            await component.build( { ...BUILD_ARGS } );

            // One in flight at a time: the lookups are serial, so their latency adds up rather
            // than overlapping. This is the number to watch when making the build concurrent.
            expect( probes.language.maxInFlight ).toBe( 1 );
            expect( probes.customization.maxInFlight ).toBe( 1 );
        } );
    } );

    describe( "latency", () => {
        // Small enough to keep the suite quick, large enough to dwarf the CPU cost of a build.
        const LATENCY_MS = 5;

        it.each( [
            [ 1, 5 ],
            [ 2, 10 ],
            [ 3, 25 ]
        ] )( "should pay every customization lookup back to back ( %i embeds, %i buttons )", async( embeds, buttons ) => {
            const { probes, component } = await setup( { embeds, buttons, customizationLatencyMs: LATENCY_MS } );

            // Warm the path once so module loading is not billed to the build.
            await component.build( { ...BUILD_ARGS } );
            probes.reset();

            const sample = await measure( () => component.build( { ...BUILD_ARGS } ), 3, 0 ),
                lookupsPerBuild = probes.customization.calls / sample.iterations,
                serialFloorMs = lookupsPerBuild * LATENCY_MS;

            expect( lookupsPerBuild ).toBe( embeds + buttons );

            // Timers never fire early by more than a tick, so a build whose lookups are serial can
            // never beat the sum of their latencies. Were they awaited together, it would come in
            // near a single one.
            expect( sample.perOpMs ).toBeGreaterThanOrEqual( serialFloorMs * 0.9 );

            report.add( {
                case: `${ embeds } embeds + ${ buttons } buttons, ${ LATENCY_MS }ms lookup`,
                probe: "customization",
                calls: lookupsPerBuild,
                "ms / build": round( sample.perOpMs, 1 ),
                "ms if concurrent": LATENCY_MS
            } );
        } );
    } );

    describe( "cpu", () => {
        // Everything answers instantly here, so what is left is the GUI's own work: constructing
        // the entities, composing their templates and assembling the schema.
        it.each( [
            [ 1, 5 ],
            [ 3, 25 ]
        ] )( "should report the cost of a build with instant lookups ( %i embeds, %i buttons )", async( embeds, buttons ) => {
            const { component } = await setup( { embeds, buttons } );

            const sample = await measure( () => component.build( { ...BUILD_ARGS } ), 200 );

            // Not a benchmark gate - machines differ too much for that. It is here to catch a
            // pathological regression, the kind that turns a build into tens of milliseconds.
            expect( sample.perOpMs ).toBeLessThan( 20 );

            report.add( {
                case: `${ embeds } embeds + ${ buttons } buttons, instant lookups`,
                probe: "cpu",
                "ms / build": round( sample.perOpMs ),
                "builds / s": Math.round( 1000 / sample.perOpMs )
            } );
        } );
    } );
} );
