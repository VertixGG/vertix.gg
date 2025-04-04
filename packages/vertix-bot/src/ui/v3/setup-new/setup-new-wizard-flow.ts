import {
    UIWizardFlowBase,
} from "@vertix.gg/gui/src/bases/ui-wizard-flow-base";

// Import the integration point classes from their correct location
import {
    FlowIntegrationPointBase,
    FlowIntegrationPointStandard
} from "@vertix.gg/gui/src/bases/ui-flow-base";

import { ChannelType, PermissionsBitField } from "discord.js";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup/setup-max-master-channels-embed";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { SetupStep1Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-1/setup-step-1-component";
import { SetupStep2Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-2/setup-step-2-component";
import { SetupStep3Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-3/setup-step-3-component";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import type { WizardFlowData } from "@vertix.gg/gui/src/bases/ui-wizard-flow-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Interface for Setup Wizard flow data
 */
export interface SetupWizardFlowData extends WizardFlowData {
    // Step 1 data
    dynamicChannelNameTemplate?: string;

    // Step 2 data
    dynamicChannelButtonsTemplate?: string[];
    dynamicChannelMentionable?: boolean;
    dynamicChannelAutoSave?: boolean;

    // Step 3 data
    dynamicChannelVerifiedRoles?: string[];
    dynamicChannelIncludeEveryoneRole?: boolean;

    // Cross-flow context data
    wizardType?: string;
}

/**
 * Setup wizard flow implementation using string identifiers
 */
export class SetupNewWizardFlow extends UIWizardFlowBase<string, string, SetupWizardFlowData> {
    /**
     * Get the name of this flow
     */
    public static getName() {
        return "VertixBot/UI-V3/SetupNewWizardFlow";
    }

    /**
     * Get embed groups for this flow
     */
    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SetupMaxMasterChannelsEmbed ),
        ];
    }

    /**
     * Returns the valid transitions for each state using string identifiers
     */
    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixGUI/UIWizardFlowBase/States/Initial": [ "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/StartSetup" ],
            "VertixBot/UI-V3/SetupNewWizardFlow/States/Step1NameTemplate": [
                "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SubmitNameTemplate",
                "VertixGUI/UIWizardFlowBase/Transitions/Next",
                "VertixGUI/UIWizardFlowBase/Transitions/Error",
                "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateNameTemplateModal",
            ],
            "VertixBot/UI-V3/SetupNewWizardFlow/States/Step2Buttons": [
                "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SelectButtons",
                "VertixGUI/UIWizardFlowBase/Transitions/Next",
                "VertixGUI/UIWizardFlowBase/Transitions/Back",
                "VertixGUI/UIWizardFlowBase/Transitions/Error",
                "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateConfigExtras",
            ],
            "VertixBot/UI-V3/SetupNewWizardFlow/States/Step3Roles": [
                "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SelectRoles",
                "VertixGUI/UIWizardFlowBase/Transitions/Finish",
                "VertixGUI/UIWizardFlowBase/Transitions/Back",
                "VertixGUI/UIWizardFlowBase/Transitions/Error",
                "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateVerifiedEveryone",
            ],
            "VertixGUI/UIWizardFlowBase/States/Completed": [],
            "VertixGUI/UIWizardFlowBase/States/Error": [ "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/StartSetup" ],
        };
    }

    /**
     * Returns the next state for each transition using string identifiers
     */
    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/StartSetup": "VertixBot/UI-V3/SetupNewWizardFlow/States/Step1NameTemplate",
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SubmitNameTemplate": "VertixBot/UI-V3/SetupNewWizardFlow/States/Step2Buttons",
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SelectButtons": "VertixBot/UI-V3/SetupNewWizardFlow/States/Step2Buttons",
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SelectRoles": "VertixBot/UI-V3/SetupNewWizardFlow/States/Step3Roles",
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateNameTemplateModal": "VertixBot/UI-V3/SetupNewWizardFlow/States/Step1NameTemplate",
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateConfigExtras": "VertixBot/UI-V3/SetupNewWizardFlow/States/Step2Buttons",
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateVerifiedEveryone": "VertixBot/UI-V3/SetupNewWizardFlow/States/Step3Roles",
            [ "VertixGUI/UIWizardFlowBase/Transitions/Finish" ]: "VertixGUI/UIWizardFlowBase/States/Completed",
            [ "VertixGUI/UIWizardFlowBase/Transitions/Error" ]: "VertixGUI/UIWizardFlowBase/States/Error",
            [ "VertixGUI/UIWizardFlowBase/Transitions/Next" ]: "VertixBot/UI-V3/SetupNewWizardFlow/States/Step2Buttons",
            [ "VertixGUI/UIWizardFlowBase/Transitions/Back" ]: "VertixBot/UI-V3/SetupNewWizardFlow/States/Step1NameTemplate",
        };
    }

    /**
     * Returns the required data for each transition (keys remain the same)
     */
    public static getRequiredData(): Record<string, ( keyof SetupWizardFlowData )[]> {
        return {
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/StartSetup": [],
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SubmitNameTemplate": [ "dynamicChannelNameTemplate" ],
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SelectButtons": [ "dynamicChannelButtonsTemplate" ],
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SelectRoles": [ "dynamicChannelVerifiedRoles" ],
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateNameTemplateModal": [ "dynamicChannelNameTemplate" ],
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateConfigExtras": [ "dynamicChannelMentionable", "dynamicChannelAutoSave" ],
            "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/UpdateVerifiedEveryone": [ "dynamicChannelIncludeEveryoneRole" ],
            [ "VertixGUI/UIWizardFlowBase/Transitions/Finish" ]: [
                "dynamicChannelNameTemplate",
                "dynamicChannelButtonsTemplate",
                "dynamicChannelVerifiedRoles",
            ],
            [ "VertixGUI/UIWizardFlowBase/Transitions/Error" ]: [ "errorCode", "errorMessage" ],
            [ "VertixGUI/UIWizardFlowBase/Transitions/Next" ]: [],
            [ "VertixGUI/UIWizardFlowBase/Transitions/Back" ]: [],
        };
    }

    /**
     * Returns entry point documentation using the new class structure
     */
    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            // Instantiate FlowIntegrationPointStandard
            new FlowIntegrationPointStandard( {
                flowName: "VertixBot/UI-General/WelcomeFlow",
                description: "Entry point from Welcome flow when setup button is clicked",
                sourceState: "VertixBot/UI-General/WelcomeFlow/States/SetupClicked",
                targetState: "VertixGUI/UIWizardFlowBase/States/Initial",
                transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                requiredData: [ "originFlow", "originState", "originTransition", "sourceButton" ]
            } )
        ];
    }

    /**
     * Returns external component references (already strings)
     */
    public static override getExternalReferences(): Record<string, string> {
        return {
            welcomeFlow: "VertixBot/UI-General/WelcomeFlow",
            welcomeAdapter: "VertixBot/UI-General/WelcomeAdapter",
            masterChannelService: "Vertix/Services/MasterChannelService"
        };
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    /**
     * Implementation of getStepComponents for UIWizardFlowBase
     */
    public override getStepComponents(): UIComponentConstructor[] {
        return [ SetupStep1Component, SetupStep2Component, SetupStep3Component ];
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
    }

    public override getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    protected override getInitialState(): string {
        return "VertixGUI/UIWizardFlowBase/States/Initial";
    }

    protected override getInitialData(): SetupWizardFlowData {
        return {
            currentStep: 0,
            totalSteps: this.getStepComponents().length,
            stepHistory: []
        };
    }

    protected override initializeTransitions(): void {
        Object.entries( SetupNewWizardFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
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

    /**
     * Override to handle step-specific transitions using string identifiers
     */
    public override getNextState( transition: string ): string {
        const data = this.getData();

        // Use full string literals for comparison
        if ( transition === "VertixGUI/UIWizardFlowBase/Transitions/Next" ) {
            const currentStep = data.currentStep || 0;
            const stepStates = [
                "VertixBot/UI-V3/SetupNewWizardFlow/States/Step1NameTemplate",
                "VertixBot/UI-V3/SetupNewWizardFlow/States/Step2Buttons",
                "VertixBot/UI-V3/SetupNewWizardFlow/States/Step3Roles",
            ];
            return stepStates[ Math.min( currentStep + 1, stepStates.length - 1 ) ];
        }

        if ( transition === "VertixGUI/UIWizardFlowBase/Transitions/Back" ) {
            const currentStep = data.currentStep || 0;
            const stepStates = [
                "VertixBot/UI-V3/SetupNewWizardFlow/States/Step1NameTemplate",
                "VertixBot/UI-V3/SetupNewWizardFlow/States/Step2Buttons",
                "VertixBot/UI-V3/SetupNewWizardFlow/States/Step3Roles",
            ];
            return stepStates[ Math.max( currentStep - 1, 0 ) ];
        }

        return SetupNewWizardFlow.getNextStates()[ transition ];
    }

    public override getRequiredData( transition: string ): ( keyof SetupWizardFlowData )[] {
        return SetupNewWizardFlow.getRequiredData()[ transition ];
    }

    // protected override showModal(): Promise<void> { // Base class may not define this, or it might not need override
    //     // Implementation will depend on your modal system
    //     return Promise.resolve();
    // }
}
