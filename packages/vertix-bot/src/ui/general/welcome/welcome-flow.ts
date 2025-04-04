import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { WelcomeComponent } from "@vertix.gg/bot/src/ui/general/welcome/welcome-component";
import { SetupNewWizardFlow } from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-flow";

import type { UIFlowData ,
    FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { VisualConnection } from "vertix-flow/src/features/flow-editor/types/flow";

/**
 * Interface for Welcome flow data
 */
export interface WelcomeFlowData extends UIFlowData {
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
     * Returns documentation about handoff points using the new class structure
     */
    public static override getHandoffPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: SetupNewWizardFlow.getName(),
                description: "Hands off to Setup Wizard when setup button is clicked",
                sourceState: "VertixBot/UI-General/WelcomeFlow/States/SetupClicked",
                transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                requiredData: []
            } )
        ];
    }

    /**
     * NEW: Defines visual connections for the editor.
     */
    public static override getVisualConnections(): VisualConnection[] {
        return [
            {
                triggeringElementId: "VertixBot/UI-General/WelcomeSetupButton",
                transitionName: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                targetFlowName: "VertixBot/UI-V3/SetupNewWizardFlow"
            }
        ];
    }

    /**
     * Returns external component references needed by this flow
     */
    public static override getExternalReferences(): Record<string, string> {
        return {
            setupWizardFlow: "VertixBot/UI-V3/SetupNewWizardFlow",
            setupWizardAdapter: "VertixBot/UI-V3/SetupNewWizardAdapter",
            setupWizardEntryTransition: "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/StartSetup"
        };
    }

    /**
     * Returns entry points using the new class structure
     */
    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Welcome",
                targetState: "VertixBot/UI-General/WelcomeFlow/States/Initial",
                description: "Entry point triggered by CommandsFlow via Welcome command"
            } )
        ];
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel );
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    protected override getInitialState(): string {
        return "VertixBot/UI-General/WelcomeFlow/States/Initial";
    }

    protected override getInitialData(): WelcomeFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
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

    public override getAvailableTransitions(): string[] {
        return WelcomeFlow.getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    public override getNextState( transition: string ): string {
        return WelcomeFlow.getNextStates()[ transition ];
    }

    public override getRequiredData( transition: string ): ( keyof WelcomeFlowData )[] {
        return WelcomeFlow.getRequiredData()[ transition ];
    }

    // showModal might not exist in the base or might not need override
    // protected showModal(): Promise<void> {
    //     return Promise.resolve();
    // }
}
