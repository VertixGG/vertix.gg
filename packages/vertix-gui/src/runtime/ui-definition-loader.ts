import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { uiClassRegistry } from "@vertix.gg/gui/src/runtime/ui-class-registry";

import { interactionHandlerRegistry } from "@vertix.gg/gui/src/runtime/interaction-handler-registry";
import { createComponentClass } from "@vertix.gg/gui/src/runtime/data-driven-component-factory";
import { createExecutionAdapter } from "@vertix.gg/gui/src/runtime/data-driven-adapter-factory";
import { createFlowClass } from "@vertix.gg/gui/src/runtime/data-driven-flow-factory";

import type {
    AdapterDefinition,
    ComponentDefinition,
    FlowDefinition,
    JsonObject,
    JsonValue,
    BindingDefinition,
    ExecutionStepDefinition,
    ElementsGroupDefinition,
    ElementReference,
    EmbedsGroupDefinition,
    EmbedReference,
    HookReference,
    FlowStateDefinition,
    FlowTransitionDefinition,
    FlowRequiredDataDefinition,
    FlowIntegrationPointDefinition,
    FlowEdgeSourceMappingDefinition,
    FlowIntegrationPointType,
    BindingFlowTriggerDefinition,
    FlowTriggerDefinition,
    FlowContextMutationDefinition,
    FlowNavigationDefinition
} from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type {
    HydratedAdapter,
    HydratedComponent,
    HydratedFlow,
    HydratedEmbedAudit,
    RuntimeBinding,
    RuntimeClassRef,
    RuntimeElementsGroup,
    RuntimeEmbedsGroup,
    RuntimeElement,
    RuntimeEmbed,
    RuntimeExecutionStep,
    RuntimeHook,
    RuntimeFlowState,
    RuntimeFlowTransition,
    RuntimeFlowRequiredData,
    RuntimeFlowIntegrationPoint,
    RuntimeFlowTrigger,
    RuntimeHandler
} from "@vertix.gg/gui/src/runtime/ui-definition-runtime";

type LoaderMode = "mongo" | "static";

const WIZARD_BASE_TRANSITIONS = new Set( [
    "VertixGUI/UIWizardFlowBase/Transitions/Next",
    "VertixGUI/UIWizardFlowBase/Transitions/Back",
    "VertixGUI/UIWizardFlowBase/Transitions/Finish",
    "VertixGUI/UIWizardFlowBase/Transitions/Error"
] );

interface GenericCollection<T extends object> {
    findOne( filter: { name: string } ): Promise<T | null>;
}

interface LoaderOptions {
    mode: LoaderMode;
    componentsCollection?: GenericCollection<ComponentDefinition>;
    adaptersCollection?: GenericCollection<AdapterDefinition>;
    flowsCollection?: GenericCollection<FlowDefinition>;
}

type CachedInstance<T extends object> = {
    value: T;
    updatedAt: number;
};

export class UIDefinitionLoader extends InitializeBase {
    private readonly mode: LoaderMode;

    private readonly componentsCollection?: GenericCollection<ComponentDefinition>;
    private readonly adaptersCollection?: GenericCollection<AdapterDefinition>;
    private readonly flowsCollection?: GenericCollection<FlowDefinition>;

    private readonly componentCache = new Map<string, CachedInstance<HydratedComponent>>();
    private readonly adapterCache = new Map<string, CachedInstance<HydratedAdapter>>();
    private readonly flowCache = new Map<string, CachedInstance<HydratedFlow>>();

    public static override getName(): string {
        return "VertixGUI/Runtime/UIDefinitionLoader";
    }

    public constructor( options: LoaderOptions ) {
        super( false );
        this.mode = options.mode;
        this.componentsCollection = options.componentsCollection;
        this.adaptersCollection = options.adaptersCollection;
        this.flowsCollection = options.flowsCollection;
    }

    public async loadComponent( name: string ): Promise<HydratedComponent> {
        if ( "static" === this.mode ) {
            throw new Error( "UIDefinitionLoader: static mode not supported for component definitions" );
        }

        const cached = this.componentCache.get( name );

        if ( cached ) {
            return cached.value;
        }

        const document = await this.componentsCollection?.findOne( { name } );

        if ( !document ) {
            throw new Error( `UIDefinitionLoader: component '${ name }' not found` );
        }

        const instance = this.hydrateComponent( document );

        instance.componentClass = createComponentClass( instance );

        this.componentCache.set( name, { value: instance, updatedAt: Date.now() } );

        return instance;
    }

    public async loadAdapter( name: string ): Promise<HydratedAdapter> {
        if ( "static" === this.mode ) {
            throw new Error( "UIDefinitionLoader: static mode not supported for adapter definitions" );
        }

        const cached = this.adapterCache.get( name );

        if ( cached ) {
            return cached.value;
        }

        const document = await this.adaptersCollection?.findOne( { name } );

        if ( !document ) {
            throw new Error( `UIDefinitionLoader: adapter '${ name }' not found` );
        }

        const instance = this.hydrateAdapter( document );
        const component = await this.loadComponent( document.component );
        const componentClass = component.componentClass;

        if ( !componentClass ) {
            throw new Error( `UIDefinitionLoader: component '${ document.component }' did not produce a runtime class` );
        }

        instance.componentClass = componentClass;
        instance.adapterClass = createExecutionAdapter( {
            hydrated: instance,
            componentClass: () => componentClass,
            resolveFlowComponent: ( flowName, state ) => this.resolveFlowComponentName( flowName, state )
        } );

        this.adapterCache.set( name, { value: instance, updatedAt: Date.now() } );

        return instance;
    }

    public async loadFlow( name: string ): Promise<HydratedFlow> {
        if ( "static" === this.mode ) {
            throw new Error( "UIDefinitionLoader: static mode not supported for flow definitions" );
        }

        const cached = this.flowCache.get( name );

        if ( cached ) {
            return cached.value;
        }

        const document = await this.flowsCollection?.findOne( { name } );

        if ( !document ) {
            throw new Error( `UIDefinitionLoader: flow '${ name }' not found` );
        }

        const instance = this.hydrateFlow( document );
        instance.flowClass = createFlowClass( instance );

        this.flowCache.set( name, { value: instance, updatedAt: Date.now() } );

        return instance;
    }

    public invalidate( name?: string ): void {
        if ( name ) {
            this.componentCache.delete( name );
            this.adapterCache.delete( name );
            this.flowCache.delete( name );

            return;
        }

        this.componentCache.clear();
        this.adapterCache.clear();
        this.flowCache.clear();
    }

    private hydrateComponent( document: ComponentDefinition ): HydratedComponent {
        const elementsGroups = ( document.elementsGroups ?? [] ).map( ( group ) => this.createRuntimeElementsGroup( group ) );
        const embedsGroups = ( document.embedsGroups ?? [] ).map( ( group ) => this.createRuntimeEmbedsGroup( group ) );
        const modals = ( document.modals ?? [] ).map( ( modal ) => this.createClassRef( modal ) );
        const hooks = ( document.hooks ?? [] ).map( ( hook ) => this.createRuntimeHook( hook ) );

        const definition: ComponentDefinition = {
            name: document.name,
            type: document.type,
            instanceType: document.instanceType,
            modules: document.modules ? [ ...document.modules ] : undefined,
            elementsGroups: elementsGroups.map( ( group ) => group.definition ),
            embedsGroups: embedsGroups.map( ( group ) => group.definition ),
            modals: modals.map( ( modal ) => modal.name ),
            defaultElementsGroup: document.defaultElementsGroup ?? null,
            defaultEmbedsGroup: document.defaultEmbedsGroup ?? null,
            defaultMarkdownsGroup: document.defaultMarkdownsGroup ?? null,
            hooks: hooks.map( ( hook ) => hook.definition ),
            options: document.options ? this.cloneJsonObject( document.options ) : undefined
        };

        const moduleName = document.modules?.[ 0 ];
        const embedAudit = this.extractEmbedAudit( document.options );

        if ( embedAudit ) {
            this.warnMissingEmbedDefinitions( document.name, moduleName, embedAudit );
        }

        return {
            definition,
            elementsGroups,
            embedsGroups,
            modals,
            hooks,
            module: moduleName,
            embedAudit
        };
    }

    private hydrateAdapter( document: AdapterDefinition ): HydratedAdapter {
        const executionSteps = ( document.executionSteps ?? [] ).map( ( step ) => this.createRuntimeExecutionStep( step ) );
        const bindings = ( document.bindings ?? [] ).map( ( binding ) => this.createRuntimeBinding( binding ) );
        const hooks = ( document.hooks ?? [] ).map( ( hook ) => this.createRuntimeHook( hook ) );

        const definition: AdapterDefinition = {
            name: document.name,
            adapterKind: document.adapterKind,
            component: document.component,
            module: document.module,
            instanceType: document.instanceType,
            channelTypes: document.channelTypes ? [ ...document.channelTypes ] : undefined,
            permissions: document.permissions ?? null,
            middlewares: document.middlewares ? [ ...document.middlewares ] : undefined,
            executionSteps: executionSteps.map( ( step ) => step.definition ),
            bindings: bindings.map( ( binding ) => binding.definition ),
            hooks: hooks.map( ( hook ) => hook.definition ),
            options: document.options ? this.cloneJsonObject( document.options ) : undefined
        };

        for ( const binding of bindings ) {
            const flowTriggers = binding.definition.flowTriggers ?? [];

            if ( flowTriggers.length ) {
                this.validateBindingFlowTriggers( document.name, binding.definition.handler, flowTriggers );
            }
        }

        const flowTriggersByHandler = this.collectFlowTriggersByHandler( bindings );

        const adapter: HydratedAdapter = {
            definition,
            executionSteps,
            bindings,
            hooks,
            module: document.module
        };

        if ( flowTriggersByHandler ) {
            adapter.flowTriggersByHandler = flowTriggersByHandler;
        }

        return adapter;
    }

    private hydrateFlow( document: FlowDefinition ): HydratedFlow {
        this.validateFlowDefinition( document );

        const states = ( document.states ?? [] ).map( ( state ) => this.createRuntimeFlowState( state ) );
        const transitions = ( document.transitions ?? [] ).map( ( transition ) => this.createRuntimeFlowTransition( transition ) );
        const requiredData = ( document.requiredData ?? [] ).map( ( item ) => this.createRuntimeFlowRequiredData( item ) );
        const entryPoints = ( document.entryPoints ?? [] ).map( ( entry ) => this.createRuntimeFlowIntegrationPoint( entry ) );
        const handoffPoints = ( document.handoffPoints ?? [] ).map( ( handoff ) => this.createRuntimeFlowIntegrationPoint( handoff ) );
        const hooks = ( document.hooks ?? [] ).map( ( hook ) => this.createRuntimeHook( hook ) );
        const options = document.options ? this.cloneJsonObject( document.options ) : undefined;
        const edgeSourceMappings = ( document.edgeSourceMappings ?? [] ).map( ( mapping ) => this.cloneEdgeSourceMapping( mapping ) );
        const requiredDataComponents = document.requiredDataComponents ? [ ...document.requiredDataComponents ] : undefined;
        const channelTypes = document.channelTypes ? [ ...document.channelTypes ] : undefined;
        const permissions = document.permissions ?? null;
        const initialData = document.initialData ? this.cloneJsonObject( document.initialData ) : undefined;
        const stepStates = document.stepStates ? [ ...document.stepStates ] : undefined;
        const stepComponents = document.stepComponents ? [ ...document.stepComponents ] : undefined;
        const flowType = document.flowType;

        const definition: FlowDefinition = {
            name: document.name,
            module: document.module,
            flowKind: document.flowKind,
            initialState: document.initialState,
            states: states.map( ( state ) => state.definition ),
            transitions: transitions.map( ( transition ) => transition.definition ),
            requiredData: requiredData.map( ( item ) => item.definition ),
            entryPoints: entryPoints.map( ( entry ) => entry.definition ),
            handoffPoints: handoffPoints.length ? handoffPoints.map( ( handoff ) => handoff.definition ) : undefined,
            externalReferences: document.externalReferences ? { ...document.externalReferences } : undefined,
            edgeSourceMappings: edgeSourceMappings.length ? edgeSourceMappings.map( ( mapping ) => mapping ) : undefined,
            requiredDataComponents: requiredDataComponents ? [ ...requiredDataComponents ] : undefined,
            channelTypes: channelTypes ? [ ...channelTypes ] : undefined,
            permissions,
            initialData: initialData ? this.cloneJsonObject( initialData ) : undefined,
            stepStates: stepStates ? [ ...stepStates ] : undefined,
            stepComponents: stepComponents ? [ ...stepComponents ] : undefined,
            flowType,
            hooks: hooks.map( ( hook ) => hook.definition ),
            options
        };

        return {
            definition,
            states,
            transitions,
            requiredData,
            entryPoints,
            handoffPoints,
            hooks,
            externalReferences: definition.externalReferences,
            options,
            requiredDataComponents,
            edgeSourceMappings,
            channelTypes,
            permissions,
            initialData: initialData ? this.cloneJsonObject( initialData ) : undefined,
            flowType,
            module: document.module
        };
    }

    private async resolveFlowComponentName(
        flowName?: string,
        state?: string
    ): Promise<string | undefined> {
        if ( !flowName || !state ) {
            return undefined;
        }

        try {
            const flow = await this.loadFlow( flowName );
            const match = flow.definition.states?.find( ( entry ) => entry.key === state );

            return match?.component ?? undefined;
        } catch( error ) {
            const message = error instanceof Error ? error.message : String( error );
            throw new Error(
                `UIDefinitionLoader: unable to resolve component for flow '${ flowName }' state '${ state }' - ${ message }`
            );
        }
    }

    private createRuntimeElementsGroup( group: ElementsGroupDefinition ): RuntimeElementsGroup {
        const rows = ( group.items ?? [] ).map( ( row ) => row.map( ( element ) => this.createRuntimeElement( element ) ) );

        const definition: ElementsGroupDefinition = {
            name: group.name,
            resolver: group.resolver,
            items: rows.map( ( row ) => row.map( ( element ) => element.definition ) ),
            options: group.options ? this.cloneJsonObject( group.options ) : undefined
        };

        return {
            definition,
            rows
        };
    }

    private createRuntimeEmbedsGroup( group: EmbedsGroupDefinition ): RuntimeEmbedsGroup {
        const items = ( group.items ?? [] ).map( ( embed ) => this.createRuntimeEmbed( embed ) );

        const definition: EmbedsGroupDefinition = {
            name: group.name,
            resolver: group.resolver,
            items: items.map( ( embed ) => embed.definition ),
            options: group.options ? this.cloneJsonObject( group.options ) : undefined
        };

        return {
            definition,
            items
        };
    }

    private createRuntimeExecutionStep( step: ExecutionStepDefinition ): RuntimeExecutionStep {
        const hooks = ( step.hooks ?? [] ).map( ( hook ) => this.createRuntimeHook( hook ) );

        const definition: ExecutionStepDefinition = {
            key: step.key,
            elementsGroup: step.elementsGroup ?? null,
            embedsGroup: step.embedsGroup ?? null,
            markdownGroup: step.markdownGroup ?? null,
            hooks: hooks.map( ( hook ) => hook.definition ),
            options: step.options ? this.cloneJsonObject( step.options ) : undefined
        };

        return {
            definition,
            hooks
        };
    }

    private createRuntimeBinding( binding: BindingDefinition ): RuntimeBinding {
        const callable = this.parseHandlerReference( binding.handler );

        const flowTriggers = binding.flowTriggers
            ? binding.flowTriggers.map( ( trigger ) => this.cloneBindingFlowTrigger( trigger ) )
            : undefined;

        const definition: BindingDefinition = {
            entity: binding.entity,
            handler: binding.handler,
            kind: binding.kind,
            options: binding.options ? this.cloneJsonObject( binding.options ) : undefined,
            flowTriggers
        };

        return {
            definition,
            callable
        };
    }

    private createRuntimeFlowState( state: FlowStateDefinition ): RuntimeFlowState {
        const hooks = ( state.hooks ?? [] ).map( ( hook ) => this.createRuntimeHook( hook ) );
        const componentRef = state.component ? this.createClassRef( state.component ) : null;

        const definition: FlowStateDefinition = {
            key: state.key,
            component: state.component ?? null,
            transitions: [ ...( state.transitions ?? [] ) ],
            hooks: hooks.map( ( hook ) => hook.definition ),
            options: state.options ? this.cloneJsonObject( state.options ) : undefined
        };

        return {
            definition,
            componentRef,
            hooks
        };
    }

    private createRuntimeFlowTransition( transition: FlowTransitionDefinition ): RuntimeFlowTransition {
        const triggers = ( transition.triggeredBy ?? [] ).map( ( trigger ) => this.createRuntimeFlowTrigger( trigger ) );

        const definition: FlowTransitionDefinition = {
            from: transition.from,
            to: transition.to,
            triggeredBy: triggers.map( ( trigger ) => trigger.definition ),
            options: transition.options ? this.cloneJsonObject( transition.options ) : undefined
        };

        return {
            definition,
            triggers
        };
    }

    private createRuntimeFlowRequiredData( data: FlowRequiredDataDefinition ): RuntimeFlowRequiredData {
        const definition: FlowRequiredDataDefinition = {
            transition: data.transition,
            fields: [ ...( data.fields ?? [] ) ],
            options: data.options ? this.cloneJsonObject( data.options ) : undefined
        };

        return {
            definition
        };
    }

    private createRuntimeFlowIntegrationPoint( point: FlowIntegrationPointDefinition ): RuntimeFlowIntegrationPoint {
        const integrationType: FlowIntegrationPointType = point.integrationType ?? "GENERIC";

        const definition: FlowIntegrationPointDefinition = {
            flowName: point.flowName,
            description: point.description,
            sourceState: point.sourceState,
            targetState: point.targetState,
            transition: point.transition,
            requiredData: point.requiredData ? [ ...point.requiredData ] : undefined,
            integrationType,
            options: point.options ? this.cloneJsonObject( point.options ) : undefined
        };

        return {
            definition,
            type: integrationType
        };
    }

    private createRuntimeFlowTrigger( trigger: FlowTriggerDefinition ): RuntimeFlowTrigger {
        const callable = trigger.handlerId ? this.parseHandlerReference( trigger.handlerId ) : undefined;

        const definition: FlowTriggerDefinition = {
            handlerId: trigger.handlerId,
            sourceEntity: trigger.sourceEntity,
            handlerKind: trigger.handlerKind,
            mutations: trigger.mutations ? trigger.mutations.map( ( mutation ) => this.cloneFlowContextMutation( mutation ) ) : undefined,
            navigation: trigger.navigation ? this.cloneFlowNavigation( trigger.navigation ) : undefined
        };

        return {
            definition,
            callable
        };
    }

    private cloneFlowContextMutation( mutation: FlowContextMutationDefinition ): FlowContextMutationDefinition {
        return {
            type: mutation.type,
            path: [ ...( mutation.path ?? [] ) ]
        };
    }

    private cloneFlowNavigation( navigation: FlowNavigationDefinition ): FlowNavigationDefinition {
        return {
            targetState: navigation.targetState,
            executionStep: navigation.executionStep
        };
    }

    private cloneBindingFlowTrigger( trigger: BindingFlowTriggerDefinition ): BindingFlowTriggerDefinition {
        return {
            flowName: trigger.flowName,
            transition: trigger.transition,
            handlerId: trigger.handlerId,
            sourceEntity: trigger.sourceEntity,
            handlerKind: trigger.handlerKind,
            mutations: trigger.mutations
                ? trigger.mutations.map( ( mutation ) => this.cloneFlowContextMutation( mutation ) )
                : undefined,
            navigation: trigger.navigation ? this.cloneFlowNavigation( trigger.navigation ) : undefined
        };
    }

    private cloneEdgeSourceMapping( mapping: FlowEdgeSourceMappingDefinition ): FlowEdgeSourceMappingDefinition {
        return {
            triggeringElementId: mapping.triggeringElementId,
            transitionName: mapping.transitionName,
            targetFlowName: mapping.targetFlowName,
            options: mapping.options ? this.cloneJsonObject( mapping.options ) : undefined
        };
    }

    private createRuntimeHook( hook: HookReference ): RuntimeHook {
        const callable = this.parseHandlerReference( hook.handler );

        const definition: HookReference = {
            hook: hook.hook,
            handler: hook.handler,
            options: hook.options ? this.cloneJsonObject( hook.options ) : undefined
        };

        return {
            definition,
            callable
        };
    }

    private createRuntimeElement( element: ElementReference ): RuntimeElement {
        const definition: ElementReference = {
            element: element.element,
            options: element.options ? this.cloneJsonObject( element.options ) : undefined
        };

        const classRef = this.createClassRef( definition.element );

        return {
            definition,
            classRef
        };
    }

    private createRuntimeEmbed( embed: EmbedReference ): RuntimeEmbed {
        const definition: EmbedReference = {
            embed: embed.embed,
            options: embed.options ? this.cloneJsonObject( embed.options ) : undefined
        };

        const classRef = this.createClassRef( definition.embed );

        return {
            definition,
            classRef
        };
    }

    private parseHandlerReference( reference: string ): RuntimeHandler {
        if ( interactionHandlerRegistry.has( reference ) ) {
            const handler = interactionHandlerRegistry.get( reference );

            if ( !handler ) {
                throw new Error( `UIDefinitionLoader: handler '${ reference }' unexpectedly missing` );
            }

            return {
                type: "function",
                name: reference,
                handler
            };
        }

        const [ className, method ] = reference.split( ":" );

        if ( !className || !method ) {
            throw new Error( `UIDefinitionLoader: invalid handler reference '${ reference }'` );
        }

        const classRef = this.createClassRef( className );

        return {
            type: "class-method",
            classRef,
            method
        };
    }

    private createClassRef( name: string ): RuntimeClassRef {
        const Class = uiClassRegistry.getClass<object>( name );

        return {
            name,
            Class
        };
    }

    private cloneJsonValue( value: JsonValue ): JsonValue {
        if ( Array.isArray( value ) ) {
            return value.map( ( item ) => this.cloneJsonValue( item ) );
        }

        if ( value && typeof value === "object" ) {
            return this.cloneJsonObject( value as JsonObject );
        }

        return value;
    }

    private cloneJsonObject( value: JsonObject ): JsonObject {
        const cloned: JsonObject = {};

        for ( const key of Object.keys( value ) ) {
            cloned[ key ] = this.cloneJsonValue( value[ key ] );
        }

        return cloned;
    }

    private extractEmbedAudit( options?: JsonObject ): HydratedEmbedAudit | undefined {
        if ( !options ) {
            return undefined;
        }

        const raw = options[ "embedAudit" ] as unknown;

        if ( !raw || typeof raw !== "object" || Array.isArray( raw ) ) {
            return undefined;
        }

        const audit = raw as Record<string, unknown>;
        const total = typeof audit.total === "number" ? audit.total : 0;
        const withDefinition = typeof audit.withDefinition === "number" ? audit.withDefinition : 0;
        const missingDefinition =
            typeof audit.missingDefinition === "number"
                ? audit.missingDefinition
                : Math.max( total - withDefinition, 0 );

        if ( total === 0 && withDefinition === 0 && missingDefinition === 0 ) {
            return undefined;
        }

        return {
            total,
            withDefinition,
            missingDefinition
        };
    }

    private warnMissingEmbedDefinitions(
        componentName: string,
        moduleName: string | undefined,
        audit: HydratedEmbedAudit
    ): void {
        if ( audit.missingDefinition <= 0 ) {
            return;
        }

        const scope = moduleName ? `${ componentName } (module ${ moduleName })` : componentName;

        this.logger.warn(
            "UIDefinitionLoader",
            `Component '${ scope }' has ${ audit.missingDefinition } of ${ audit.total } embed(s) missing metadata captured by builders.`
        );
    }

    private collectFlowTriggersByHandler(
        bindings: RuntimeBinding[]
    ): Record<string, BindingFlowTriggerDefinition[]> | null {
        let hasEntries = false;
        const result: Record<string, BindingFlowTriggerDefinition[]> = {};

        for ( const binding of bindings ) {
            const triggers = binding.definition.flowTriggers;

            if ( !triggers?.length ) {
                continue;
            }

            result[ binding.definition.handler ] = triggers.map( ( trigger ) => this.cloneBindingFlowTrigger( trigger ) );
            hasEntries = true;
        }

        return hasEntries ? result : null;
    }

    private validateBindingFlowTriggers(
        adapterName: string,
        handlerId: string,
        triggers: BindingFlowTriggerDefinition[]
    ): void {
        for ( const [ index, trigger ] of triggers.entries() ) {
            if ( !trigger.flowName ) {
                throw new Error(
                    `UIDefinitionLoader: adapter '${ adapterName }' binding '${ handlerId }' trigger[${ index }] is missing flowName`
                );
            }

            if ( !trigger.transition ) {
                throw new Error(
                    `UIDefinitionLoader: adapter '${ adapterName }' binding '${ handlerId }' trigger[${ index }] is missing transition`
                );
            }

            if ( trigger.navigation ) {
                if ( trigger.navigation.targetState && typeof trigger.navigation.targetState !== "string" ) {
                    throw new Error(
                        `UIDefinitionLoader: adapter '${ adapterName }' binding '${ handlerId }' trigger[${ index }] targetState must be string`
                    );
                }

                if (
                    trigger.navigation.executionStep &&
                    typeof trigger.navigation.executionStep !== "string"
                ) {
                    throw new Error(
                        `UIDefinitionLoader: adapter '${ adapterName }' binding '${ handlerId }' trigger[${ index }] executionStep must be string`
                    );
                }
            }

            if ( trigger.mutations ) {
                for ( const [ mutationIndex, mutation ] of trigger.mutations.entries() ) {
                    if ( mutation.type !== "set" ) {
                        throw new Error(
                            `UIDefinitionLoader: adapter '${ adapterName }' binding '${ handlerId }' trigger[${ index }] mutation[${ mutationIndex }] has unsupported type '${ mutation.type }'`
                        );
                    }

                    if ( !Array.isArray( mutation.path ) || !mutation.path.length ) {
                        throw new Error(
                            `UIDefinitionLoader: adapter '${ adapterName }' binding '${ handlerId }' trigger[${ index }] mutation[${ mutationIndex }] path must be non-empty array`
                        );
                    }
                }
            }
        }
    }

    private validateFlowDefinition( document: FlowDefinition ): void {
        const states = document.states ?? [];

        if ( !states.length ) {
            throw new Error( `UIDefinitionLoader: flow '${ document.name }' must declare at least one state` );
        }

        const stateKeys = new Set<string>();

        for ( const state of states ) {
            if ( !state.key ) {
                throw new Error( `UIDefinitionLoader: flow '${ document.name }' has a state with an empty key` );
            }

            if ( stateKeys.has( state.key ) ) {
                throw new Error( `UIDefinitionLoader: flow '${ document.name }' has duplicate state '${ state.key }'` );
            }

            stateKeys.add( state.key );
        }

        if ( !stateKeys.has( document.initialState ) ) {
            throw new Error(
                `UIDefinitionLoader: flow '${ document.name }' initial state '${ document.initialState }' is not declared`
            );
        }

        const transitions = document.transitions ?? [];
        const transitionTargets = new Map<string, string>();

        for ( const transition of transitions ) {
            if ( !transition.from ) {
                throw new Error( `UIDefinitionLoader: flow '${ document.name }' has a transition without a name` );
            }

            if ( !transition.to ) {
                throw new Error(
                    `UIDefinitionLoader: flow '${ document.name }' transition '${ transition.from }' is missing a target state`
                );
            }

            if ( !stateKeys.has( transition.to ) ) {
                throw new Error(
                    `UIDefinitionLoader: flow '${ document.name }' transition '${ transition.from }' targets unknown state '${ transition.to }'`
                );
            }

            transitionTargets.set( transition.from, transition.to );
        }

        const flowKind = ( document.flowKind || "" ).trim().toLowerCase();
        const isWizard = flowKind === "wizard";

        for ( const state of states ) {
            const stateTransitions = state.transitions ?? [];

            for ( const transitionName of stateTransitions ) {
                if (
                    !transitionTargets.has( transitionName ) &&
                    !( isWizard && WIZARD_BASE_TRANSITIONS.has( transitionName ) )
                ) {
                    throw new Error(
                        `UIDefinitionLoader: flow '${ document.name }' transition '${ transitionName }' declared for state '${ state.key }' has no mapping`
                    );
                }
            }
        }

        const requiredData = document.requiredData ?? [];

        for ( const item of requiredData ) {
            if ( !item.transition ) {
                throw new Error( `UIDefinitionLoader: flow '${ document.name }' has required data without transition name` );
            }

            if (
                !transitionTargets.has( item.transition ) &&
                !( isWizard && WIZARD_BASE_TRANSITIONS.has( item.transition ) )
            ) {
                throw new Error(
                    `UIDefinitionLoader: flow '${ document.name }' required data references unknown transition '${ item.transition }'`
                );
            }
        }

        const validateIntegrationPoints = ( points: FlowIntegrationPointDefinition[] | undefined, type: "entry" | "handoff" ) => {
            if ( !points ) {
                return;
            }

            for ( const point of points ) {
                if ( point.sourceState && !stateKeys.has( point.sourceState ) ) {
                    throw new Error(
                        `UIDefinitionLoader: flow '${ document.name }' ${ type } point references unknown source state '${ point.sourceState }'`
                    );
                }

                if ( point.targetState && !stateKeys.has( point.targetState ) ) {
                    throw new Error(
                        `UIDefinitionLoader: flow '${ document.name }' ${ type } point references unknown target state '${ point.targetState }'`
                    );
                }

                if (
                    point.transition &&
                    !transitionTargets.has( point.transition ) &&
                    !( isWizard && WIZARD_BASE_TRANSITIONS.has( point.transition ) )
                ) {
                    throw new Error(
                        `UIDefinitionLoader: flow '${ document.name }' ${ type } point references unknown transition '${ point.transition }'`
                    );
                }
            }
        };

        validateIntegrationPoints( document.entryPoints, "entry" );
        validateIntegrationPoints( document.handoffPoints, "handoff" );

        if ( document.edgeSourceMappings ) {
            for ( const mapping of document.edgeSourceMappings ) {
                if (
                    mapping.transitionName &&
                    !transitionTargets.has( mapping.transitionName ) &&
                    !( isWizard && WIZARD_BASE_TRANSITIONS.has( mapping.transitionName ) )
                ) {
                    throw new Error(
                        `UIDefinitionLoader: flow '${ document.name }' edge source mapping references unknown transition '${ mapping.transitionName }'`
                    );
                }
            }
        }

        if ( document.stepStates ) {
            for ( const state of document.stepStates ) {
                if ( !stateKeys.has( state ) ) {
                    throw new Error(
                        `UIDefinitionLoader: flow '${ document.name }' wizard step state '${ state }' is not declared`
                    );
                }
            }
        }

        if ( document.stepComponents && document.stepComponents.some( ( name ) => !name ) ) {
            throw new Error(
                `UIDefinitionLoader: flow '${ document.name }' wizard step components list contains empty entries`
            );
        }

        if ( document.stepStates && document.stepComponents && document.stepStates.length !== document.stepComponents.length ) {
            throw new Error(
                `UIDefinitionLoader: flow '${ document.name }' wizard step states count (${ document.stepStates.length }) does not match step components count (${ document.stepComponents.length })`
            );
        }
    }
}

