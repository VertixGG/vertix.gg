import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { WelcomeComponent } from "@vertix.gg/bot/src/ui/general/welcome/welcome-component";

import type { FlowIntegrationPoint } from "@vertix.gg/gui/src/bases/ui-flow-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

/**
 * Represents the possible states in the Welcome flow
 */
export enum WelcomeFlowState {
    INITIAL = "initial",
    SETUP_CLICKED = "setup_clicked",
    SUPPORT_CLICKED = "support_clicked",
    INVITE_CLICKED = "invite_clicked",
    LANGUAGE_SELECTED = "language_selected",
}

/**
 * Represents the possible transitions in the Welcome flow
 */
export enum WelcomeFlowTransition {
    CLICK_SETUP = "click_setup",
    CLICK_SUPPORT = "click_support",
    CLICK_INVITE = "click_invite",
    SELECT_LANGUAGE = "select_language",
}

/**
 * Interface for Welcome flow data
 */
export interface WelcomeFlowData {
    selectedLanguage?: string;

    // Index signature for UIFlowData compatibility
    [key: string]: unknown;
}

/**
 * Welcome flow implementation
 */
export class WelcomeFlow extends UIFlowBase<WelcomeFlowState, WelcomeFlowTransition, WelcomeFlowData> {
    /**
     * Get the name of this flow
     */
    public static getName(): string {
        return "VertixBot/UI-General/WelcomeFlow";
    }

    /**
     * Get the component associated with this flow
     */
    public static getComponents() {
        return [ WelcomeComponent ];
    }

    /**
     * Returns the valid transitions for each state in the Welcome flow
     */
    public static getFlowTransitions(): Record<WelcomeFlowState, WelcomeFlowTransition[]> {
        return {
            [ WelcomeFlowState.INITIAL ]: [
                WelcomeFlowTransition.CLICK_SETUP,
                WelcomeFlowTransition.CLICK_SUPPORT,
                WelcomeFlowTransition.CLICK_INVITE,
                WelcomeFlowTransition.SELECT_LANGUAGE,
            ],
            [ WelcomeFlowState.SETUP_CLICKED ]: [], // Terminal state - flow hands over to Setup Wizard
            [ WelcomeFlowState.SUPPORT_CLICKED ]: [],
            [ WelcomeFlowState.INVITE_CLICKED ]: [],
            [ WelcomeFlowState.LANGUAGE_SELECTED ]: [
                WelcomeFlowTransition.CLICK_SETUP,
                WelcomeFlowTransition.CLICK_SUPPORT,
                WelcomeFlowTransition.CLICK_INVITE,
            ],
        };
    }

    /**
     * Returns the next state for each transition
     */
    public static getNextStates(): Record<WelcomeFlowTransition, WelcomeFlowState> {
        return {
            [ WelcomeFlowTransition.CLICK_SETUP ]: WelcomeFlowState.SETUP_CLICKED,
            [ WelcomeFlowTransition.CLICK_SUPPORT ]: WelcomeFlowState.SUPPORT_CLICKED,
            [ WelcomeFlowTransition.CLICK_INVITE ]: WelcomeFlowState.INVITE_CLICKED,
            [ WelcomeFlowTransition.SELECT_LANGUAGE ]: WelcomeFlowState.LANGUAGE_SELECTED,
        };
    }

    /**
     * Returns the required data for each transition
     */
    public static getRequiredData(): Record<WelcomeFlowTransition, ( keyof WelcomeFlowData )[]> {
        return {
            [ WelcomeFlowTransition.CLICK_SETUP ]: [],
            [ WelcomeFlowTransition.CLICK_SUPPORT ]: [],
            [ WelcomeFlowTransition.CLICK_INVITE ]: [],
            [ WelcomeFlowTransition.SELECT_LANGUAGE ]: [ "selectedLanguage" ],
        };
    }

    /**
     * Returns documentation about handoff points in this flow
     */
    public static getHandoffPoints(): FlowIntegrationPoint[] {
        return [
            {
                flowName: "VertixBot/UI-V3/SetupNewWizardFlow",
                description: "Hands off to Setup Wizard when setup button is clicked",
                sourceState: WelcomeFlowState.SETUP_CLICKED,
                transition: WelcomeFlowTransition.CLICK_SETUP,
                requiredData: []
            }
        ];
    }

    /**
     * Returns external component references needed by this flow
     */
    public static getExternalReferences(): Record<string, string> {
        return {
            setupWizardFlow: "VertixBot/UI-V3/SetupNewWizardFlow",
            setupWizardAdapter: "VertixBot/UI-V3/SetupNewWizardAdapter",
            setupWizardEntryTransition: "START_SETUP"
        };
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel );
    }

    public getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    protected getInitialState(): WelcomeFlowState {
        return WelcomeFlowState.INITIAL;
    }

    protected getInitialData(): WelcomeFlowData {
        return {};
    }

    protected initializeTransitions(): void {
        // Initialize transitions based on static method
        Object.entries( WelcomeFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.addTransitions( state as WelcomeFlowState, transitions );
        } );
    }

    protected addTransitions( state: WelcomeFlowState, transitions: WelcomeFlowTransition[] ): void {
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

    public getAvailableTransitions(): WelcomeFlowTransition[] {
        return WelcomeFlow.getFlowTransitions()[ this.getCurrentState() ];
    }

    public getNextState( transition: WelcomeFlowTransition ): WelcomeFlowState {
        return WelcomeFlow.getNextStates()[ transition ];
    }

    public getRequiredData( transition: WelcomeFlowTransition ): ( keyof WelcomeFlowData )[] {
        return WelcomeFlow.getRequiredData()[ transition ];
    }

    protected showModal(): Promise<void> {
        // Implementation will depend on your modal system
        // For flow definition, just return a resolved promise
        return Promise.resolve();
    }
}
