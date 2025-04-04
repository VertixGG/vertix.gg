import {
    UIFlowBase,
    FlowIntegrationPointStandard
} from "@vertix.gg/gui/src/bases/ui-flow-base";

import { PermissionsBitField } from "discord.js";

import type { ChannelType } from "discord.js";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowData ,
    FlowIntegrationPointBase
} from "@vertix.gg/gui/src/bases/ui-flow-base";

// --- Define Constants ---
const STATE_INITIAL = "VertixBot/UI-General/GuildFlow/States/Initial";
const TRANSITION_ON_JOIN = "VertixBot/GuildEvents/VertixOnJoin";
// Target state from WelcomeFlow (ensure this is correct)
const TARGET_WELCOME_INITIAL = "VertixBot/UI-General/WelcomeFlow/States/Initial";
// --- End Constants ---

// Minimal data interface for this system flow
export interface GuildFlowData extends UIFlowData {}

/**
 * A system flow that handles the bot joining a new guild
 * and triggers the WelcomeFlow.
 */
export class GuildFlow extends UIFlowBase<string, string, GuildFlowData> {

    public static override getName(): string {
        return "VertixBot/UI-General/GuildFlow";
    }

    public static override getComponents() {
        return [];
    }

    public static override getFlowType(): "system" {
        return "system";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            [ STATE_INITIAL ]: [ TRANSITION_ON_JOIN ],
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            [ TRANSITION_ON_JOIN ]: TARGET_WELCOME_INITIAL,
        };
    }

    public static getRequiredData(): Record<string, ( keyof GuildFlowData )[]> {
        return {
            [ TRANSITION_ON_JOIN ]: [],
        };
    }

    /**
     * Entry point representing the external guild join event.
     */
    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointStandard( {
                flowName: "System/GuildEvents", // Conceptual source
                description: "Entry point triggered when bot joins a guild.",
                transition: TRANSITION_ON_JOIN, // The event itself is the transition *into* this flow
                targetState: STATE_INITIAL
                // sourceState is not applicable here as it's an external event
            } )
        ];
    }

    /**
     * Handoff point to the WelcomeFlow.
     */
    public static override getHandoffPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointStandard( {
                flowName: "VertixBot/UI-General/WelcomeFlow", // Target Flow Name
                description: "Handoff to WelcomeFlow after bot joins.",
                sourceState: STATE_INITIAL, // State within THIS flow
                transition: TRANSITION_ON_JOIN, // Transition within THIS flow
                targetState: TARGET_WELCOME_INITIAL, // Target state in WelcomeFlow
                eventName: TRANSITION_ON_JOIN // Use the full namespaced transition string
            } )
        ];
    }

    // --- Instance Methods ---

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
        // Removed transition initialization from constructor
    }

    // Add the required initializeTransitions method
    protected override initializeTransitions(): void {
        Object.entries( GuildFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.addTransitions( state, transitions );
        } );
    }

    // Minimal permissions needed, likely none for system event reaction
    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField();
    }

    // Not applicable for guild join event itself
    public override getChannelTypes(): ChannelType[] {
        return [];
    }

    public override getAvailableTransitions(): string[] {
        return GuildFlow.getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    public override getNextState( transition: string ): string {
        // Basic next state logic, assumes valid transition
        return GuildFlow.getNextStates()[ transition ] ?? STATE_INITIAL; // Fallback to initial
    }

    public override getRequiredData( transition: string ): ( keyof GuildFlowData )[] {
        return GuildFlow.getRequiredData()[ transition ] || [];
    }

    protected override getInitialState(): string {
        return STATE_INITIAL;
    }

    protected override getInitialData(): GuildFlowData {
        return {};
    }

    // Helper to add transitions (could be moved to base class if used often)
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) {
            this.setTransitionsForState( state, new Set() );
        }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) {
            transitions.forEach( ( transition ) => stateTransitions.add( transition ) );
            this.setTransitionsForState( state, stateTransitions );
        }
    }
}
