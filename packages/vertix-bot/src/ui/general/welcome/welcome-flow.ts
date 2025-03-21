import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import { PermissionsBitField, PermissionFlagsBits, ChannelType } from "discord.js";
import { WelcomeComponent } from "./welcome-component";

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
 * Defines the valid state transitions for the Welcome flow
 */
export const WELCOME_FLOW_TRANSITIONS: Record<WelcomeFlowState, WelcomeFlowTransition[]> = {
    [WelcomeFlowState.INITIAL]: [
        WelcomeFlowTransition.CLICK_SETUP,
        WelcomeFlowTransition.CLICK_SUPPORT,
        WelcomeFlowTransition.CLICK_INVITE,
        WelcomeFlowTransition.SELECT_LANGUAGE,
    ],
    [WelcomeFlowState.SETUP_CLICKED]: [], // Flow hands over to Setup Wizard
    [WelcomeFlowState.SUPPORT_CLICKED]: [],
    [WelcomeFlowState.INVITE_CLICKED]: [],
    [WelcomeFlowState.LANGUAGE_SELECTED]: [
        WelcomeFlowTransition.CLICK_SETUP,
        WelcomeFlowTransition.CLICK_SUPPORT,
        WelcomeFlowTransition.CLICK_INVITE,
    ],
};

/**
 * Defines the next state for each transition
 */
export const WELCOME_FLOW_NEXT_STATES: Record<WelcomeFlowTransition, WelcomeFlowState> = {
    [WelcomeFlowTransition.CLICK_SETUP]: WelcomeFlowState.SETUP_CLICKED,
    [WelcomeFlowTransition.CLICK_SUPPORT]: WelcomeFlowState.SUPPORT_CLICKED,
    [WelcomeFlowTransition.CLICK_INVITE]: WelcomeFlowState.INVITE_CLICKED,
    [WelcomeFlowTransition.SELECT_LANGUAGE]: WelcomeFlowState.LANGUAGE_SELECTED,
};

/**
 * Defines the required data for each transition
 */
export const WELCOME_FLOW_REQUIRED_DATA: Record<WelcomeFlowTransition, (keyof WelcomeFlowData)[]> = {
    [WelcomeFlowTransition.CLICK_SETUP]: [],
    [WelcomeFlowTransition.CLICK_SUPPORT]: [],
    [WelcomeFlowTransition.CLICK_INVITE]: [],
    [WelcomeFlowTransition.SELECT_LANGUAGE]: ["selectedLanguage"],
};

/**
 * Welcome flow implementation
 */
export class WelcomeFlow extends UIFlowBase<WelcomeFlowState, WelcomeFlowTransition, WelcomeFlowData> {
    public static getName(): string {
        return "VertixBot/UI-General/WelcomeFlow";
    }

    public static getComponent() {
        return WelcomeComponent;
    }

    constructor(options: TAdapterRegisterOptions) {
        super(options);
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField(PermissionFlagsBits.ViewChannel);
    }

    public getChannelTypes(): ChannelType[] {
        return [ChannelType.GuildVoice, ChannelType.GuildText];
    }

    protected getInitialState(): WelcomeFlowState {
        return WelcomeFlowState.INITIAL;
    }

    protected getInitialData(): WelcomeFlowData {
        return {};
    }

    protected initializeTransitions(): void {
        // Initialize transitions based on WELCOME_FLOW_TRANSITIONS
        Object.entries(WELCOME_FLOW_TRANSITIONS).forEach(([state, transitions]) => {
            this.addTransitions(state as WelcomeFlowState, transitions);
        });
    }

    protected addTransitions(state: WelcomeFlowState, transitions: WelcomeFlowTransition[]): void {
        if (!this.hasTransitions(state)) {
            this.setTransitionsForState(state, new Set());
        }
        const stateTransitions = this.getTransitionsForState(state);
        if (stateTransitions) {
            transitions.forEach((transition) => {
                stateTransitions.add(transition);
            });
            this.setTransitionsForState(state, stateTransitions);
        }
    }

    public getAvailableTransitions(): WelcomeFlowTransition[] {
        return WELCOME_FLOW_TRANSITIONS[this.getCurrentState()];
    }

    public getNextState(transition: WelcomeFlowTransition): WelcomeFlowState {
        return WELCOME_FLOW_NEXT_STATES[transition];
    }

    public getRequiredData(transition: WelcomeFlowTransition): (keyof WelcomeFlowData)[] {
        return WELCOME_FLOW_REQUIRED_DATA[transition];
    }

    protected showModal(): Promise<void> {
        // Implementation will depend on your modal system
        // For now, return a resolved promise
        return Promise.resolve();
    }
}
