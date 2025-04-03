import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { UIWizardElementsGroupWrapperGenerator } from "@vertix.gg/gui/src/bases/ui-wizard-elements-group-wrapper-generator";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import UIService from "@vertix.gg/gui/src/ui-service";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ComponentSchemaResult } from "@vertix.gg/gui/src/bases/ui-serialization";

export class UIWizardComponentBase extends UIComponentBase {
    public static getName() {
        return "VertixGUI/UIWizardComponentBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getComponents(): UIComponentTypeConstructor[] {
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

        return this.getComponents().map( ( component ) =>
            UIWizardElementsGroupWrapperGenerator( {
                componentName: component.getName(),
                componentElements: component.getElements(),
                components: this.getComponents(),
                controlButtons: wizardControlButtons,
                UIElementsGroupBaseClass: this.getElementsGroupBaseClass(),
                UIElementsGroupExtendClass: this.getElementsGroupExtendClass()
            } )
        );
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

    /**
     * Enhanced toSchema implementation for wizard components
     * Properly serializes wizard components with their child components and control buttons
     */
    public async toSchema( _context?: any ): Promise<ComponentSchemaResult> {
        // Get the base schema from parent class
        const schema = await super.toSchema( _context );

        // Add processed child components
        const childSchemas = await this.getChildComponentSchemas();

        // Add child components to schema
        if ( !schema.components ) {
            schema.components = [];
        }

        if ( childSchemas && childSchemas.length ) {
            schema.components.push( ...childSchemas );
        }

        return schema;
    }

    /**
     * Get schemas for all child components
     */
    private async getChildComponentSchemas(): Promise<ComponentSchemaResult[]> {
        const selfClass = this.getStaticThis() as typeof UIWizardComponentBase;
        const childComponents = selfClass.getComponents();
        const childSchemas: ComponentSchemaResult[] = [];

        // Process each child component
        for ( const Component of childComponents ) {
            // Create a basic schema using component information
            const componentName = Component.getName();

            // Create a minimum viable schema for the component
            const childSchema: ComponentSchemaResult = {
                name: componentName,
                type: "component",
                entities: {
                    elements: [],
                    embeds: []
                }
            };

            // Add wizard buttons to the schema
            await this.addWizardButtonsToChildSchema( childSchema );

            // Add to result
            childSchemas.push( childSchema );
        }

        return childSchemas;
    }

    /**
     * Helper method to add wizard buttons to a child schema
     */
    private async addWizardButtonsToChildSchema( childSchema: ComponentSchemaResult ): Promise<void> {
        // Get wizard control buttons from element groups
        const selfClass = this.getStaticThis() as typeof UIWizardComponentBase;
        const elementGroups = selfClass.getElementsGroups();

        if ( !elementGroups || !elementGroups.length ) {
            return;
        }

        // Find matching element group for this child
        for ( const ElementsGroup of elementGroups ) {
            try {
                // Check if this elements group belongs to this child
                // if ( groupName.startsWith( childName + "/" ) ) {
                    // Get wizard buttons from the group
                    const elements = ElementsGroup.getItems( {} );

                    if ( elements && elements.length ) {
                        // Ensure child schema has entities
                        if ( !childSchema.entities ) {
                            childSchema.entities = { elements: [], embeds: [] };
                        }

                        if ( !childSchema.entities.elements ) {
                            childSchema.entities.elements = [];
                        }

                        // Add wizard buttons
                        if ( Array.isArray( elements[ 0 ] ) ) {
                            // Multi-row elements
                            elements.forEach( row => {
                                if ( row && Array.isArray( row ) && row.length ) {
                                    childSchema.entities!.elements!.push( row );
                                }
                            } );
                        } else {
                            // Single row elements
                            childSchema.entities.elements.push( elements as any[] );
                        }
                    }
                // }
            } catch {
                // Continue if there's an error
                // TODO: this.logger.error
            }
        }
    }
}
