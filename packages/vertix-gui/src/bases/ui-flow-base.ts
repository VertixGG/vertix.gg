import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";
import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIEFlowIntegrationPointType } from "@vertix.gg/definitions/src/ui-flow-definitions";

import { UIInstanceTypeBase } from "@vertix.gg/gui/src/bases/ui-instance-type-base";

import type { UISerializationFlowComponent, UISerializationComponentSchemaResult, UISerializationModalSchema, UISerializationModalFieldSchema, UISerializationFlowModal, UISerializationFlowModalField, UISerializationFlowAttributeValue, UISerializationFlowAttributes, UISerializationContext } from "@vertix.gg/definitions/src/ui-serialization-definitions";
import type { UIFlowIntegrationPoint, UIFlowDataBase, UIFlowInputRequirement, UIFlowInputRequirementDefinition, UIFlowVisualConnection, UIFlowDataBlueprint } from "@vertix.gg/definitions/src/ui-flow-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { PermissionsBitField, ChannelType } from "discord.js";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { SerializationContext } from "@vertix.gg/gui/src/bases/ui-serialization";

export abstract class UIFlowIntegrationPointBase extends ObjectBase {
    public readonly flowName: string;
    public readonly description: string;
    public readonly sourceState?: string;
    public readonly targetState?: string;
    public readonly transition?: string;
    public readonly requiredData?: string[];

    protected constructor( options: UIFlowIntegrationPointBaseOptions ) {
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

export class FlowIntegrationPointGeneric extends UIFlowIntegrationPointBase {
    public constructor( options: UIFlowIntegrationPointBaseOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointGeneric";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.GENERIC;
    }
}

export class FlowIntegrationPointCommand extends UIFlowIntegrationPointBase {
    public constructor( options: UIFlowIntegrationPointBaseOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointCommand";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.COMMAND;
    }
}

export class FlowIntegrationPointEvent extends UIFlowIntegrationPointBase {
    public constructor( options: UIFlowIntegrationPointBaseOptions ) {
        super( options );
    }

    public static override getName(): string {
        return "VertixGUI/FlowIntegrationPointEvent";
    }

    public static override getType(): UIEFlowIntegrationPointType {
        return UIEFlowIntegrationPointType.EVENT;
    }
}

// Define type for Controller Constructor
// type ControllerClassConstructor = new (options: any) => UIControllerBase<any>; // Removed

export abstract class UIFlowBase<
    TState extends string,
    TTransition extends string,
    TData extends UIFlowDataBase = UIFlowDataBase
> extends UIInstanceTypeBase {
    protected logger: Logger;
    private currentState: TState;
    private readonly transitions: Map<TState, Set<TTransition>> = new Map();
    private data: TData;

    public constructor( protected options: TAdapterRegisterOptions ) {
        super();

        this.logger = new Logger( this );

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

    public static getEntryPoints?(): UIFlowIntegrationPointBase[] {
        return [];
    }

    public static getHandoffPoints?(): UIFlowIntegrationPointBase[] {
        return [];
    }

    public static getExternalReferences?(): Record<string, string> {
        return {};
    }

    /**
     * Optional mapping of adapters to UIData components this flow relies on
     * for runtime/export arg hydration.
     *
     * Returns an array of tuples: [adapterName, dataComponentName].
     */
    public static getArgsDataProviders?(): Array<[ string, string ]> {
        return [];
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

    public async buildComponentSchemas( components = this.getComponents(), context?: SerializationContext ): Promise<UISerializationComponentSchemaResult[]> {
        const schemas: UISerializationComponentSchemaResult[] = [];

        for ( const Component of components ) {
            try {
                const component = new Component();
                const serializedSchema = await component.toSchema( context );

                if ( !serializedSchema ) {
                    this.logger.warn( this.buildComponentSchemas, `Component ${ Component.name } returned null schema` );
                    continue;
                }

                const normalizedModals = this.normalizeModalSchemas(
                    serializedSchema.entities?.modals as UISerializationModalSchema[] | undefined
                );

                // Preserve existing entities and merge normalized modals
                const entities = serializedSchema.entities || normalizedModals
                    ? {
                        elements: serializedSchema.entities?.elements as any,
                        embeds: serializedSchema.entities?.embeds as any,
                        modals: normalizedModals ?? serializedSchema.entities?.modals
                    }
                    : undefined;

                const schema: UISerializationComponentSchemaResult = {
                    name: serializedSchema.name,
                    type: serializedSchema.type,
                    entities,
                    components: ( serializedSchema.components ?? [] ) as UISerializationFlowComponent[]
                };

                // Ensure schema has required fields before adding
                if ( schema && schema.name && schema.type ) {
                    schemas.push( schema );
                } else {
                    this.logger.warn( this.buildComponentSchemas, `Component ${ Component.name } schema missing required fields:`, schema );
                }
            } catch( error ) {
                this.logger.error( this.buildComponentSchemas, `Error serializing component ${ Component.name }:`, error );
            }
        }

        return schemas.length ? schemas : [];
    }

    private normalizeModalSchemas(
        modalSchemas?: UISerializationModalSchema[]
    ): UISerializationFlowModal[] | undefined {
        if ( !modalSchemas?.length ) {
            return undefined;
        }

        const normalized = modalSchemas
            .map( ( modal ) => {
                const entities = modal.entities;
                if ( !Array.isArray( entities ) ) {
                    return {
                        name: modal.name ?? "Modal",
                        type: modal.type ?? "modal",
                        attributes: ( modal as { attributes?: UISerializationFlowAttributes } ).attributes ?? {},
                        entities: []
                    };
                }

                const normalizedRows = entities
                    .map( ( row: Array<UISerializationModalFieldSchema | undefined> | undefined ) => {
                        if ( !Array.isArray( row ) ) {
                            return [];
                        }

                        return row
                            .filter( Boolean )
                            .map( ( field ) => this.normalizeModalField( field ) );
                    } )
                    .filter( ( row ): row is UISerializationFlowModalField[] => row.length > 0 );

                return {
                    name: modal.name ?? "Modal",
                    type: modal.type ?? "modal",
                    attributes: ( modal as { attributes?: UISerializationFlowAttributes } ).attributes ?? {},
                    entities: normalizedRows
                };
            } )
            .filter( Boolean ) as UISerializationFlowModal[];

        return normalized.length ? normalized : undefined;
    }

    private normalizeModalField( field: UISerializationModalFieldSchema | UISerializationFlowModalField | undefined ): UISerializationFlowModalField {
        if ( !field ) {
            return {
                name: "Field",
                type: "text-input",
                attributes: {}
            };
        }

        const fieldRecord = field as Record<string, UISerializationFlowAttributeValue>;
        const nestedAttributes = fieldRecord.attributes;
        const attributes: UISerializationFlowAttributes = (
            nestedAttributes &&
            typeof nestedAttributes === "object" &&
            !Array.isArray( nestedAttributes )
        )
            ? nestedAttributes as UISerializationFlowAttributes
            : fieldRecord as UISerializationFlowAttributes;

        const nameFromRecord = typeof fieldRecord.name === "string"
            ? fieldRecord.name
            : undefined;
        const customId = typeof attributes.custom_id === "string" && attributes.custom_id.length
            ? attributes.custom_id
            : undefined;
        const label = typeof attributes.label === "string" && attributes.label.length
            ? attributes.label
            : undefined;
        const resolvedName = ( customId ?? label ?? nameFromRecord ?? "Field" ).toString();

        const explicitType = fieldRecord.type ?? attributes.type;
        const resolvedType = typeof explicitType === "number"
            ? explicitType.toString()
            : ( explicitType?.toString() ?? "text-input" );

        const normalizedField: UISerializationFlowModalField = {
            name: resolvedName,
            type: resolvedType,
            attributes
        };

        const isDisabled =
            typeof fieldRecord.isAvailable === "boolean"
                ? !fieldRecord.isAvailable
                : ( typeof attributes.disabled === "boolean" ? attributes.disabled : undefined );

        if ( typeof isDisabled === "boolean" ) {
            normalizedField.isAvailable = !isDisabled;
        }

        return normalizedField;
    }

    public static getNextStates?(): Record<string, string>;

    /**
     * Defines mappings from transitions to specific UI elements that trigger them visually.
     * Used by the flow editor to determine the source handle for inter-flow edges.
     * @returns An array of VisualConnection objects (or a compatible structure).
     */
    public static getEdgeSourceMappings?(): UIFlowVisualConnection[];

    public async toJSON( context?: UISerializationContext ): Promise<UIFlowDataBlueprint> {
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
        const builtComponents = await this.buildComponentSchemas( this.getComponents(), context );
        const edgeSourceMappings = constructor.getEdgeSourceMappings?.() || [];
        const inputRequirements = constructor.getInputRequirements?.() || [];

        const flowDataResult: UIFlowDataBlueprint = {
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
            components: builtComponents as UISerializationFlowComponent[],
            edgeSourceMappings
        };

        if ( inputRequirements.length ) {
            flowDataResult.inputRequirements = inputRequirements as UIFlowInputRequirement[];
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
        if ( !flowDataResult.edgeSourceMappings?.length ) {
            delete flowDataResult.edgeSourceMappings;
        }

        return flowDataResult;
    }

    private serializeIntegrationPointForEditor( point: UIFlowIntegrationPointBase ): UIFlowIntegrationPoint {
        const integrationType = ( point.constructor as typeof UIFlowIntegrationPointBase ).getType();

        const serializedPoint: UIFlowIntegrationPoint = {
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

    /**
     * Returns the string names/keys of the UIDataBase components required by this flow.
     * Controllers can use this to fetch necessary data components from UIDataService.
     */
    public static getRequiredDataComponents(): string[] {
        return []; // Default to no data components required
    }

    public static getInputRequirements(): UIFlowInputRequirementDefinition[] {
        return [];
    }
}

interface UIFlowIntegrationPointBaseOptions {
    flowName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
}

