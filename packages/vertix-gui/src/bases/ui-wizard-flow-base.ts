import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import UIService from "@vertix.gg/gui/src/ui-service";

import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";
import type { UIComponentConstructor, UIComponentTypeConstructor, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UISerializationComponentSchemaResult , UISerializationFlowElement } from "@vertix.gg/definitions/src/ui-serialization-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

/**
 * Base interface for wizard flow data
 */
export interface UIFlowWizardData extends UIFlowDataBase {
    currentStep: number;
    totalSteps: number;
    stepHistory: number[];
    errorCode?: string;
    errorMessage?: string;
    [key: string]: unknown;
}

/**
 * Base class for wizard UI flows with step management
 */
export abstract class UIWizardFlowBase<
    TState extends string = string,
    TTransition extends string = string,
    TData extends UIFlowWizardData = UIFlowWizardData
> extends UIFlowBase<TState, TTransition, TData> {

    private stepComponents: UIComponentConstructor[] = [];

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        // Initialize the step components from static method
        this.stepComponents = this.getStepComponents();

        // Initialize step data
        this.updateData( {
            currentStep: 0,
            totalSteps: this.stepComponents.length,
            stepHistory: [],
        } as unknown as Partial<TData> );
    }

    public static getName(): string {
        return "VertixGUI/UIWizardFlowBase";
    }

    /**
     * Get the step components for this wizard flow
     * Must be implemented by derived classes
     */
    public abstract getStepComponents(): UIComponentConstructor[];

    /**
     * Get available transitions based on current step
     */
    public getAvailableTransitions(): TTransition[] {
        const data = this.getData();
        const availableTransitions: string[] = [];

        // Use fully qualified UPPERCASE string literals
        if ( data.currentStep > 0 ) {
            availableTransitions.push( "VertixGUI/UIWizardFlowBase/Transitions/Back" );
        }
        if ( data.currentStep < data.totalSteps - 1 ) {
            availableTransitions.push( "VertixGUI/UIWizardFlowBase/Transitions/Next" );
        }
        if ( data.currentStep === data.totalSteps - 1 ) {
            availableTransitions.push( "VertixGUI/UIWizardFlowBase/Transitions/Finish" );
        }
        availableTransitions.push( "VertixGUI/UIWizardFlowBase/Transitions/Error" );

        const customTransitions = this.getCustomTransitionsForStep( data.currentStep );

        return [ ...availableTransitions, ...customTransitions ] as TTransition[];
    }

    /**
     * Get custom transitions for current step
     * Can be overridden by derived classes
     */
    protected getCustomTransitionsForStep( _step: number ): string[] {
        return [];
    }

    /**
     * Move to the next step
     */
    public nextStep(): void {
        const data = this.getData();

        if ( data.currentStep < data.totalSteps - 1 ) {
            const stepHistory = [ ...data.stepHistory, data.currentStep ];

            this.updateData( {
                currentStep: data.currentStep + 1,
                stepHistory,
            } as Partial<TData> );
        }
    }

    /**
     * Move to the previous step
     */
    public previousStep(): void {
        const data = this.getData();

        if ( data.currentStep > 0 ) {
            const stepHistory = [ ...data.stepHistory ];

            this.updateData( {
                currentStep: data.currentStep - 1,
                stepHistory,
            } as Partial<TData> );
        }
    }

    /**
     * Get the current step component
     */
    public getCurrentStepComponent(): UIComponentConstructor | null {
        const data = this.getData();
        return this.stepComponents[ data.currentStep ] || null;
    }

    /**
     * Override to build schema from step components
     */
    public async buildComponentSchemas(): Promise<UISerializationComponentSchemaResult[]> {
        const schemas: UISerializationComponentSchemaResult[] = [];
        const totalSteps = this.stepComponents.length;

        for ( let index = 0; index < this.stepComponents.length; index++ ) {
            const Component = this.stepComponents[ index ];
            const component = new Component();

            await component.waitUntilInitialized();

            const result = await component.build( {} ) as UISerializationComponentSchemaResult;
            const controlRow = await this.buildWizardControlRow( index, totalSteps );

            if ( controlRow.length ) {
                if ( !result.entities ) {
                    result.entities = {
                        elements: [],
                        embeds: []
                    };
                }
                if ( !result.entities.elements ) {
                    result.entities.elements = [];
                }
                result.entities.elements.push( controlRow );
            }

            schemas.push( result );
        }

        return schemas;
    }

    /**
     * Custom implementation for wizard flows
     */
    public static getComponents(): UIComponentTypeConstructor[] {
        // This method is intentionally empty as we use getStepComponents instead
        // It satisfies the base class requirement
        return [];
    }

    /**
     * Set error state with details
     */
    public setError( errorCode: string, errorMessage: string ): void {
        this.updateData( {
            errorCode,
            errorMessage,
        } as Partial<TData> );
    }

    /**
     * Clear error state
     */
    public clearError(): void {
        this.updateData( {
            errorCode: undefined,
            errorMessage: undefined,
        } as Partial<TData> );
    }

    private async buildWizardControlRow( stepIndex: number, totalSteps: number ): Promise<UISerializationFlowElement[]> {
        const { WizardBackButton, WizardNextButton, WizardFinishButton } = UIService.getSystemElements();

        if ( !WizardBackButton || !WizardNextButton || !WizardFinishButton ) {
            return [];
        }

        const args = this.getWizardControlArgs( stepIndex, totalSteps );
        const isLastStep = stepIndex === totalSteps - 1;
        const buttons: Array<{ ctor: new () => { build: ( uiArgs?: UIArgs ) => Promise<UISerializationFlowElement> }; include: boolean }> = [
            { ctor: WizardBackButton, include: true },
            { ctor: WizardNextButton, include: !isLastStep },
            { ctor: WizardFinishButton, include: isLastStep }
        ];

        const schemas: UISerializationFlowElement[] = [];

        for ( const { ctor, include } of buttons ) {
            if ( !include ) {
                continue;
            }

            const instance = new ctor();
            const schema = await instance.build( args ) as UISerializationFlowElement;
            schemas.push( schema );
        }

        return schemas;
    }

    private getWizardControlArgs( stepIndex: number, totalSteps: number ): UIArgs {
        const isFirstStep = stepIndex === 0;
        const isLastStep = stepIndex === totalSteps - 1;
        const Component = this.stepComponents[ stepIndex ];
        const componentClass = Component as unknown as typeof UIComponentBase;
        const stepName = componentClass.getName?.() || `Step${ stepIndex + 1 }`;

        const args: UIArgs = {
            _step: stepName,
            _wizardIsBackButtonDisabled: isFirstStep,
            _wizardIsNextButtonDisabled: isLastStep,
            _wizardIsFinishButtonDisabled: !isLastStep,
            _wizardIsNextButtonAvailable: !isLastStep,
            _wizardIsFinishButtonAvailable: isLastStep,
            _wizardIsBackButtonAvailable: !isFirstStep,
            _wizardShouldDisableFinishButton: false
        };

        if ( isLastStep ) {
            args._wizardIsNextButtonDisabled = true;
            args._wizardIsNextButtonAvailable = false;
        }

        if ( !isLastStep ) {
            args._wizardIsFinishButtonAvailable = false;
        }

        return args;
    }
}
