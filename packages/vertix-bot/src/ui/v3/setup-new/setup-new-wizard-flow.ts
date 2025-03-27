import { UIWizardFlowBase, WizardFlowState, WizardFlowTransition } from "@vertix.gg/gui/src/bases/ui-wizard-flow-base";

import { ChannelType, PermissionsBitField } from "discord.js";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup/setup-max-master-channels-embed";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { SetupStep1Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-1/setup-step-1-component";
import { SetupStep2Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-2/setup-step-2-component";
import { SetupStep3Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-3/setup-step-3-component";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import type { WizardFlowData } from "@vertix.gg/gui/src/bases/ui-wizard-flow-base";

import type { FlowIntegrationPoint } from "@vertix.gg/gui/src/bases/ui-flow-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Represents the possible states in the Setup Wizard flow
 */
export enum SetupWizardFlowState {
    INITIAL = WizardFlowState.INITIAL,
    STEP_1_NAME_TEMPLATE = "step_1_name_template",
    STEP_2_BUTTONS = "step_2_buttons",
    STEP_3_ROLES = "step_3_roles",
    COMPLETED = WizardFlowState.COMPLETED,
    ERROR = WizardFlowState.ERROR,
}

/**
 * Represents the possible transitions in the Setup Wizard flow
 */
export enum SetupWizardFlowTransition {
    START_SETUP = WizardFlowTransition.START,
    SUBMIT_NAME_TEMPLATE = "submit_name_template",
    SELECT_BUTTONS = "select_buttons",
    SELECT_ROLES = "select_roles",
    FINISH_SETUP = WizardFlowTransition.FINISH,
    ERROR_OCCURRED = WizardFlowTransition.ERROR,
    BACK = WizardFlowTransition.BACK,
    NEXT = WizardFlowTransition.NEXT,
}

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

    // Cross-flow context data
    wizardType?: string;
}

/**
 * Setup wizard flow implementation
 */
export class SetupWizardFlow extends UIWizardFlowBase<SetupWizardFlowState, SetupWizardFlowTransition, SetupWizardFlowData> {
    /**
     * Get the name of this flow
     */
    public static getName() {
        return "Vertix/UI-V3/SetupNewWizardFlow";
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
     * Returns the valid transitions for each state
     */
    public static getFlowTransitions(): Record<SetupWizardFlowState, SetupWizardFlowTransition[]> {
        return {
            [ SetupWizardFlowState.INITIAL ]: [ SetupWizardFlowTransition.START_SETUP ],
            [ SetupWizardFlowState.STEP_1_NAME_TEMPLATE ]: [
                SetupWizardFlowTransition.SUBMIT_NAME_TEMPLATE,
                SetupWizardFlowTransition.NEXT,
                SetupWizardFlowTransition.ERROR_OCCURRED,
            ],
            [ SetupWizardFlowState.STEP_2_BUTTONS ]: [
                SetupWizardFlowTransition.SELECT_BUTTONS,
                SetupWizardFlowTransition.NEXT,
                SetupWizardFlowTransition.BACK,
                SetupWizardFlowTransition.ERROR_OCCURRED,
            ],
            [ SetupWizardFlowState.STEP_3_ROLES ]: [
                SetupWizardFlowTransition.SELECT_ROLES,
                SetupWizardFlowTransition.FINISH_SETUP,
                SetupWizardFlowTransition.BACK,
                SetupWizardFlowTransition.ERROR_OCCURRED,
            ],
            [ SetupWizardFlowState.COMPLETED ]: [],
            [ SetupWizardFlowState.ERROR ]: [ SetupWizardFlowTransition.START_SETUP ],
        };
    }

    /**
     * Returns the next state for each transition
     */
    public static getNextStates(): Record<SetupWizardFlowTransition, SetupWizardFlowState> {
        return {
            [ SetupWizardFlowTransition.START_SETUP ]: SetupWizardFlowState.STEP_1_NAME_TEMPLATE,
            [ SetupWizardFlowTransition.SUBMIT_NAME_TEMPLATE ]: SetupWizardFlowState.STEP_2_BUTTONS,
            [ SetupWizardFlowTransition.SELECT_BUTTONS ]: SetupWizardFlowState.STEP_3_ROLES,
            [ SetupWizardFlowTransition.SELECT_ROLES ]: SetupWizardFlowState.STEP_3_ROLES,
            [ SetupWizardFlowTransition.FINISH_SETUP ]: SetupWizardFlowState.COMPLETED,
            [ SetupWizardFlowTransition.ERROR_OCCURRED ]: SetupWizardFlowState.ERROR,
            [ SetupWizardFlowTransition.NEXT ]: SetupWizardFlowState.STEP_2_BUTTONS, // Will be overridden by step-specific logic
            [ SetupWizardFlowTransition.BACK ]: SetupWizardFlowState.STEP_1_NAME_TEMPLATE, // Will be overridden by step-specific logic
        };
    }

    /**
     * Returns the required data for each transition
     */
    public static getRequiredData(): Record<SetupWizardFlowTransition, ( keyof SetupWizardFlowData )[]> {
        return {
            [ SetupWizardFlowTransition.START_SETUP ]: [],
            [ SetupWizardFlowTransition.SUBMIT_NAME_TEMPLATE ]: [ "dynamicChannelNameTemplate" ],
            [ SetupWizardFlowTransition.SELECT_BUTTONS ]: [ "dynamicChannelButtonsTemplate" ],
            [ SetupWizardFlowTransition.SELECT_ROLES ]: [ "dynamicChannelVerifiedRoles" ],
            [ SetupWizardFlowTransition.FINISH_SETUP ]: [
                "dynamicChannelNameTemplate",
                "dynamicChannelButtonsTemplate",
                "dynamicChannelVerifiedRoles",
            ],
            [ SetupWizardFlowTransition.ERROR_OCCURRED ]: [ "errorCode", "errorMessage" ],
            [ SetupWizardFlowTransition.NEXT ]: [],
            [ SetupWizardFlowTransition.BACK ]: [],
        };
    }

    /**
     * Returns entry point documentation
     */
    public static getEntryPoints(): FlowIntegrationPoint[] {
        return [
            {
                flowName: "VertixBot/UI-General/WelcomeFlow",
                description: "Entry point from Welcome flow when setup button is clicked",
                sourceState: "SETUP_CLICKED",
                targetState: SetupWizardFlowState.INITIAL,
                transition: SetupWizardFlowTransition.START_SETUP,
                requiredData: [ "originFlow", "originState", "originTransition", "sourceButton" ]
            }
        ];
    }

    /**
     * Returns external component references
     */
    public static getExternalReferences(): Record<string, string> {
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
    public getStepComponents(): UIComponentConstructor[] {
        return [ SetupStep1Component, SetupStep2Component, SetupStep3Component ];
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    protected getInitialState(): SetupWizardFlowState {
        return SetupWizardFlowState.INITIAL;
    }

    protected getInitialData(): SetupWizardFlowData {
        return {
            currentStep: 0,
            totalSteps: this.getStepComponents().length,
            stepHistory: []
        };
    }

    protected initializeTransitions(): void {
        // Initialize transitions based on static method
        Object.entries( SetupWizardFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.addTransitions( state as SetupWizardFlowState, transitions );
        } );
    }

    protected addTransitions( state: SetupWizardFlowState, transitions: SetupWizardFlowTransition[] ): void {
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
     * Override to handle step-specific transitions
     */
    public getNextState( transition: SetupWizardFlowTransition ): SetupWizardFlowState {
        const data = this.getData();

        // Handle standard wizard navigation
        if ( transition === SetupWizardFlowTransition.NEXT ) {
            const currentStep = data.currentStep || 0;

            // Map steps to states
            const stepStates = [
                SetupWizardFlowState.STEP_1_NAME_TEMPLATE,
                SetupWizardFlowState.STEP_2_BUTTONS,
                SetupWizardFlowState.STEP_3_ROLES,
            ];

            // Get next state based on current step
            return stepStates[ Math.min( currentStep + 1, stepStates.length - 1 ) ];
        }

        if ( transition === SetupWizardFlowTransition.BACK ) {
            const currentStep = data.currentStep || 0;

            // Map steps to states
            const stepStates = [
                SetupWizardFlowState.STEP_1_NAME_TEMPLATE,
                SetupWizardFlowState.STEP_2_BUTTONS,
                SetupWizardFlowState.STEP_3_ROLES,
            ];

            // Get previous state based on current step
            return stepStates[ Math.max( currentStep - 1, 0 ) ];
        }

        // Use static mapping for other transitions
        return SetupWizardFlow.getNextStates()[ transition ];
    }

    public getRequiredData( transition: SetupWizardFlowTransition ): ( keyof SetupWizardFlowData )[] {
        return SetupWizardFlow.getRequiredData()[ transition ];
    }

    protected showModal(): Promise<void> {
        // Implementation will depend on your modal system
        // For flow definition, just return a resolved promise
        return Promise.resolve();
    }
}
