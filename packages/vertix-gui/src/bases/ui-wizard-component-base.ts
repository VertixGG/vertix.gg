import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { UIWizardElementsGroupWrapperGenerator } from "@vertix.gg/gui/src/bases/ui-wizard-elements-group-wrapper-generator";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import UIService from "@vertix.gg/gui/src/ui-service";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

export class UIWizardComponentBase extends UIComponentBase {
    public static getName() {
        return "VertixGUI/UIWizardComponentBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getComponents(): ( typeof UIComponentBase )[] {
        return [];
    }

    public static getEmbedsGroups() {
        const results: ( typeof UIEmbedsGroupBase )[] = this.getComponents().map( ( component ) => {
            return class extends UIEmbedsGroupBase {
                public static getName() {
                    return component.getName() + "/EmbedsGroup";
                }

                public static getItems() {
                    return component.getEmbeds();
                }
            };
        } );

        return results;
    }

    public static getElementsGroups() {
        const wizardControlButtons = this.getControlButtons();

        return this.getComponents().map( ( component ) => {
            // Create an elements group for each component, even if they don't have elements
            // This ensures every component has a group that includes the wizard control buttons
            return UIWizardElementsGroupWrapperGenerator( {
                componentName: component.getName(),
                componentElements: component.getElements ? component.getElements() : [],
                components: this.getComponents(),
                controlButtons: wizardControlButtons,
                UIElementsGroupBaseClass: this.getElementsGroupBaseClass(),
                UIElementsGroupExtendClass: this.getElementsGroupExtendClass()
            } );
        } );
    }

    public static validate() {
        // Wizard should have at least two components.
        if ( this.getComponents().length < 2 ) {
            throw new Error( "Wizard should have at least two components." );
        }

        return super.validate();
    }

    // TODO: Try remove.
    public static getDefaultElementsGroup(): string | null {
        return null;
    }

    // TODO: Try remove.
    public static getDefaultEmbedsGroup(): string | null {
        return null;
    }

    protected static getElementsGroupBaseClass() {
        return UIElementsGroupBase;
    }

    protected static getElementsGroupExtendClass(): typeof UIElementsGroupBase | undefined {
        return undefined;
    }

    protected static getModals() {
        const modals = this.getComponents()
            .map( ( component ) => {
                return component.getModals();
            } )
            .flat();

        return modals as ( typeof UIModalBase )[];
    }

    protected static getControlButtons() {
        const systemElements = UIService.getSystemElements();

        const wizardControlButtons = [
            systemElements.WizardBackButton!,
            systemElements.WizardNextButton!,
            systemElements.WizardFinishButton!
        ];

        if ( !wizardControlButtons.every( Boolean ) ) {
            throw new Error( "Wizard control buttons are not registered." );
        }

        return wizardControlButtons;
    }
}
