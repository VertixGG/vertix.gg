import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import type { UIComponentConstructor, UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIFlowData, ComponentSchemaResult } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

/**
 * Base interface for wizard flow data
 */
export interface WizardFlowData extends UIFlowData {
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
    TData extends WizardFlowData = WizardFlowData
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
    public async buildComponentSchemas(): Promise<ComponentSchemaResult[]> {
        const schemas: ComponentSchemaResult[] = [];

        for ( const Component of this.stepComponents ) {
            const component = new Component();

            await component.waitUntilInitialized();

            const result = await component.build( {} ) as ComponentSchemaResult;
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
}
