import { jest } from "@jest/globals";

import { ALL_MODULES } from "@vertix.gg/definitions/src/ui-export-definitions";

import type { ModuleFlowsResponse } from "@vertix.gg/api/src/server/types";
import type { UIExportedComponent, UIExportedFlow } from "@vertix.gg/definitions/src/ui-export-definitions";

const GENERAL = "VertixBot/UI-General/Module",
    V3 = "VertixBot/UI-V3/Module";

function aFlow( name: string, module: string, extra: Partial<UIExportedFlow> = {} ): UIExportedFlow {
    return {
        name,
        module,
        flowKind: "standard",
        initialState: `${ name }/States/Initial`,
        states: [],
        transitions: [],
        ... extra
    } as unknown as UIExportedFlow;
}

function aComponent( name: string, module: string ): UIExportedComponent {
    return { name, modules: [ module ], states: [], modals: [] } as unknown as UIExportedComponent;
}

/**
 * The one flow that reaches across, and the one it reaches.
 *
 * The general module's setup flow is what opens the v3 setup editor, and nothing inside v3 opens
 * it - which is the whole reason the all-modules payload exists.
 */
const SETUP_FLOW = aFlow( "VertixBot/UI-General/SetupFlow", GENERAL, {
        handoffPoints: [ { flowName: "VertixBot/UI-V3/SetupEditFlow" } ],
        edgeSourceMappings: [ { targetFlowName: "VertixBot/UI-V3/SetupEditFlow" } ]
    } as Partial<UIExportedFlow> ),
    SETUP_EDIT_FLOW = aFlow( "VertixBot/UI-V3/SetupEditFlow", V3 ),
    COMMANDS_FLOW = aFlow( "VertixBot/UI-V3/CommandsFlow", V3, { flowKind: "system" } as Partial<UIExportedFlow> );

const ALL_FLOWS = [ SETUP_FLOW, SETUP_EDIT_FLOW, COMMANDS_FLOW ],
    ALL_COMPONENTS = [ aComponent( "VertixBot/UI-General/SetupComponent", GENERAL ),
        aComponent( "VertixBot/UI-V3/ConfigComponent", V3 ) ];

// Mocked rather than stood up: the real loader reads the bot's exported definitions off disk and
// none of what is being checked here is about where they came from.
jest.unstable_mockModule( "@vertix.gg/api/src/bootstrap", () => ( {
    uiExportLoader: {
        loadExports: async() => undefined,
        getFlowsForModule: ( module: string ) => ALL_FLOWS.filter( ( flow ) => flow.module === module ),
        getComponentsForModule: ( module: string ) => ALL_COMPONENTS.filter( ( component ) => component.modules.includes( module ) ),
        getAllFlows: () => [ ... ALL_FLOWS ],
        getAllComponents: () => [ ... ALL_COMPONENTS ],
        getFlow: ( name: string ) => ALL_FLOWS.find( ( flow ) => flow.name === name ),
        getComponent: ( name: string ) => ALL_COMPONENTS.find( ( component ) => component.name === name )
    },
    UIDefinitionsUnavailableError: class extends Error {}
} ) );

const { getFlowData } = await import( "@vertix.gg/api/src/server/services/flow-service" );

const askFor = async( moduleName: string ) =>
    await getFlowData( moduleName ) as ModuleFlowsResponse;

const namesIn = ( data: ModuleFlowsResponse ) =>
    [ ... data.flows, ... data.systemFlows ].map( ( flow ) => flow.name );

/**
 * What the editor draws a canvas from.
 *
 * Asked for a module it answers with that module's flows plus whatever they hand off to, which is
 * a reference followed outwards. Nothing follows one inwards, so a flow opened only from another
 * module arrives with nothing on the canvas to draw the arrival from - and that is what asking for
 * every module at once is for.
 */
describe( "VertixAPI/FlowService/getFlowData", () => {
    it( "should answer with one module's own flows", async() => {
        const data = await askFor( V3 );

        expect( data.module ).toBe( V3 );
        expect( namesIn( data ) ).toEqual( [ "VertixBot/UI-V3/SetupEditFlow", "VertixBot/UI-V3/CommandsFlow" ] );
    } );

    it( "should leave a flow that only reaches in behind", async() => {
        const data = await askFor( V3 );

        expect( namesIn( data ) ).not.toContain( "VertixBot/UI-General/SetupFlow" );
    } );

    it( "should carry a flow this module hands off to", async() => {
        const data = await askFor( GENERAL );

        expect( namesIn( data ) ).toContain( "VertixBot/UI-V3/SetupEditFlow" );
    } );

    it( "should answer with every module's flows when asked for all of them", async() => {
        const data = await askFor( ALL_MODULES );

        expect( data.module ).toBe( ALL_MODULES );
        expect( namesIn( data ) ).toEqual( expect.arrayContaining( ALL_FLOWS.map( ( flow ) => flow.name ) ) );
        expect( data.components ).toHaveLength( ALL_COMPONENTS.length );
    } );

    /**
     * The collecting that pulls in a referenced flow is left running for the all-modules answer, so
     * this is what says it cannot pull one in twice: every referenced name is already among them.
     */
    it( "should not carry a flow twice when asked for all of them", async() => {
        const names = namesIn( await askFor( ALL_MODULES ) );

        expect( names ).toHaveLength( new Set( names ).size );
    } );

    it( "should keep the routers apart from the rest when asked for all of them", async() => {
        const data = await askFor( ALL_MODULES );

        expect( data.systemFlows.map( ( flow ) => flow.name ) ).toEqual( [ "VertixBot/UI-V3/CommandsFlow" ] );
        expect( data.flows.map( ( flow ) => flow.name ) ).not.toContain( "VertixBot/UI-V3/CommandsFlow" );
    } );

    it( "should answer with nothing for a module the bot does not declare", async() => {
        const data = await askFor( "VertixBot/UI-Nowhere/Module" );

        expect( namesIn( data ) ).toEqual( [] );
        expect( data.components ).toEqual( [] );
    } );
} );
