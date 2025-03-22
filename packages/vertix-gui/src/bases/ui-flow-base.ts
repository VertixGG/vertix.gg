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
    [key: string]: unknown;
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

    public getPermissions(): PermissionsBitField {
        throw new ForceMethodImplementation( "UIFlowBase", "getPermissions" );
    }

    public getChannelTypes(): ChannelType[] {
        throw new ForceMethodImplementation( "UIFlowBase", "getChannelTypes" );
    }

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
     * Execute a transition
     */
    public transition( transition: TTransition ): void {
        if ( !this.isTransitionValid( transition ) ) {
            throw new Error( `Invalid transition '${ transition }' from state '${ this.currentState }'` );
        }

        if ( !this.isDataValid( transition ) ) {
            throw new Error( `Missing required data for transition '${ transition }'` );
        }

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
     */
    public async toJSON() {
        const transactions = this.getAvailableTransitions();
        const requiredDataMap: Record<string, ( keyof TData )[]> = {};

        // Get required data for each transaction
        for ( const transaction of transactions ) {
            requiredDataMap[ transaction as string ] = this.getRequiredData( transaction );
        }

        return {
            transactions,
            requiredData: requiredDataMap,
            schema: await this.buildSchema()
        };
    }
}
