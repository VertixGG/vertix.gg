import {
    UIFlowBase,
    FlowIntegrationPointCommand,
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowData ,
    FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { VisualConnection } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

// Define state constants for clarity
const STATE_INITIAL = "VertixBot/CommandsFlow/States/Initial";
const STATE_UNKNOWN_COMMAND = "VertixBot/CommandsFlow/States/UnknownCommand";

// Simple data interface, might not be heavily used for this flow type
export interface CommandsFlowData extends UIFlowData {}

/**
 * A declarative flow definition mapping slash command names (as transitions)
 * to the initial states of the UI Flows they trigger.
 * This flow acts as a router for command interactions.
 */
export class CommandsFlow extends UIFlowBase<string, string, CommandsFlowData> {

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
            [ STATE_INITIAL ]: [
                // Naming convention: VertixBot/Commands/<CommandNameInPascalCase>
                "VertixBot/Commands/Setup",
                "VertixBot/Commands/Help",
                "VertixBot/Commands/Welcome",
                // "VertixBot/Commands/Ping", // Example if ping command existed and had a flow
            ],
            // Define transitions for the error state (if any needed, maybe allow restarting?)
            [ STATE_UNKNOWN_COMMAND ]: [] // No transitions out of error by default
        };
    }

    /**
     * Maps command transitions to the initial state of the target UI Flow.
     * This is the core routing logic. Ensure target flow names are correct.
     */
    public static getNextStates(): Record<string, string> {
        return {
            // Command Transition                         => Target UI Flow Initial State
            // IMPORTANT: Target flow initial state strings must be accurate!
            //            Assuming SetupFlow and HelpFlow will be created later.
            "VertixBot/Commands/Setup":   "VertixBot/UI-General/SetupFlow/States/Initial",    // Target: SetupFlow (To be created)
            "VertixBot/Commands/Help":    "VertixBot/UI-General/HelpFlow/States/Initial",     // Target: HelpFlow (To be created)
            "VertixBot/Commands/Welcome": "VertixBot/UI-General/WelcomeFlow/States/Initial",  // Target: WelcomeFlow (Existing)
            // "VertixBot/Commands/Ping":    "VertixBot/Misc/PingFlow/States/Initial",       // Example
        };
    }

    /**
     * Required data for command transitions (typically none needed just for dispatch).
     */
    public static getRequiredData(): Record<string, ( keyof CommandsFlowData )[]> {
        const commands = this.getFlowTransitions()[ STATE_INITIAL ] || [];
        const requiredData: Record<string, ( keyof CommandsFlowData )[]> = {};
        commands.forEach( cmdTransition => {
            requiredData[ cmdTransition ] = [];
        } );
        return requiredData;
    }

     /**
      * Utility method to easily get the target flow's initial state string for a command name.
      * Assumes command name matches the last part of the transition string (case-insensitive).
      * Returns undefined if the command name doesn't map to a known transition.
      */
     public static getTargetFlowInitialState( commandName: string ): string | undefined {
         const transitions = this.getFlowTransitions()[ STATE_INITIAL ] || [];
         // Find transition matching VertixBot/Commands/<CommandName>
         const commandTransition = transitions.find( t => {
             const parts = t.split( "/" );
             return parts.length > 0 && parts[ parts.length - 1 ].toLowerCase() === commandName.toLowerCase();
         } );

         return commandTransition ? this.getNextStates()[ commandTransition ] : undefined;
     }

    /**
     * Defines the handoff points from this command router flow.
     * Aligned with UIFlowBase structure. Uses FlowIntegrationPointCommand.
     */
    public static override getHandoffPoints(): FlowIntegrationPointBase[] {
        const handoffPoints: FlowIntegrationPointBase[] = [];
        const commandTransitions = this.getFlowTransitions()[ STATE_INITIAL ] || [];
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
                         sourceState: STATE_INITIAL,
                         targetState: targetState,
                         commandName: commandName,
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
    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [];
    }

    public static override getEdgeSourceMappings(): VisualConnection[] {
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
        return STATE_INITIAL;
    }

    protected override getInitialData(): CommandsFlowData {
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
         return CommandsFlow.getNextStates()[ transition ] ?? STATE_UNKNOWN_COMMAND;
    }

    // Required by base class, uses static definition
    public override getRequiredData( transition: string ): ( keyof CommandsFlowData )[] {
        return CommandsFlow.getRequiredData()[ transition ] || [];
    }

    // No modal associated with this flow type
    // protected showModal(): Promise<void> { // Base class doesn't define this
    //     return Promise.resolve();
    // }
}
