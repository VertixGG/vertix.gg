import { UIAdapterService } from "@vertix.gg/gui/src/ui-adapter-service";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

export class UIWizardComponentBase extends UIComponentBase {
    public static getName() {
        return "VertixGUI/UIWizardComponentBase";
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
        const systemElements = UIAdapterService.getSystemElements();

        const wizardControlButtons = [
            systemElements.WizardBackButton,
            systemElements.WizardNextButton,
            systemElements.WizardFinishButton,
        ];

        if ( ! wizardControlButtons.every( Boolean ) ) {
            throw new Error( "Wizard control buttons are not registered." );
        }

        const components = this.getComponents();

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
