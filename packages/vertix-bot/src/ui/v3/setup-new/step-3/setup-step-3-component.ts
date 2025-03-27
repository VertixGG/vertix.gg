import { UIWizardStepComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-step-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";

import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";

import { SetupStep3Embed } from "@vertix.gg/bot/src/ui/v3/setup-new/step-3/setup-step-3-embed";

import { UIWizardBackButton } from "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-back-button";
import { UIWizardFinishButton } from "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-finish-button";

export class SetupStep3Component extends UIWizardStepComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupStep3Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        // Define step-specific elements
        const stepElements = [
            [ VerifiedRolesMenu ],
            [ VerifiedRolesEveryoneSelectMenu ]
        ];

        // Combine with wizard control buttons
        return this.combineWithWizardButtons( stepElements );
    }

    public static getEmbeds() {
        return [ SetupStep3Embed ];
    }

    /**
     * This is not the first step in the wizard
     */
    protected static isFirstStep(): boolean {
        return false;
    }

    /**
     * This is the last step in the wizard
     */
    protected static isLastStep(): boolean {
        return true;
    }

    /**
     * Step position in the wizard flow
     */
    protected static getStepPosition(): number {
        return 2; // 0-indexed, third step
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
        // Last step needs Back and Finish buttons
        return [ UIWizardBackButton, UIWizardFinishButton ];
    }
}
