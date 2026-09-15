import fs from "fs";
import path from "path";

import { getAllCommandDefinitions } from "@vertix.gg/bot/src/commands/definitions";

import type { ICommandDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/**
 * A command and the button beside it should end up in the same place.
 *
 * Read from the definitions the bot exports about itself rather than from its source: the control
 * panel's flow names every button's transition and where it leads, and a command declares the state
 * it leads to. They are two descriptions of one journey, and they drifting apart is invisible - the
 * command still works, and the flow graph the dashboard draws quietly points somewhere else.
 *
 * This is agreement on destination. That a command uses the same *mechanism* as its button - a
 * modal, an entity's handler, a screen - is `voice-commands.spec.ts`, and driving the button itself
 * needs the real ui runtime, which no test here stands up.
 */

const PANEL_FLOW = "VertixBot/UI-V3/DynamicChannelFlow";

/**
 * Which button belongs to which subcommand. Written out, because deriving it from either side would
 * make the two agree by construction and assert nothing.
 */
const BUTTON_TRANSITION_BY_COMMAND: Record<string, string> = {
    rename: "OpenRename",
    status: "OpenStatus",
    limit: "OpenLimit",
    access: "OpenPermissions",
    privacy: "OpenPrivacy",
    region: "OpenRegion",
    message: "OpenPrimaryMessageEdit",
    "clear-chat": "ClearChat",
    reset: "ResetChannel",
    claim: "ClaimChannel",
    transfer: "TransferOwner",
    templates: "OpenTemplates",
    invite: "OpenInvite",
    knock: "OpenKnock"
};

/**
 * Every command that has a button on the control panel - `/voice` and `/knock`, which stands on its
 * own because it is not about the channel the member is in. `panel` is excluded: it opens the
 * interface those buttons are drawn on, so there is no one button that is its counterpart.
 */
const commandsWithAButton = (): ICommandDefinition[] =>
    getAllCommandDefinitions().filter( ( definition ) => (
        Boolean( BUTTON_TRANSITION_BY_COMMAND[ definition.name ] )
        || ( definition.flowTransition.startsWith( "VertixBot/Commands/Voice" ) && "panel" !== definition.name )
    ) );

interface ExportedFlow {
    name: string;
    states?: Array<{ key: string }>;
    transitions?: Array<{ from: string; to: string }>;
}

const readFlows = (): ExportedFlow[] => JSON.parse( fs.readFileSync(
    path.resolve( process.cwd(), "../../exports/ui/flows.json" ),
    "utf-8"
) ) as ExportedFlow[];

const readPanelTransitions = () => {
    const exported = readFlows();

    const panel = exported.find( ( flow ) => PANEL_FLOW === flow.name );

    if ( ! panel?.transitions ) {
        throw new Error( `Exported flow '${ PANEL_FLOW }' has no transitions - re-run the ui export` );
    }

    return Object.fromEntries(
        panel.transitions.map( ( transition ) => [ transition.from.split( "/" ).pop()!, transition.to ] )
    );
};

/** The flow half of a state key, which is everything before `/States/`. */
const flowOf = ( stateKey: string ) => stateKey.split( "/States/" )[ 0 ];

/**
 * Whether a command has an interface of its own rather than opening the button's.
 *
 * Asked of the two destinations rather than of the definition, because that is the thing that
 * actually differs - a migrated command names a state in a flow the button never reaches.
 */
const ownsItsInterface = ( commandTarget: string, buttonTarget: string ) =>
    flowOf( commandTarget ) !== flowOf( buttonTarget );

describe( "VertixBot/Commands/ButtonAgreement", () => {
    it( "should name a button for every subcommand that has one", () => {
        const named = Object.keys( BUTTON_TRANSITION_BY_COMMAND ).sort();

        const reachable = commandsWithAButton()
            .map( ( definition ) => definition.name )
            .sort();

        expect( named ).toEqual( reachable );
    } );

    it( "should send a command where its button sends a press, while it still shares the interface", () => {
        const byTransition = readPanelTransitions();

        const disagreements = commandsWithAButton().flatMap( ( definition ) => {
            const transition = BUTTON_TRANSITION_BY_COMMAND[ definition.name ];
            const buttonTarget = transition ? byTransition[ transition ] : undefined;

            if ( ! buttonTarget ) {
                return [ `${ definition.name }: no exported destination for its button` ];
            }

            // A command with an interface of its own is not expected to agree here, and cannot: the
            // button's edge stops at the springboard state its handler works from, which is exactly
            // the state a command has no use for. What that command names instead is checked below,
            // against the states its own adapter actually has.
            if ( ownsItsInterface( definition.flowTargetState, buttonTarget ) ) {
                return [];
            }

            return buttonTarget === definition.flowTargetState
                ? []
                : [ `${ definition.name }: command -> ${ definition.flowTargetState }, button -> ${ buttonTarget }` ];
        } );

        expect( disagreements ).toEqual( [] );
    } );

    /**
     * The one thing nothing else catches. These are strings: a state that does not exist resolves to
     * nothing rather than failing, so a command whose destination is misspelled - or whose state was
     * renamed out from under it - goes on working while the graph the dashboard draws points into
     * thin air.
     */
    it( "should send every command to a state that exists", () => {
        const flows = readFlows();

        const missing = getAllCommandDefinitions().flatMap( ( definition ) => {
            const flow = flows.find( ( candidate ) => candidate.name === flowOf( definition.flowTargetState ) );

            if ( ! flow ) {
                return [ `${ definition.name }: no flow '${ flowOf( definition.flowTargetState ) }'` ];
            }

            return flow.states?.some( ( state ) => state.key === definition.flowTargetState )
                ? []
                : [ `${ definition.name }: flow has no state '${ definition.flowTargetState }'` ];
        } );

        expect( missing ).toEqual( [] );
    } );
} );
