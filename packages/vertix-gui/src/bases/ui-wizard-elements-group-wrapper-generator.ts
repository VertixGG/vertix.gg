import { ForceMethodImplementation } from "@vertix.gg/base/src/errors/index";

import type { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import type { UIArgs, UIElementsConstructor, UIElementsTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

interface TUIWizardElementsGroupWrapperGeneratorArgs {
    componentName: string;
    componentElements: UIElementsTypes | UIElementsConstructor;

    components: ( typeof UIComponentBase )[];

    controlButtons: ( new () => UIElementButtonBase )[];

    UIElementsGroupBaseClass: typeof UIElementsGroupBase;
    UIElementsGroupExtendClass?: typeof UIElementsGroupBase;
}

/**
 * This method is responsible for returning an array of UI Elements Groups.
 *
 * Initially, it fetches system elements and creates an array of `wizardControlButtons` which includes
 * `WizardBackButton`,`WizardNextButton`, and `WizardFinishButton`.
 * It verifies all of these buttons are registered, otherwise throws an error message.
 *
 * It attains `components` by calling the `getComponents` method.
 *
 * Each component in the components array is then processed where an anonymous class extending from
 * `UIElementsGroupBase` is created and returned.
 *
 * In this anonymous class implementation:
 *   - `getName()` returns the component's name concatenated with "/ElementsGroup".
 *   - `getItems( args: UIArgs )` supplies the items for UI elements. This starts by initializing the `currentElements` array
 *     and getting elements for the current component. Depending on whether these elements are multi-dimensional arrays or not,
 *     they are pushed onto `currentElements`.
 *
 *   - Provided `args`, determines the button state (enabled/disabled) for wizard control buttons based on their positions.
 *     It also decides whether the next or finish button should be available based on the component's position.
 *     The finish button can be forcibly disabled if `args` includes `_wizardShouldDisableFinishButton`.
 *
 *   - It finally adds the `wizardControlButtons` to the `currentElements` array and returns it.
 *
 * The outer function wraps up by returning this mapped array of improved components, now made suitable for UI usage.
 */
export function UIWizardElementsGroupWrapperGenerator( args: TUIWizardElementsGroupWrapperGeneratorArgs ) {
    const {
        componentName,
        componentElements,
        components,
        controlButtons,
        UIElementsGroupBaseClass,
        UIElementsGroupExtendClass
    } = args;

    abstract class UIWizardElementsGroupWrapperBase extends UIElementsGroupBaseClass {
        public static getName() {
            // TODO: Avoid hard-coded.
            return componentName + "/ElementsGroup";
        }

        protected static getComponent(): typeof UIComponentBase {
            throw new ForceMethodImplementation( this, this.getComponent.name );
        }

        public static getItems( args: UIArgs ) {
            // For one modal submit it called so many times.
            const currentElements: any[][] = [];

            // TODO: Fix this, this is code should not be here.
            if ( Array.isArray( componentElements[ 0 ] ) ) {
                componentElements.forEach( ( row ) => {
                    currentElements.push( row as any );
                } );
            } else {
                currentElements.push( [ componentElements ] as any );
            }

            if ( args ) {
                const currentIndex = components.findIndex( ( i ) => i.getName() === args._step );

                // TODO: It should not work like this, shallow copy should be enough.
                args._wizardIsBackButtonDisabled = false;
                args._wizardIsNextButtonDisabled = false;
                args._wizardIsFinishButtonDisabled = false;
                args._wizardIsNextButtonAvailable = false;
                args._wizardIsFinishButtonAvailable = false;

                if ( 0 === currentIndex || currentIndex === -1 ) {
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

            currentElements.push( [ ...controlButtons ] );

            return currentElements;
        }
    }

    if ( UIElementsGroupExtendClass ) {
        Object.setPrototypeOf( UIElementsGroupExtendClass, UIWizardElementsGroupWrapperBase );

        return UIElementsGroupExtendClass;
    }

    return UIWizardElementsGroupWrapperBase;
}
