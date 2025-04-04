import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { ObjectBase } from "@vertix.gg/base/src/bases/object-base"; // Import ObjectBase

import { UIInstanceTypeBase } from "@vertix.gg/gui/src/bases/ui-instance-type-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { PermissionsBitField, ChannelType } from "discord.js";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { FlowComponent as SharedFlowComponent, FlowData as SharedFlowData, FlowIntegrationPoint as SharedFlowIntegrationPoint, VisualConnection } from "vertix-flow/src/features/flow-editor/types/flow";

// Define enum for integration point types with a corrected name
export enum UIEFlowIntegrationPointType {
    STANDARD = "STANDARD",
    COMMAND = "COMMAND",
}

// Define interface for constructor options (kept for clarity in constructors)
interface FlowIntegrationPointBaseOptions {
    flowName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
    eventName?: string;
}

// Define interface for command constructor options (kept for clarity)
interface FlowIntegrationPointCommandOptions extends FlowIntegrationPointBaseOptions {
    commandName: string;
}

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
 * Abstract base class for flow integration points, extending ObjectBase
 */
export abstract class FlowIntegrationPointBase extends ObjectBase {
    public readonly flowName: string;
    public readonly description: string;
    public readonly sourceState?: string;
    public readonly targetState?: string;
    public readonly transition?: string;
    public readonly requiredData?: string[];
    public readonly eventName?: string;

    protected constructor( options: FlowIntegrationPointBaseOptions ) {
        super();
        this.flowName = options.flowName;
        this.description = options.description;
        this.sourceState = options.sourceState;
        this.targetState = options.targetState;
        this.transition = options.transition;
        this.requiredData = options.requiredData;
        this.eventName = options.eventName;
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointBase";
    }

    public static getType(): UIEFlowIntegrationPointType {
        throw new ForceMethodImplementation( this.name, "getType" );
    }
}

/**
 * NEW Abstract base class for command-specific integration points
 */
export abstract class FlowIntegrationPointCommandBase extends FlowIntegrationPointBase {
    public readonly commandName: string;

    protected constructor( options: FlowIntegrationPointCommandOptions ) {
        super( options );
        this.commandName = options.commandName;
    }
}

/**
 * Represents a standard integration point (entry/handoff)
 * Extends FlowIntegrationPointBase directly
 */
export class FlowIntegrationPointStandard extends FlowIntegrationPointBase {
    public constructor( options: FlowIntegrationPointBaseOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointStandard";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.STANDARD;
    }
}

/**
 * Represents a command-specific integration point (handoff from CommandsFlow)
 * Extends FlowIntegrationPointCommandBase
 */
export class FlowIntegrationPointCommand extends FlowIntegrationPointCommandBase {
    public constructor( options: FlowIntegrationPointCommandOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointCommand";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.COMMAND;
    }
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
    public static getEntryPoints?(): FlowIntegrationPointBase[] {
        return [];
    }

    /**
     * Get handoff points from this flow to other flows
     * Should be implemented by derived classes to document integration points
     */
    public static getHandoffPoints?(): FlowIntegrationPointBase[] {
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
    public static getFlowType(): "ui" | "system" | string {
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
                const component = new Component();

                const serializedSchema = await component.toSchema();

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
                console.error( "Error serializing component:", error );
            }
        }

        return schemas.length ? schemas : [];
    }

    /**
     * Returns the next state for a given transition
     * Need to define this method as static if not already
     */
    public static getNextStates?(): Record<string, string>;

    /**
     * Define getVisualConnections as optional static method
     */
    public static getVisualConnections?(): VisualConnection[];

    /**
     * Convert flow to JSON representation compatible with SharedFlowData
     */
    public async toJSON(): Promise<SharedFlowData> {
        const transactions = this.getAvailableTransitions();
        const requiredDataMap: Record<string, ( keyof TData )[]> = {};

        for ( const transaction of transactions ) {
            requiredDataMap[ transaction as string ] = this.getRequiredData( transaction );
        }

        const constructor = ( this.constructor as typeof UIFlowBase );
        const entryPoints = constructor.getEntryPoints?.() || [];
        const handoffPoints = constructor.getHandoffPoints?.() || [];
        const externalRefs = constructor.getExternalReferences?.() || {};
        const nextStatesMap = constructor.getNextStates ? constructor.getNextStates() : {};
        const builtComponents = await this.buildComponentSchemas();
        const visualConnections = constructor.getVisualConnections?.() || [];

        const flowDataResult: SharedFlowData = {
            name: constructor.getName(),
            type: constructor.getFlowType(),
            transactions,
            requiredData: requiredDataMap as Record<string, string[]>,
            nextStates: nextStatesMap,
            integrations: {
                entryPoints: entryPoints.map( p => this.serializeIntegrationPointForEditor( p ) ),
                handoffPoints: handoffPoints.map( p => this.serializeIntegrationPointForEditor( p ) ),
                externalReferences: externalRefs
            },
            components: builtComponents as SharedFlowComponent[],
            visualConnections: visualConnections
        };

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
        if ( !flowDataResult.visualConnections?.length ) {
            delete flowDataResult.visualConnections;
        }

        return flowDataResult;
    }

    // Helper to serialize integration points specifically for the Flow Editor's expected format
    private serializeIntegrationPointForEditor( point: FlowIntegrationPointBase ): SharedFlowIntegrationPoint {
        // Get the type using the static method
        const integrationType = ( point.constructor as typeof FlowIntegrationPointBase ).getType();

        // Base serialization matching SharedFlowIntegrationPoint
        const serializedPoint: SharedFlowIntegrationPoint = {
            flowName: point.flowName,
            description: point.description,
            sourceState: point.sourceState,
            targetState: point.targetState,
            transition: point.transition,
            requiredData: point.requiredData,
            integrationType: integrationType // Add the type (STANDARD or COMMAND)
            // eventName will be added conditionally below
        };

        // If it's a command type, add the commandName
        if ( integrationType === UIEFlowIntegrationPointType.COMMAND && point instanceof FlowIntegrationPointCommand ) {
             serializedPoint.commandName = point.commandName;
        }

        // ADDED: If point has an eventName property, add it
        if ( "eventName" in point && typeof point.eventName === "string" ) {
            serializedPoint.eventName = point.eventName;
        }

        return serializedPoint;
    }

    public getTargetFlowName( transition: TTransition ): string | undefined {
        const constructor = this.constructor as typeof UIFlowBase;
        const handoffPoints = constructor.getHandoffPoints?.() || [];
        const entryPoints = constructor.getEntryPoints?.() || [];

        const handoffPoint = handoffPoints.find( point => point.transition === transition );
        if ( handoffPoint ) {
            return handoffPoint.flowName;
        }

        const entryPoint = entryPoints.find( point => point.transition === transition );
        if ( entryPoint ) {
            return entryPoint.flowName;
        }

        return undefined;
    }
}
