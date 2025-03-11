import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import type {
    UIArgs,
    UICreateComponentArgs,
    UIExecutionStep,
    UIExecutionSteps
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

export type UIWizardComponentConstructor = { new ( args?: UICreateComponentArgs ): UIWizardComponentBase };
export type UIWizardComponentTypeConstructor = typeof UIWizardComponentBase & UIWizardComponentConstructor;

export class UIWizardAdapterBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterExecutionStepsBase<TChannel, TInteraction> {
    public static getName() {
        return "VertixGUI/UIWizardAdapterBase";
    }

    public static getComponent(): UIWizardComponentTypeConstructor {
        throw new ForceMethodImplementation( this.getName(), this.getComponent.name );
    }

    /**
     * This method, `getExecutionStepsInternal`, creates an object structure that represents the various execution steps
     * for a UI wizard component.
     *
     * It iterates through each component gathered from `getComponents`, checking if they have any "embeds" or "elements".
     *
     * If present, add a new object to a main result object with paths to the respective group alongside the component's name.
     *
     * If there are additional execution steps defined in subclasses (in `getExecutionSteps`)
     * these steps are merged into the main result object.
     *
     * Finally, it returns the assembled structure which will be used to guide users through the UI.
     */
    protected static getExecutionStepsInternal() {
        const result: UIExecutionSteps = {
            default: {}
        };

        this.getComponent()
            .getComponents()
            .forEach( ( component ) => {
                const implementedObject: UIExecutionStep = {},
                    entities = component.getEntities();

                // Check has embeds.
                if ( entities.some( ( e ) => e.getType() === "embed" ) ) {
                    implementedObject.embedsGroup = component.getName() + "/EmbedsGroup";
                }

                // Check has elements.
                if ( entities.some( ( e ) => e.getType() === "element" ) ) {
                    implementedObject.elementsGroup = component.getName() + "/ElementsGroup";
                }

                result[ component.getName() ] = implementedObject;
            } );

        const subclassSteps = this.getExecutionSteps();

        if ( subclassSteps ) {
            Object.assign( result, subclassSteps );
        }

        return result;
    }

    public get $$() {
        return this.constructor as typeof UIWizardAdapterBase;
    }

    public editReplyWithStep( interaction: TInteraction, stepName: string, sendArgs?: UIArgs ) {
        this.setCurrentStepInArgs( interaction, stepName );

        return super.editReplyWithStep( interaction, stepName, sendArgs );
    }

    public async ephemeralWithStep(
        interaction: TInteraction,
        stepName: string,
        sendArgs?: UIArgs,
        shouldDeletePreviousInteraction: boolean = this.shouldDeletePreviousReply?.() || false
    ): Promise<void> {
        this.setCurrentStepInArgs( interaction, stepName );

        return super.ephemeralWithStep( interaction, stepName, sendArgs, shouldDeletePreviousInteraction );
    }

    protected async onBeforeBack?( interaction: TInteraction ): Promise<void>;

    protected async onAfterBack?( interaction: TInteraction ): Promise<void>;

    protected async onBeforeNext?( interaction: TInteraction ): Promise<void>;

    protected async onAfterNext?( interaction: TInteraction ): Promise<void>;

    protected async onBeforeFinish?( interaction: TInteraction ): Promise<void>;

    protected async onAfterFinish?( interaction: TInteraction ): Promise<void>;

    protected buildEntitiesMap() {
        super.buildEntitiesMap();

        const { WizardBackButton, WizardNextButton, WizardFinishButton } = this.uiService.$$.getSystemElements() as {
            [key: string]: UIElementButtonBase;
        };

        this.bindButton<TInteraction>( WizardBackButton.getName(), this.onWizardBackButtonClicked );
        this.bindButton<TInteraction>( WizardNextButton.getName(), this.onWizardNextButtonClicked );
        this.bindButton<TInteraction>( WizardFinishButton.getName(), this.onWizardFinishButtonClicked );
    }

    protected getCurrentStepIndex(
        interaction?: TInteraction,
        components: ( typeof UIComponentBase )[] = this.$$.getComponent().getComponents()
    ) {
        return components.findIndex( ( i ) => i.getName() === this.getCurrentExecutionStep( interaction )?.name );
    }

    private async onWizardBackButtonClicked( interaction: TInteraction ) {
        await this.onBeforeBack?.( interaction );

        const components = this.$$.getComponent().getComponents();

        const currentIndex = this.getCurrentStepIndex( interaction, components );

        if ( currentIndex === -1 || currentIndex === 0 ) {
            return;
        }

        await this.editReplyWithStep( interaction, components[ currentIndex - 1 ].getName() );

        await this.onAfterBack?.( interaction );
    }

    private async onWizardNextButtonClicked( interaction: TInteraction ) {
        await this.onBeforeNext?.( interaction );

        const components = this.$$.getComponent().getComponents();

        const currentIndex = this.getCurrentStepIndex( interaction, components );

        if ( currentIndex === components.length - 1 ) {
            return;
        }

        await this.editReplyWithStep( interaction, components[ currentIndex + 1 ].getName() );

        await this.onAfterNext?.( interaction );
    }

    private async onWizardFinishButtonClicked( interaction: TInteraction ) {
        await this.onBeforeFinish?.( interaction );

        // TODO: ???.

        await this.onAfterFinish?.( interaction );
    }

    private setCurrentStepInArgs( interaction: TInteraction, stepName: string ) {
        // TODO: Dynamic should be handled manually?
        if ( this.isDynamic() ) {
            return;
        }

        // TODO: This is not good practice, it used internally inside the wizard control buttons.
        this.getArgsManager().setArgs( this, interaction, {
            _step: stepName
        } );
    }
}
