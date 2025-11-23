import { PermissionsBitField, ChannelType } from "discord.js";

import {
    UIFlowBase,
    UIWizardFlowBase,
    FlowIntegrationPointGeneric,
    FlowIntegrationPointCommand,
    FlowIntegrationPointEvent,
    FlowIntegrationPointBase
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { uiClassRegistry } from "@vertix.gg/gui/src/runtime/ui-class-registry";

import type {
    HydratedFlow,
    RuntimeFlowState,
    RuntimeFlowIntegrationPoint,
    FlowConstructor
} from "@vertix.gg/gui/src/runtime/ui-definition-runtime";
import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    FlowEdgeSourceMappingDefinition,
    JsonObject,
    JsonValue
} from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { RegisterableClass } from "@vertix.gg/gui/src/runtime/ui-class-registry";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

type FlowIntegrationPointBuilder = new ( options: {
    flowName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
} ) => FlowIntegrationPointBase;

const INTEGRATION_POINT_BY_TYPE: Record<string, FlowIntegrationPointBuilder> = {
    GENERIC: FlowIntegrationPointGeneric,
    COMMAND: FlowIntegrationPointCommand,
    EVENT: FlowIntegrationPointEvent
};

const WIZARD_BASE_TRANSITIONS = new Set( [
    "VertixGUI/UIWizardFlowBase/Transitions/Next",
    "VertixGUI/UIWizardFlowBase/Transitions/Back",
    "VertixGUI/UIWizardFlowBase/Transitions/Finish",
    "VertixGUI/UIWizardFlowBase/Transitions/Error"
] );

function assertComponentConstructor( candidate: RegisterableClass<object>, description: string ): asserts candidate is UIComponentTypeConstructor {
    if ( !( candidate.prototype instanceof UIComponentBase ) ) {
        const candidateName = typeof candidate.getName === "function" ? candidate.getName() : "unknown";
        throw new Error( `DataDrivenFlowFactory: ${ description } does not extend '${ UIComponentBase.getName() }' (received '${ candidateName }')` );
    }
}

function cloneJsonValue<T extends JsonValue>( value: T ): T {
    if ( Array.isArray( value ) ) {
        return value.map( ( item ) => cloneJsonValue( item ) ) as T;
    }
    if ( value && typeof value === "object" ) {
        const result: JsonObject = {};
        for ( const key of Object.keys( value as JsonObject ) ) {
            result[ key ] = cloneJsonValue( ( value as JsonObject )[ key ] );
        }
        return result as T;
    }
    return value;
}

function cloneJsonObjectValue( value: JsonObject | undefined ): JsonObject | undefined {
    if ( !value ) {
        return undefined;
    }
    const cloned: JsonObject = {};
    for ( const key of Object.keys( value ) ) {
        cloned[ key ] = cloneJsonValue( value[ key ] );
    }
    return cloned;
}

function parsePermissions( value: string | number | null | undefined ): bigint | undefined {
    if ( value === null || value === undefined ) {
        return undefined;
    }
    if ( typeof value === "string" ) {
        return BigInt( value );
    }
    return BigInt( value );
}

function parseChannelTypes( values: string[] | undefined ): ChannelType[] {
    if ( !values?.length ) {
        return [];
    }
    return values.map( ( entry ) => resolveChannelType( entry ) );
}

function resolveChannelType( entry: string ): ChannelType {
    if ( Object.prototype.hasOwnProperty.call( ChannelType, entry ) ) {
        const resolved = ChannelType[ entry as keyof typeof ChannelType ];
        if ( typeof resolved === "number" ) {
            return resolved as ChannelType;
        }
    }
    const inferred = Number( entry );
    if ( !Number.isNaN( inferred ) && Object.prototype.hasOwnProperty.call( ChannelType, inferred ) ) {
        return inferred as ChannelType;
    }
    throw new Error( `DataDrivenFlowFactory: unsupported channel type '${ entry }'` );
}

function buildIntegrationPoints( points: RuntimeFlowIntegrationPoint[] ): FlowIntegrationPointBase[] {
    return points.map( ( point ) => {
        const builder = INTEGRATION_POINT_BY_TYPE[ point.type ] ?? FlowIntegrationPointGeneric;
        return new builder( {
            flowName: point.definition.flowName,
            description: point.definition.description,
            sourceState: point.definition.sourceState,
            targetState: point.definition.targetState,
            transition: point.definition.transition,
            requiredData: point.definition.requiredData
        } );
    } );
}

function collectStateComponents( states: RuntimeFlowState[] ): Map<string, UIComponentTypeConstructor> {
    const components = new Map<string, UIComponentTypeConstructor>();
    for ( const state of states ) {
        if ( !state.componentRef ) {
            continue;
        }
        const candidate = state.componentRef.Class;
        assertComponentConstructor( candidate, `component '${ state.componentRef.name }'` );
        components.set( state.componentRef.name, candidate );
    }
    return components;
}

function resolveStepComponents(
    definitionComponents: string[] | undefined,
    stepStates: string[],
    stateComponentMap: Map<string, UIComponentTypeConstructor>
): UIComponentTypeConstructor[] {
    if ( definitionComponents?.length ) {
        return definitionComponents.map( ( name ) => {
            const ClassCtor = uiClassRegistry.getClass( name );
            assertComponentConstructor( ClassCtor, `step component '${ name }'` );
            return ClassCtor;
        } );
    }
    return stepStates.map( ( state ) => {
        const component = stateComponentMap.get( state );
        if ( !component ) {
            throw new Error( `DataDrivenFlowFactory: missing component mapping for wizard state '${ state }'` );
        }
        return component;
    } );
}

function buildStateTransitions( states: RuntimeFlowState[] ): Map<string, string[]> {
    const transitions = new Map<string, string[]>();
    for ( const state of states ) {
        transitions.set( state.definition.key, [ ...( state.definition.transitions ?? [] ) ] );
    }
    return transitions;
}

function buildTransitionTargets( transitions: HydratedFlow["transitions"] ): Map<string, string> {
    const map = new Map<string, string>();
    for ( const transition of transitions ) {
        map.set( transition.definition.from, transition.definition.to );
    }
    return map;
}

function buildRequiredDataMap( requiredData: HydratedFlow["requiredData"] ): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for ( const item of requiredData ) {
        map.set( item.definition.transition, [ ...( item.definition.fields ?? [] ) ] );
    }
    return map;
}

function buildEdgeSourceMappings( mappings: FlowEdgeSourceMappingDefinition[] | undefined ): FlowEdgeSourceMappingDefinition[] {
    if ( !mappings?.length ) {
        return [];
    }
    return mappings.map( ( mapping ) => ( {
        triggeringElementId: mapping.triggeringElementId,
        transitionName: mapping.transitionName,
        targetFlowName: mapping.targetFlowName,
        options: cloneJsonObjectValue( mapping.options )
    } ) );
}

function buildExternalReferences( references: Record<string, string> | undefined ): Record<string, string> | undefined {
    if ( !references ) {
        return undefined;
    }
    const cloned: Record<string, string> = {};
    for ( const key of Object.keys( references ) ) {
        cloned[ key ] = references[ key ];
    }
    return cloned;
}

function buildNextStatesMap( transitions: Map<string, string> ): Record<string, string> {
    const result: Record<string, string> = {};
    transitions.forEach( ( value, key ) => {
        result[ key ] = value;
    } );
    return result;
}

function buildFlowTransitionsMap( stateTransitions: Map<string, string[]> ): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    stateTransitions.forEach( ( value, key ) => {
        result[ key ] = [ ...value ];
    } );
    return result;
}

function cloneInitialData( value: JsonObject | undefined ): JsonObject | undefined {
    return cloneJsonObjectValue( value );
}

function isWizardFlow( flowKind: string ): boolean {
    return flowKind.trim().toLowerCase() === "wizard";
}

function dedupeComponents( components: Iterable<UIComponentTypeConstructor> ): UIComponentTypeConstructor[] {
    const unique = new Map<string, UIComponentTypeConstructor>();
    for ( const component of components ) {
        unique.set( component.getName(), component );
    }
    return [ ...unique.values() ];
}

export function createFlowClass( hydrated: HydratedFlow ): FlowConstructor {
    const baseTransitions = buildStateTransitions( hydrated.states );
    const transitionTargets = buildTransitionTargets( hydrated.transitions );
    const requiredDataMap = buildRequiredDataMap( hydrated.requiredData );
    const integrationEntryPoints = buildIntegrationPoints( hydrated.entryPoints );
    const integrationHandoffPoints = buildIntegrationPoints( hydrated.handoffPoints );
    const edgeSourceMappings = buildEdgeSourceMappings( hydrated.edgeSourceMappings );
    const externalReferences = buildExternalReferences( hydrated.externalReferences );
    const permissionsBits = parsePermissions( hydrated.permissions );
    const channelTypes = parseChannelTypes( hydrated.channelTypes );
    const flowType = hydrated.flowType ?? hydrated.definition.flowType ?? hydrated.definition.flowKind ?? "ui";
    const initialDataTemplate = cloneInitialData( hydrated.initialData );
    const requiredDataComponents = hydrated.requiredDataComponents ? [ ...hydrated.requiredDataComponents ] : [];
    const stateComponentMap = collectStateComponents( hydrated.states );
    const flowComponents = dedupeComponents( stateComponentMap.values() );
    const nextStatesRecord = buildNextStatesMap( transitionTargets );
    const flowTransitionsRecord = buildFlowTransitionsMap( baseTransitions );

    if ( isWizardFlow( hydrated.definition.flowKind ) ) {
        const wizardStepStates = hydrated.definition.stepStates
            ? [ ...hydrated.definition.stepStates ]
            : [ ...stateComponentMap.keys() ];
        const wizardStepComponents = resolveStepComponents(
            hydrated.definition.stepComponents,
            wizardStepStates,
            stateComponentMap
        );
        const customTransitionsByState = new Map<string, string[]>();
        for ( const state of wizardStepStates ) {
            const transitions = baseTransitions.get( state ) ?? [];
            const custom = transitions.filter( ( transition ) => !WIZARD_BASE_TRANSITIONS.has( transition ) );
            customTransitionsByState.set( state, custom );
        }

        class DataDrivenWizardFlow extends UIWizardFlowBase<string, string> {
            public static override getName() {
                return hydrated.definition.name;
            }

            public static getFlowTransitions() {
                return flowTransitionsRecord;
            }

            public static getNextStates() {
                return nextStatesRecord;
            }

            public static override getEntryPoints() {
                return integrationEntryPoints;
            }

            public static override getHandoffPoints() {
                return integrationHandoffPoints;
            }

            public static override getExternalReferences() {
                return externalReferences;
            }

            public static override getEdgeSourceMappings() {
                return edgeSourceMappings;
            }

            public static override getRequiredDataComponents() {
                return requiredDataComponents;
            }

            public static override getFlowType() {
                return flowType;
            }

        public constructor( options: TAdapterRegisterOptions ) {
                super( options );
            }

            public override getStepComponents() {
                return wizardStepComponents;
            }

            public override getPermissions() {
                return permissionsBits === undefined ? new PermissionsBitField() : new PermissionsBitField( permissionsBits );
            }

            public override getChannelTypes() {
                return [ ...channelTypes ];
            }

            protected override getInitialState() {
                return hydrated.definition.initialState;
            }

            protected override getInitialData() {
                return cloneInitialData( initialDataTemplate ) ?? {};
            }

            protected override initializeTransitions(): void {
                baseTransitions.forEach( ( transitions, state ) => {
                    this.setTransitionsForState( state, new Set( transitions ) );
                } );
            }

            public override getAvailableTransitions(): string[] {
                const currentState = this.getCurrentState();
                const baseList = super.getAvailableTransitions();
                const stateSpecific = baseTransitions.get( currentState ) ?? [];
                const merged = new Set<string>( [ ...baseList, ...stateSpecific ] );
                return [ ...merged ];
            }

            public override getNextState( transition: string ): string {
                const target = transitionTargets.get( transition );
                if ( target ) {
                    return target;
                }
                throw new Error( `DataDrivenFlowFactory: transition '${ transition }' has no target state` );
            }

            public override getRequiredData( transition: string ): string[] {
                return [ ...( requiredDataMap.get( transition ) ?? [] ) ];
            }

            protected override getCustomTransitionsForStep( step: number ): string[] {
                const state = wizardStepStates[ step ];
                if ( !state ) {
                    return [];
                }
                return [ ...( customTransitionsByState.get( state ) ?? [] ) ];
            }
        }

        uiClassRegistry.register( DataDrivenWizardFlow as RegisterableClass<object> );

        return DataDrivenWizardFlow;
    }

    class DataDrivenFlow extends UIFlowBase<string, string> {
        private static readonly components = flowComponents;

        public static override getName() {
            return hydrated.definition.name;
        }

        public static getFlowTransitions() {
            return flowTransitionsRecord;
        }

        public static getNextStates() {
            return nextStatesRecord;
        }

        public static override getComponents() {
            return DataDrivenFlow.components;
        }

        public static override getEntryPoints() {
            return integrationEntryPoints;
        }

        public static override getHandoffPoints() {
            return integrationHandoffPoints;
        }

        public static override getExternalReferences() {
            return externalReferences;
        }

        public static override getEdgeSourceMappings() {
            return edgeSourceMappings;
        }

        public static override getRequiredDataComponents() {
            return requiredDataComponents;
        }

        public static override getFlowType() {
            return flowType;
        }

        public constructor( options: TAdapterRegisterOptions ) {
            super( options );
        }

        public override getPermissions() {
            return permissionsBits === undefined ? new PermissionsBitField() : new PermissionsBitField( permissionsBits );
        }

        public override getChannelTypes() {
            return [ ...channelTypes ];
        }

        protected override getInitialState() {
            return hydrated.definition.initialState;
        }

        protected override getInitialData() {
            return cloneInitialData( initialDataTemplate ) ?? {};
        }

        protected override initializeTransitions(): void {
            baseTransitions.forEach( ( transitions, state ) => {
                this.setTransitionsForState( state, new Set( transitions ) );
            } );
        }

        public override getAvailableTransitions(): string[] {
            const state = this.getCurrentState();
            return [ ...( baseTransitions.get( state ) ?? [] ) ];
        }

        public override getNextState( transition: string ): string {
            const target = transitionTargets.get( transition );
            if ( target ) {
                return target;
            }
            throw new Error( `DataDrivenFlowFactory: transition '${ transition }' has no target state` );
        }

        public override getRequiredData( transition: string ): string[] {
            return [ ...( requiredDataMap.get( transition ) ?? [] ) ];
        }
    }

    uiClassRegistry.register( DataDrivenFlow as RegisterableClass<object> );

    return DataDrivenFlow;
}


