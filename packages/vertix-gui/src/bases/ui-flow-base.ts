import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";
import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

import { UIInstanceTypeBase } from "@vertix.gg/gui/src/bases/ui-instance-type-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { PermissionsBitField, ChannelType } from "discord.js";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { FlowComponent as SharedFlowComponent, FlowData as SharedFlowData, FlowIntegrationPoint as SharedFlowIntegrationPoint, VisualConnection } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

export enum UIEFlowIntegrationPointType {
    GENERIC = "GENERIC",
    COMMAND = "COMMAND",
    EVENT = "EVENT",
}

interface FlowIntegrationPointBaseOptions {
    flowName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
}

export type UIFlowState = string;
export type UIFlowTransition = string;

export interface UIFlowData {
    originFlow?: string;
    originState?: string;
    originTransition?: string;
    interactionId?: string;
    [key: string]: unknown;
}

export abstract class FlowIntegrationPointBase extends ObjectBase {
    public readonly flowName: string;
    public readonly description: string;
    public readonly sourceState?: string;
    public readonly targetState?: string;
    public readonly transition?: string;
    public readonly requiredData?: string[];

    protected constructor( options: FlowIntegrationPointBaseOptions ) {
        super();
        this.flowName = options.flowName;
        this.description = options.description;
        this.sourceState = options.sourceState;
        this.targetState = options.targetState;
        this.transition = options.transition;
        this.requiredData = options.requiredData;
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointBase";
    }

    public static getType(): UIEFlowIntegrationPointType {
        throw new ForceMethodImplementation( this.name, "getType" );
    }
}

export class FlowIntegrationPointGeneric extends FlowIntegrationPointBase {
    public constructor( options: FlowIntegrationPointBaseOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointGeneric";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.GENERIC;
    }
}

export class FlowIntegrationPointCommand extends FlowIntegrationPointBase {
    public constructor( options: FlowIntegrationPointBaseOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointCommand";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.COMMAND;
    }
}

export class FlowIntegrationPointEvent extends FlowIntegrationPointBase {
    public constructor( options: FlowIntegrationPointBaseOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointEvent";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.EVENT;
    }
}

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

    public static getEntryPoints?(): FlowIntegrationPointBase[] {
        return [];
    }

    public static getHandoffPoints?(): FlowIntegrationPointBase[] {
        return [];
    }

    public static getExternalReferences?(): Record<string, string> {
        return {};
    }

    public static getFlowType(): "ui" | "system" | string {
        return "ui";
    }

    public abstract getPermissions(): PermissionsBitField;

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

    public abstract getAvailableTransitions(): TTransition[];

    public abstract getNextState( transition: TTransition ): TState;

    public abstract getRequiredData( transition: TTransition ): ( keyof TData )[];

    public isTransitionValid( transition: TTransition ): boolean {
        return this.getAvailableTransitions().includes( transition );
    }

    public isDataValid( transition: TTransition ): boolean {
        const requiredData = this.getRequiredData( transition );
        return requiredData.every( ( key ) => key in this.data );
    }

    public transition( transition: TTransition ): void {
        this.currentState = this.getNextState( transition );
    }

    public updateData( data: Partial<TData> ): void {
        this.data = { ...this.data, ...data };
    }

    public getCurrentState(): TState {
        return this.currentState;
    }

    public getData(): TData {
        return this.data;
    }

    public getComponents() {
        return ( this.constructor as typeof UIFlowBase ).getComponents();
    }

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

    public static getNextStates?(): Record<string, string>;

    public static getVisualConnections?(): VisualConnection[];

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

    private serializeIntegrationPointForEditor( point: FlowIntegrationPointBase ): SharedFlowIntegrationPoint {
        const integrationType = ( point.constructor as typeof FlowIntegrationPointBase ).getType();

        const serializedPoint: SharedFlowIntegrationPoint = {
            fullName: point.flowName,
            flowName: point.flowName,
            description: point.description,
            sourceState: point.sourceState,
            targetState: point.targetState,
            transition: point.transition,
            requiredData: point.requiredData,
            type: integrationType,
        };

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
