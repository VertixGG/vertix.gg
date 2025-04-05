import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import type { UIFlowData ,
    FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions as _TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

// Define initial state
const STATE_INITIAL = "VertixBot/UI-General/LanguageFlow/States/Initial";
const STATE_LANGUAGE_SELECTED = "VertixBot/UI-General/LanguageFlow/States/LanguageSelected"; // Example state

// Define conceptual transitions
const TRANSITION_SELECT_LANGUAGE = "VertixBot/UI-General/LanguageFlow/Transitions/SelectLanguage";

export interface LanguageFlowData extends UIFlowData {
    selectedLanguage?: string; // Example data field
}

export class LanguageFlow extends UIFlowBase<string, string, LanguageFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/LanguageFlow";
    }

    // If there's a specific LanguageComponent, add it here
    public static override getComponents() { return []; }

    // Define entry points if this flow can be started from others
    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/SetupFlow", // Example entry from SetupFlow
                transition: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                targetState: STATE_INITIAL,
                description: "Entry point triggered by SetupFlow via Choose Language button"
            } )
        ];
    }

    // Define handoff points if this flow leads to others
    public static override getHandoffPoints(): FlowIntegrationPointBase[] {
        // Example: Handoff back to SetupFlow after selection?
        // return [
        //     new FlowIntegrationPointGeneric( {
        //         flowName: "VertixBot/UI-General/SetupFlow",
        //         description: "Return to Setup after language selection",
        //         sourceState: STATE_LANGUAGE_SELECTED,
        //         transition: TRANSITION_SELECT_LANGUAGE, // Or a different transition like "ConfirmLanguage"
        //         targetState: "VertixBot/UI-General/SetupFlow/States/Initial" // Target state in SetupFlow
        //     } )
        // ];
        return []; // Default to no handoffs
    }

    // Define visual connections if needed
    // public static override getVisualConnections(): VisualConnection[] { return []; }

    // Define required permissions
    public override getPermissions(): PermissionsBitField { return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages ); }

    // Define supported channel types
    public override getChannelTypes(): ChannelType[] { return [ ChannelType.GuildText ]; }

    protected override getInitialState(): string { return STATE_INITIAL; }
    protected override getInitialData(): LanguageFlowData { return {}; }

    protected override initializeTransitions(): void {
        this.addTransitions( STATE_INITIAL, [ TRANSITION_SELECT_LANGUAGE ] );
        this.addTransitions( STATE_LANGUAGE_SELECTED, [] ); // Example: No transitions from selected state initially
    }

    public override getAvailableTransitions(): string[] { return Array.from( this.getTransitionsForState( this.getCurrentState() ) || [] ); }

    // Define how transitions change state
    public override getNextState( transition: string ): string {
        switch ( transition ) {
            case TRANSITION_SELECT_LANGUAGE:
                return STATE_LANGUAGE_SELECTED;
            default:
                return this.getCurrentState(); // Stay in current state if transition unknown
        }
    }

    // Define required data for transitions
    public override getRequiredData( transition: string ): ( keyof LanguageFlowData )[] {
        switch ( transition ) {
            case TRANSITION_SELECT_LANGUAGE:
                return [ "selectedLanguage" ]; // Example: Require language selection
            default:
                return [];
        }
    }

    // Helper method from base class
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) { this.setTransitionsForState( state, new Set() ); }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) { transitions.forEach( ( transition ) => stateTransitions.add( transition ) ); this.setTransitionsForState( state, stateTransitions ); }
    }
}
