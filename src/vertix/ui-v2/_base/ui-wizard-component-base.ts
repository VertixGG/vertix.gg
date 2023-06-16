import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

import { UIWizardBackButton } from "@vertix/ui-v2/_base/wizard/ui-wizard-back-button";
import { UIWizardNextButton } from "@vertix/ui-v2/_base/wizard/ui-wizard-next-button";
import { UIWizardFinishButton } from "@vertix/ui-v2/_base/wizard/ui-wizard-finish-button";

import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";

export class UIWizardComponentBase extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/UIWizardComponentBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getComponents(): typeof UIComponentBase[] {
        return [];
    };

    public static getEmbedsGroups() {
        const results: typeof UIEmbedsGroupBase[] = this.getComponents().map( ( component ) => {
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
        const components = this.getComponents(),
            wizardControlButtons = [
                UIWizardBackButton,
                UIWizardNextButton,
                UIWizardFinishButton,
            ];

        return components.map( ( component ) => {
            return class extends UIElementsGroupBase {
                public static getName() {
                    return component.getName() + "/ElementsGroup";
                }

                public static getItems( args: UIArgs ) { // For one modal submit it called so many times.
                    const currentElements: any[][] = [];

                    // TODO: Fix this, avoid non multi-dimensional arrays.
                    const elements = component.getElements();

                    if ( Array.isArray( elements[ 0 ] ) ) {
                        elements.forEach( ( row ) => {
                            currentElements.push( row as any );
                        } );
                    } else {
                        currentElements.push( [ elements] as any );
                    }

                    if ( args ) {
                        const currentIndex = components.findIndex( ( i ) => i.getName() === args._step );

                        // TODO: It should not work like this, shallow copy should be enough.
                        args._wizardIsBackButtonDisabled = false;
                        args._wizardIsNextButtonDisabled = false;
                        args._wizardIsFinishButtonDisabled = false;
                        args._wizardIsNextButtonAvailable = false;
                        args._wizardIsFinishButtonAvailable = false;

                        if ( 0 === currentIndex ) {
                            args._wizardIsBackButtonDisabled = true;
                        } else if ( currentIndex === components.length - 1 ) {
                            args._wizardIsNextButtonDisabled = true;
                        }

                        if ( currentIndex !== components.length - 1 ) {
                            args._wizardIsNextButtonAvailable = true;
                        } else {
                            args._wizardIsFinishButtonAvailable = true;
                        }

                        if ( args._wizardShouldDisableFinishButton ) {
                            args._wizardIsFinishButtonDisabled = true;
                        }
                    }

                    currentElements.push( [ ...wizardControlButtons ] );

                    return currentElements;
                }
            };
        } );
    }

    public static validate() {
        // Wizard should have at least two components.
        if ( this.getComponents().length < 2 ) {
            throw new Error( "Wizard should have at least two components." );
        }

        return super.validate();
    }

    protected static getModals() {
        const modals = this.getComponents().map( ( component ) => {
            return component.getModals();
        } ).flat();

        return modals as typeof UIModalBase[];
    }

    protected static getDefaultElementsGroup() {
        return null;
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
}
