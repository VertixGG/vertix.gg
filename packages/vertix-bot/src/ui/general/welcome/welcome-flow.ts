import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { WelcomeComponent } from "@vertix.gg/bot/src/ui/general/welcome/welcome-component";

import type { FlowIntegrationPoint } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { VisualConnection } from "vertix-flow/src/features/flow-editor/types/flow";

/**
 * Interface for Welcome flow data
 */
export interface WelcomeFlowData {
    selectedLanguage?: string;

    // Index signature for UIFlowData compatibility
    [key: string]: unknown;
}

/**
 * Welcome flow implementation using string identifiers
 */
export class WelcomeFlow extends UIFlowBase<string, string, WelcomeFlowData> {
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
     * Returns the valid transitions for each state using string identifiers
     */
    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-General/WelcomeFlow/States/Initial": [
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport",
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite",
                "VertixBot/UI-General/WelcomeFlow/Transitions/SelectLanguage",
            ],
            "VertixBot/UI-General/WelcomeFlow/States/SetupClicked": [],
            "VertixBot/UI-General/WelcomeFlow/States/SupportClicked": [],
            "VertixBot/UI-General/WelcomeFlow/States/InviteClicked": [],
            "VertixBot/UI-General/WelcomeFlow/States/LanguageSelected": [
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport",
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite",
            ],
        };
    }

    /**
     * Returns the next state for each transition using string identifiers
     */
    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup": "VertixBot/UI-General/WelcomeFlow/States/SetupClicked",
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport": "VertixBot/UI-General/WelcomeFlow/States/SupportClicked",
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite": "VertixBot/UI-General/WelcomeFlow/States/InviteClicked",
            "VertixBot/UI-General/WelcomeFlow/Transitions/SelectLanguage": "VertixBot/UI-General/WelcomeFlow/States/LanguageSelected",
        };
    }

    /**
     * Returns the required data for each transition
     */
    public static getRequiredData(): Record<string, ( keyof WelcomeFlowData )[]> {
        return {
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup": [],
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport": [],
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite": [],
            "VertixBot/UI-General/WelcomeFlow/Transitions/SelectLanguage": [ "selectedLanguage" ],
        };
    }

    /**
     * Returns documentation about handoff points using string identifiers
     */
    public static getHandoffPoints(): FlowIntegrationPoint[] {
        return [
            {
                flowName: "VertixBot/UI-V3/SetupNewWizardFlow",
                description: "Hands off to Setup Wizard when setup button is clicked",
                sourceState: "VertixBot/UI-General/WelcomeFlow/States/SetupClicked",
                transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                requiredData: []
            }
        ];
    }

    /**
     * NEW: Defines visual connections for the editor.
     */
    public static getVisualConnections(): VisualConnection[] {
        return [
            {
                // This ID needs to match how the button is identified in the component schema/diagram generator
                triggeringElementId: "VertixBot/UI-General/WelcomeSetupButton",
                transitionName: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                targetFlowName: "VertixBot/UI-V3/SetupNewWizardFlow"
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
            setupWizardEntryTransition: "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/StartSetup"
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

    protected getInitialState(): string {
        return "VertixBot/UI-General/WelcomeFlow/States/Initial";
    }

    protected getInitialData(): WelcomeFlowData {
        return {};
    }

    protected initializeTransitions(): void {
        Object.entries( WelcomeFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.addTransitions( state, transitions );
        } );
    }

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

    public getAvailableTransitions(): string[] {
        return WelcomeFlow.getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    public getNextState( transition: string ): string {
        return WelcomeFlow.getNextStates()[ transition ];
    }

    public getRequiredData( transition: string ): ( keyof WelcomeFlowData )[] {
        return WelcomeFlow.getRequiredData()[ transition ];
    }

    protected showModal(): Promise<void> {
        return Promise.resolve();
    }
}
