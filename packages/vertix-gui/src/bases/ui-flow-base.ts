import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIAdapterEntityBase } from "@vertix.gg/gui/src/bases/ui-adapter-entity-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { PermissionsBitField, ChannelType } from "discord.js";

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
 * Base class for UI flows
 */
export abstract class UIFlowBase<
    TState extends string,
    TTransition extends string,
    TData extends UIFlowData = UIFlowData
> extends UIAdapterEntityBase {
    private currentState: TState;
    private readonly transitions: Map<TState, Set<TTransition>> = new Map();
    private data: TData;

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.currentState = this.getInitialState();
        this.data = this.getInitialData();

        this.initializeTransitions();
    }

    public static getName(): string {
        return "VertixGUI/UIFlowBase";
    }

    public static getComponent(): any {
        throw new ForceMethodImplementation( "UIFlowBase", "getComponent" );
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

    public getPermissions(): PermissionsBitField {
        throw new ForceMethodImplementation( "UIFlowBase", "getPermissions" );
    }

    public getChannelTypes(): ChannelType[] {
        throw new ForceMethodImplementation( "UIFlowBase", "getChannelTypes" );
    }

    protected abstract getInitialState(): TState;
    protected abstract getInitialData(): TData;
    protected abstract initializeTransitions(): void;
    protected abstract showModal(): Promise<void>;

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
     * Build schema from component
     */
    public async buildSchema() {
        await this.getComponent().waitUntilInitialized();
        const schema = await this.getComponent().build( {} );
        return schema;
    }

    /**
     * Convert flow to JSON representation
     * Includes integration points and external references
     */
    public async toJSON() {
        const transactions = this.getAvailableTransitions();
        const requiredDataMap: Record<string, ( keyof TData )[]> = {};

        for ( const transaction of transactions ) {
            requiredDataMap[ transaction as string ] = this.getRequiredData( transaction );
        }

        // Include integration points if defined
        const entryPoints = ( this.constructor as typeof UIFlowBase ).getEntryPoints?.() || [];
        const handoffPoints = ( this.constructor as typeof UIFlowBase ).getHandoffPoints?.() || [];
        const externalRefs = ( this.constructor as typeof UIFlowBase ).getExternalReferences?.() || {};

        return {
            name: ( this.constructor as typeof UIFlowBase ).getName(),
            currentState: this.currentState,
            transactions,
            requiredData: requiredDataMap,
            integrations: {
                entryPoints,
                handoffPoints,
                externalReferences: externalRefs
            },
            schema: await this.buildSchema()
        };
    }
}
