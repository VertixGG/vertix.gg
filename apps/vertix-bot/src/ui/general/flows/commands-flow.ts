import {
    UIFlowBase,
    FlowIntegrationPointCommand,
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { getAllCommandDefinitions } from "@vertix.gg/bot/src/commands/definitions";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type {
    UIFlowIntegrationPointBase
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIFlowVisualConnection, UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

const COMMANDS_FLOW_STATES = {
    INITIAL: "VertixBot/CommandsFlow/States/Initial",
    UNKNOWN_COMMAND: "VertixBot/CommandsFlow/States/UnknownCommand"
} as const;

/**
 * A declarative flow definition mapping slash command names (as transitions)
 * to the initial states of the UI Flows they trigger.
 * This flow acts as a router for command interactions.
 */
export class CommandsFlow extends UIFlowBase<string, string, UIFlowDataBase> {

    public static override getName(): string {
        // Using a more descriptive name for the flow itself
        return "VertixBot/UI-General/CommandsFlow";
    }

    // No UI components are directly associated with this dispatcher flow
    public static override getComponents() {
        return [];
    }

    /**
     * Overrides the base flow type to identify this as a system/router flow.
     */
    public static getFlowType(): "system" { // Explicitly system type
        return "system";
    }

    /**
     * Defines the known command transitions from the initial state.
     * Transitions should match the command names used in registration.
     */
    public static getFlowTransitions(): Record<string, string[]> {
        return {
            // Read off the command definitions rather than listed again here. A command that is
            // registered but missing from this router is a command the flow graph cannot show a
            // path to, and keeping one list meant keeping them from drifting by hand.
            [ COMMANDS_FLOW_STATES.INITIAL ]: getAllCommandDefinitions()
                .map( ( definition ) => definition.flowTransition ),

            // Nothing leads back out of an unknown command.
            [ COMMANDS_FLOW_STATES.UNKNOWN_COMMAND ]: []
        };
    }

    /**
     * Maps command transitions to the initial state of the target UI Flow.
     * This is the core routing logic. Ensure target flow names are correct.
     */
    public static getNextStates(): Record<string, string> {
        return Object.fromEntries(
            getAllCommandDefinitions().map(
                ( definition ) => [ definition.flowTransition, definition.flowTargetState ]
            )
        );
    }

    /**
     * Required data for command transitions (typically none needed just for dispatch).
     */
    public static getRequiredData(): Record<string, ( keyof UIFlowDataBase )[]> {
        const commands = this.getFlowTransitions()[ COMMANDS_FLOW_STATES.INITIAL ] || [];
        const requiredData: Record<string, ( keyof UIFlowDataBase )[]> = {};
        commands.forEach( cmdTransition => {
            requiredData[ cmdTransition ] = [];
        } );
        return requiredData;
    }

    /**
     * Defines the handoff points from this command router flow.
     * Aligned with UIFlowBase structure. Uses FlowIntegrationPointCommand.
     */
    public static override getHandoffPoints(): UIFlowIntegrationPointBase[] {
        const handoffPoints: UIFlowIntegrationPointBase[] = [];
        const commandTransitions = this.getFlowTransitions()[ COMMANDS_FLOW_STATES.INITIAL ] || [];
        const nextStates = this.getNextStates();

        commandTransitions.forEach( transition => {
            const targetState = nextStates[ transition ];
            if ( targetState ) {
                const flowNameParts = targetState.split( "/" );
                const commandName = transition.split( "/" ).pop();

                if ( flowNameParts.length >= 3 && commandName ) {
                    const targetFlowName = flowNameParts.slice( 0, -2 ).join( "/" );
                    handoffPoints.push( new FlowIntegrationPointCommand( {
                        flowName: targetFlowName,
                        description: `Handoff: ${ commandName }`,
                        transition: transition,
                        sourceState: COMMANDS_FLOW_STATES.INITIAL,
                        targetState: targetState,
                        requiredData: []
                    } ) );
                } else {
                    console.warn( `[CommandsFlow] Could not determine target flow name or command name from state: ${ targetState } for transition ${ transition }` );
                }
            }
        } );

        return handoffPoints;
    }

    /**
     * Defines entry points (none for this router flow).
     * Added for structural consistency with UIFlowBase.
     */
    public static override getEntryPoints(): UIFlowIntegrationPointBase[] {
        const transitions = this.getFlowTransitions()[ COMMANDS_FLOW_STATES.INITIAL ] || [];

        return transitions.map( ( transition ) => {
            const commandName = transition.split( "/" ).pop() ?? "Command";

            return new FlowIntegrationPointCommand( {
                flowName: this.getName(),
                description: `Slash command entry: ${ commandName }`,
                transition,
                targetState: COMMANDS_FLOW_STATES.INITIAL,
                requiredData: []
            } );
        } );
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        return [];
    }

    /**
     * Defines external references (none for this router flow).
     * Added for structural consistency.
     */
    public static override getExternalReferences(): Record<string, string> {
        return {};
    }

    // --- Instance Methods ---
    // Implementing required methods from UIFlowBase

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
        this.initializeTransitions();
    }

    // Provide default permissions (minimal needed for most interactions)
    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages );
    }

    // Provide default channel types
    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildText ];
    }

    // Get available transitions based on the current state (usually just the commands from Initial)
    public override getAvailableTransitions(): string[] {
        return CommandsFlow.getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    protected override getInitialState(): string {
        // Defines the single logical state for this router flow
        return COMMANDS_FLOW_STATES.INITIAL;
    }

    protected override getInitialData(): UIFlowDataBase {
        return {}; // No initial data needed for dispatch logic
    }

    // Standard implementation to load transitions from static definition
    protected override initializeTransitions(): void {
        Object.entries( CommandsFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.addTransitions( state, transitions );
        } );
    }

    // Standard implementation helper
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) {
            this.setTransitionsForState( state, new Set() );
        }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) {
            transitions.forEach( ( transition ) => {
                stateTransitions.add( transition );
            } );
            this.setTransitionsForState( state, stateTransitions );
        }
    }

    // Required by base class, uses static definition
    // Returns a defined error state if the transition is not found
    public override getNextState( transition: string ): string {
        return CommandsFlow.getNextStates()[ transition ] ?? COMMANDS_FLOW_STATES.UNKNOWN_COMMAND;
    }

    // Required by base class, uses static definition
    public override getRequiredData( transition: string ): ( keyof UIFlowDataBase )[] {
        return CommandsFlow.getRequiredData()[ transition ] || [];
    }
}
