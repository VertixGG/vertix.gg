import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIInstanceTypeBase } from "@vertix.gg/gui/src/bases/ui-instance-type-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { PermissionsBitField, ChannelType } from "discord.js";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { FlowComponent as SharedFlowComponent, FlowData as SharedFlowData, VisualConnection } from "@vertix.gg/flow/src/shared/types/flow"; // Use shared types

/**
 * Base interface for flow states
 */
export type UIFlowState = string;

/**
 * Base interface for flow transitions
 */
export type UIFlowTransition = string;

/**
 * Base interface for flow data
 */
export interface UIFlowData {
    // Common fields for cross-flow communication
    originFlow?: string;
    originState?: string;
    originTransition?: string;
    interactionId?: string;

    [key: string]: unknown;
}

/**
 * Interface for flow integration metadata
 */
export interface FlowIntegrationPoint {
    flowName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
}

/**
 * Interface for component schema result
 */
export interface ComponentSchemaResult {
    name?: string;
    type?: string;
    entities?: {
        elements?: unknown[];
        embeds?: unknown[];
    };
    components?: ComponentSchemaResult[];
    [key: string]: unknown;
}

/**
 * Base class for UI flows
 * Extends UIInstanceTypeBase directly to focus on state machine functionality
 * without requiring interaction handling capabilities
 */
export abstract class UIFlowBase<
    TState extends string,
    TTransition extends string,
    TData extends UIFlowData = UIFlowData
> extends UIInstanceTypeBase {
    private currentState: TState;
    private readonly transitions: Map<TState, Set<TTransition>> = new Map();
    private data: TData;

    public constructor( protected options: TAdapterRegisterOptions ) {
        super();

        this.currentState = this.getInitialState();
        this.data = this.getInitialData();

        this.initializeTransitions();
    }

    public static getName(): string {
        return "VertixGUI/UIFlowBase";
    }

    public static getComponents(): UIComponentConstructor[] {
        throw new ForceMethodImplementation( "UIFlowBase", "getComponents" );
    }

    /**
     * Get entry points for this flow from other flows
     * Should be implemented by derived classes to document integration points
     */
    public static getEntryPoints?(): FlowIntegrationPoint[] {
        return [];
    }

    /**
     * Get handoff points from this flow to other flows
     * Should be implemented by derived classes to document integration points
     */
    public static getHandoffPoints?(): FlowIntegrationPoint[] {
        return [];
    }

    /**
     * Get external services or components this flow depends on
     * Should be implemented by derived classes to document dependencies
     */
    public static getExternalReferences?(): Record<string, string> {
        return {};
    }

    /**
     * Returns the type of flow (e.g., 'ui', 'system').
     * Defaults to 'ui'. Can be overridden by subclasses.
     */
    public static getFlowType(): "ui" | "system" | string { // Allow string for custom types
        return "ui";
    }

    /**
     * Returns the permissions required to use this flow
     */
    public abstract getPermissions(): PermissionsBitField;

    /**
     * Returns the channel types this flow supports
     */
    public abstract getChannelTypes(): ChannelType[];

    protected abstract getInitialState(): TState;
    protected abstract getInitialData(): TData;
    protected abstract initializeTransitions(): void;

    protected hasTransitions( state: TState ): boolean {
        return this.transitions.has( state );
    }

    protected getTransitionsForState( state: TState ): Set<TTransition> | undefined {
        return this.transitions.get( state );
    }

    protected setTransitionsForState( state: TState, transitions: Set<TTransition> ): void {
        this.transitions.set( state, transitions );
    }

    /**
     * Get available transitions from current state
     */
    public abstract getAvailableTransitions(): TTransition[];

    /**
     * Get the next state for a given transition
     */
    public abstract getNextState( transition: TTransition ): TState;

    /**
     * Get required data for a transition
     */
    public abstract getRequiredData( transition: TTransition ): ( keyof TData )[];

    /**
     * Check if a transition is valid from the current state
     */
    public isTransitionValid( transition: TTransition ): boolean {
        return this.getAvailableTransitions().includes( transition );
    }

    /**
     * Check if required data is available for a transition
     */
    public isDataValid( transition: TTransition ): boolean {
        const requiredData = this.getRequiredData( transition );
        return requiredData.every( ( key ) => key in this.data );
    }

    /**
     * Execute a transition - simplified version for flow definition
     */
    public transition( transition: TTransition ): void {
        // This is a simplified version for flow definition files
        this.currentState = this.getNextState( transition );
    }

    /**
     * Update flow data
     */
    public updateData( data: Partial<TData> ): void {
        this.data = { ...this.data, ...data };
    }

    /**
     * Get current state
     */
    public getCurrentState(): TState {
        return this.currentState;
    }

    /**
     * Get current flow data
     */
    public getData(): TData {
        return this.data;
    }

    /**
     * Get the component instances for this flow
     */
    public getComponents() {
        return ( this.constructor as typeof UIFlowBase ).getComponents();
    }

    /**
     * Build schema from components
     * @returns Component schema structure or null if no schemas
     */
    public async buildComponentSchemas( components = this.getComponents() ): Promise<ComponentSchemaResult[]> {
        const schemas: ComponentSchemaResult[] = [];

        for ( const Component of components ) {
            try {
                // Create component instance
                const component = new Component();

                // Use the component's serialization method and convert to flow schema format
                const serializedSchema = await component.toSchema();

                // Convert to local schema format (they're compatible but TypeScript doesn't know that)
                const schema: ComponentSchemaResult = {
                    name: serializedSchema.name,
                    type: serializedSchema.type,
                    entities: serializedSchema.entities,
                    components: serializedSchema.components as ComponentSchemaResult[]
                };

                if ( schema ) {
                    schemas.push( schema );
                }
            } catch ( error ) {
                // Log error and continue with next component
                console.error( "Error serializing component:", error );
            }
        }

        return schemas.length ? schemas : [];
    }

    /**
     * Returns the next state for a given transition
     * Need to define this method as static if not already
     */
    public static getNextStates?(): Record<string, string>; // Define as optional static method

    /**
     * Define getVisualConnections as optional static method
     */
    public static getVisualConnections?(): VisualConnection[];

    /**
     * Convert flow to JSON representation
     * Includes integration points and external references
     */
    public async toJSON(): Promise<SharedFlowData> { // Use SharedFlowData type
        const transactions = this.getAvailableTransitions();
        const requiredDataMap: Record<string, ( keyof TData )[]> = {};

        for ( const transaction of transactions ) {
            requiredDataMap[ transaction as string ] = this.getRequiredData( transaction );
        }

        const constructor = ( this.constructor as typeof UIFlowBase );
        const entryPoints = constructor.getEntryPoints?.() || [];
        const handoffPoints = constructor.getHandoffPoints?.() || [];
        const externalRefs = constructor.getExternalReferences?.() || {};
        // Safely get nextStates map using optional chaining
        const nextStatesMap = constructor.getNextStates ? constructor.getNextStates() : {};
        const builtComponents = await this.buildComponentSchemas(); // Get components
        const visualConnections = constructor.getVisualConnections?.() || []; // Get visual connections

        // Construct the FlowData object directly
        const flowDataResult: SharedFlowData = {
            name: constructor.getName(),                 // Static
            type: constructor.getFlowType(),             // Static
            // currentState: this.currentState,          // Instance property - remove if frontend doesn't need it
            transactions,                                // From instance method
            requiredData: requiredDataMap as Record<string, string[]>, // Cast keyof TData[] to string[]
            nextStates: nextStatesMap,                   // Static
            integrations: {
                entryPoints,
                handoffPoints,
                externalReferences: externalRefs
            },
            components: builtComponents as SharedFlowComponent[], // Cast ComponentSchemaResult[] to SharedFlowComponent[]
            visualConnections: visualConnections // Add visual connections
        };

        // Clean up optional fields if they are empty objects/arrays
        if ( !flowDataResult.nextStates || Object.keys( flowDataResult.nextStates ).length === 0 ) {
            delete flowDataResult.nextStates;
        }
        if ( !flowDataResult.integrations?.entryPoints?.length ) {
             if ( flowDataResult.integrations ) delete flowDataResult.integrations.entryPoints;
        }
        if ( !flowDataResult.integrations?.handoffPoints?.length ) {
             if ( flowDataResult.integrations ) delete flowDataResult.integrations.handoffPoints;
        }
        if ( !flowDataResult.integrations?.externalReferences || Object.keys( flowDataResult.integrations.externalReferences ).length === 0 ) {
             if ( flowDataResult.integrations ) delete flowDataResult.integrations.externalReferences;
        }
        if ( flowDataResult.integrations && Object.keys( flowDataResult.integrations ).length === 0 ) {
             delete flowDataResult.integrations;
        }
        if ( !flowDataResult.visualConnections?.length ) { // Clean up visual connections too
            delete flowDataResult.visualConnections;
        }

        return flowDataResult;
    }
}
