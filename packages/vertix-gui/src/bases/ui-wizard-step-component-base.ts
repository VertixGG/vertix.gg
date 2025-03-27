import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIElementsTypesConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Base class for wizard step components
 * Provides common functionality for wizard steps and navigation
 */
export abstract class UIWizardStepComponentBase extends UIComponentBase {
    public static getName() {
        return "VertixGUI/UIWizardStepComponentBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    /**
     * Abstract method that should be implemented by derived classes
     * to provide the wizard control buttons for this step
     */
    protected static getWizardControlButtons(): UIElementsTypesConstructor {
        return [];
    }

    /**
     * Abstract method to determine if this is the first step in the wizard
     */
    protected static isFirstStep(): boolean {
        return false;
    }

    /**
     * Abstract method to determine if this is the last step in the wizard
     */
    protected static isLastStep(): boolean {
        return false;
    }

    /**
     * Get step position in the wizard
     * This is used for positioning and navigation
     */
    protected static getStepPosition(): number {
        return 0;
    }

    /**
     * Get step count in the wizard
     * This is the total number of steps
     */
    protected static getStepCount(): number {
        return 0;
    }

    /**
     * Utility method to combine normal elements with wizard control buttons
     * Each derived class should use this in its getElements method
     */
    protected static combineWithWizardButtons( stepElements: UIElementsTypesConstructor ): UIElementsTypesConstructor {
        // Create a copy of the elements array
        const result = Array.isArray( stepElements[ 0 ] )
            ? [ ...stepElements as any[][] ]
            : [ stepElements ];

        // Add wizard control buttons as a new row (if any)
        const controlButtons = this.getWizardControlButtons();
        if ( controlButtons && controlButtons.length > 0 ) {
            result.push( controlButtons );
        }

        return result;
    }
}
