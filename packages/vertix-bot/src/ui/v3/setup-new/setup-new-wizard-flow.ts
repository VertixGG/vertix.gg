import { UIFlowBase, FlowIntegrationPoint } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { ChannelType, PermissionsBitField } from "discord.js";

import { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup/setup-max-master-channels-embed";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { SetupStep1Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-1/setup-step-1-component";
import { SetupStep2Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-2/setup-step-2-component";
import { SetupStep3Component } from "@vertix.gg/bot/src/ui/v3/setup-new/step-3/setup-step-3-component";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

/**
 * Represents the possible states in the Setup Wizard flow
 */
export enum SetupWizardFlowState {
    INITIAL = "initial",
    STEP_1_NAME_TEMPLATE = "step_1_name_template",
    STEP_2_BUTTONS = "step_2_buttons",
    STEP_3_ROLES = "step_3_roles",
    COMPLETED = "completed",
    ERROR = "error",
}

/**
 * Represents the possible transitions in the Setup Wizard flow
 */
export enum SetupWizardFlowTransition {
    START_SETUP = "start_setup",
    SUBMIT_NAME_TEMPLATE = "submit_name_template",
    SELECT_BUTTONS = "select_buttons",
    SELECT_ROLES = "select_roles",
    FINISH_SETUP = "finish_setup",
    ERROR_OCCURRED = "error_occurred",
}

/**
 * Interface for Setup Wizard flow data
 */
export interface SetupWizardFlowData {
    // Step 1 data
    dynamicChannelNameTemplate?: string;

    // Step 2 data
    dynamicChannelButtonsTemplate?: string[];
    dynamicChannelMentionable?: boolean;
    dynamicChannelAutoSave?: boolean;

    // Step 3 data
    dynamicChannelVerifiedRoles?: string[];

    // Error data
    errorCode?: string;
    errorMessage?: string;

    // Cross-flow context data
    originFlow?: string;
    originState?: string;
    originTransition?: string;
    sourceButton?: string;
    wizardType?: string;

    // Index signature for UIFlowData compatibility
    [key: string]: unknown;
}

/**
 * Setup wizard flow implementation
 */
export class SetupWizardFlow extends UIFlowBase<SetupWizardFlowState, SetupWizardFlowTransition, SetupWizardFlowData> {
    /**
     * Get the name of this flow
     */
    public static getName() {
        return "Vertix/UI-V3/SetupNewWizardFlow";
    }

    /**
     * Get the component associated with this flow
     */
    public static getComponents() {
        return [ class SetupNewWizardComponent extends UIWizardComponentBase {
            public static getName() {
                return "Vertix/UI-V3/SetupNewWizardComponent";
            }

            public static getComponents() {
                return [ SetupStep1Component, SetupStep2Component, SetupStep3Component ];
            }

            public static getEmbedsGroups() {
                return [
                    // TODO: Find better way to do this.
                    ...super.getEmbedsGroups(),

                    UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
                    UIEmbedsGroupBase.createSingleGroup( SetupMaxMasterChannelsEmbed ),
                ];
            }
        } ];
    }

    /**
     * Returns the valid transitions for each state
     */
    public static getFlowTransitions(): Record<SetupWizardFlowState, SetupWizardFlowTransition[]> {
        return {
            [ SetupWizardFlowState.INITIAL ]: [ SetupWizardFlowTransition.START_SETUP ],
            [ SetupWizardFlowState.STEP_1_NAME_TEMPLATE ]: [
                SetupWizardFlowTransition.SUBMIT_NAME_TEMPLATE,
                SetupWizardFlowTransition.ERROR_OCCURRED,
            ],
            [ SetupWizardFlowState.STEP_2_BUTTONS ]: [
                SetupWizardFlowTransition.SELECT_BUTTONS,
                SetupWizardFlowTransition.ERROR_OCCURRED,
            ],
            [ SetupWizardFlowState.STEP_3_ROLES ]: [
                SetupWizardFlowTransition.SELECT_ROLES,
                SetupWizardFlowTransition.FINISH_SETUP,
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
        return {};
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

    public getAvailableTransitions(): SetupWizardFlowTransition[] {
        return SetupWizardFlow.getFlowTransitions()[ this.getCurrentState() ];
    }

    public getNextState( transition: SetupWizardFlowTransition ): SetupWizardFlowState {
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
