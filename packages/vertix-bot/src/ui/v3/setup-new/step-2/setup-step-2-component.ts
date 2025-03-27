import { UIWizardStepComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-step-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";

import { SetupStep2Embed } from "@vertix.gg/bot/src/ui/v3/setup-new/step-2/setup-step-2-embed";

import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu";

import { UIWizardBackButton } from "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-back-button";
import { UIWizardNextButton } from "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-next-button";

export class SetupStep2Component extends UIWizardStepComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupStep2Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        // Define step-specific elements
        const stepElements = [
            [ ChannelButtonsTemplateSelectMenu ],
            [ ConfigExtrasSelectMenu ]
        ];

        // Combine with wizard control buttons
        return this.combineWithWizardButtons( stepElements );
    }

    public static getEmbeds() {
        return [ SetupStep2Embed ];
    }

    /**
     * This is not the first step in the wizard
     */
    protected static isFirstStep(): boolean {
        return false;
    }

    /**
     * This is not the last step in the wizard
     */
    protected static isLastStep(): boolean {
        return false;
    }

    /**
     * Step position in the wizard flow
     */
    protected static getStepPosition(): number {
        return 1; // 0-indexed, second step
    }

    /**
     * Total number of steps in this wizard
     */
    protected static getStepCount(): number {
        return 3; // This wizard has 3 steps
    }

    /**
     * Provide wizard control buttons based on step position
     */
    protected static getWizardControlButtons() {
        // Middle step needs both Back and Next buttons
        return [ UIWizardBackButton, UIWizardNextButton ];
    }
}
