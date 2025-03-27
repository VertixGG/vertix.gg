import { UIWizardStepComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-step-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";

import { ChannelNameTemplateEditButton } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-edit-button";

import { SetupStep1Embed } from "@vertix.gg/bot/src/ui/v3/setup-new/step-1/setup-step-1-embed";

import { UIWizardNextButton } from "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-next-button";
import { UIWizardBackButton } from "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-back-button";

export class SetupStep1Component extends UIWizardStepComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupStep1Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        // Define step-specific elements
        const stepElements = [
            [ ChannelNameTemplateEditButton ]
        ];

        // Combine with wizard control buttons
        return this.combineWithWizardButtons( stepElements );
    }

    public static getEmbeds() {
        return [ SetupStep1Embed ];
    }

    public static getModals() {
        return [ ChannelNameTemplateModal ];
    }

    /**
     * This is the first step in the wizard
     */
    protected static isFirstStep(): boolean {
        return true;
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
        return 0; // 0-indexed, first step
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
        // First step has both Back and Next buttons (Back will be disabled)
        return [ UIWizardBackButton, UIWizardNextButton ];
    }

    /**
     * Override to set UI args for components
     */
    public async build( args = {} ) {
        // Set the back button to disabled for the first step
        const uiArgs = {
            ...args,
            _wizardIsBackButtonDisabled: true
        };

        return super.build( uiArgs );
    }
}
