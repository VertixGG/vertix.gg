import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

// Import target flow names
import { SetupNewWizardFlow } from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-flow";
import { LanguageFlow } from "@vertix.gg/bot/src/ui/general/language/language-flow";

// Import the component used by this flow
import { SetupComponent } from "@vertix.gg/bot/src/ui/general/setup/setup-component";

import type { UIFlowData ,
    FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { VisualConnection } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

const STATE_INITIAL = "VertixBot/UI-General/SetupFlow/States/Initial";
const STATE_DONE = "VertixBot/UI-General/SetupFlow/States/Done";

// Conceptual Transitions
const TRANSITION_CREATE_V3 = "VertixBot/UI-General/SetupFlow/Transitions/CreateV3";
const TRANSITION_EDIT_MASTER = "VertixBot/UI-General/SetupFlow/Transitions/EditMaster";
const TRANSITION_CHOOSE_LANGUAGE = "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage";

export interface SetupFlowData extends UIFlowData {}

export class SetupFlow extends UIFlowBase<string, string, SetupFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/SetupFlow";
    }
    public static override getComponents() { return [ SetupComponent ]; }

    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Setup",
                targetState: STATE_INITIAL,
                description: "Entry point triggered by CommandsFlow via Setup command"
            } )
        ];
    }

    // Define Handoff Points (Re-added LanguageFlow)
    public static override getHandoffPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: SetupNewWizardFlow.getName(),
                description: "Handoff to V3 Setup Wizard when Create V3 button is clicked",
                sourceState: STATE_INITIAL,
                transition: TRANSITION_CREATE_V3,
                requiredData: []
            } ),
            new FlowIntegrationPointGeneric( {
                flowName: LanguageFlow.getName(),
                description: "Handoff to Language selection flow",
                sourceState: STATE_INITIAL,
                transition: TRANSITION_CHOOSE_LANGUAGE,
                requiredData: []
            } )
            // Note: EditMaster handoff is complex due to select menu & adapter logic
        ];
    }

    // Define Visual Connections (Re-added LanguageFlow)
    public static override getEdgeSourceMappings(): VisualConnection[] {
        return [
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterCreateV3Button",
                transitionName: TRANSITION_CREATE_V3,
                targetFlowName: SetupNewWizardFlow.getName()
            },
            {
                triggeringElementId: "VertixBot/UI-General/LanguageChooseButton",
                transitionName: TRANSITION_CHOOSE_LANGUAGE,
                targetFlowName: LanguageFlow.getName()
            }
            // Note: SetupMasterEditSelectMenu is harder to represent visually
        ];
    }

    public override getPermissions(): PermissionsBitField { return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages ); }
    public override getChannelTypes(): ChannelType[] { return [ ChannelType.GuildText ]; }
    protected override getInitialState(): string { return STATE_INITIAL; }
    protected override getInitialData(): SetupFlowData { return {}; }

    protected override initializeTransitions(): void {
        this.addTransitions( STATE_INITIAL, [
            TRANSITION_CREATE_V3,
            TRANSITION_EDIT_MASTER,
            TRANSITION_CHOOSE_LANGUAGE
        ] );
    }

    public override getAvailableTransitions(): string[] { return Array.from( this.getTransitionsForState( this.getCurrentState() ) || [] ); }
    public override getNextState( _transition: string ): string { return STATE_DONE; }
    public override getRequiredData( _transition: string ): ( keyof SetupFlowData )[] { return []; }
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) { this.setTransitionsForState( state, new Set() ); }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) { transitions.forEach( ( transition ) => stateTransitions.add( transition ) ); this.setTransitionsForState( state, stateTransitions ); }
    }
}
