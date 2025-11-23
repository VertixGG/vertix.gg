import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type {
    AdapterDefinition,
    BindingDefinition,
    ComponentDefinition,
    ElementsGroupDefinition,
    EmbedsGroupDefinition,
    ExecutionStepDefinition,
    FlowDefinition,
    FlowIntegrationPointDefinition,
    FlowStateDefinition,
    HookReference
} from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { AdapterBuilderMetadata, ComponentBuilderMetadata } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import type {
    UIComponentTypeConstructor,
    UIExecutionSteps
} from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import type { TAdapterClassType } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";
import { UIFlowBase, FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

const log = new Logger( "VertixGUI/UIDefinitionExporter" );

interface ExporterOptions {
    outputDir: string;
    includeFlows?: boolean;
    includeAdapters?: boolean;
    includeComponents?: boolean;
}

interface HandlerCapture {
    id: string;
}

type AdapterClass =
    | typeof UIAdapterBase
    | typeof UIAdapterExecutionStepsBase
    | typeof UIWizardAdapterBase;

type FlowClass = typeof UIFlowBase;

export async function exportUIDefinitions( uiService: UIService, options: ExporterOptions ) {
    const includeComponents = options.includeComponents ?? true;
    const includeAdapters = options.includeAdapters ?? true;
    const includeFlows = options.includeFlows ?? true;

    const components = new Map<string, ComponentDefinition>();
    const adapters: AdapterDefinition[] = [];
    const flows: FlowDefinition[] = [];

    const handlerMap = new Map<string, HandlerCapture>();

    const modules = uiService.getUIModules();

    for ( const [ moduleName, ModuleCtor ] of modules ) {
        log.info( exportUIDefinitions, `Exporting module ${ moduleName }` );
        const moduleInstance = uiService.getUIModule<UIModuleBase>( moduleName, true ) ?? new ModuleCtor();

        if ( includeAdapters ) {
            const moduleAdapters = ModuleCtor.getAdapters?.() ?? [];

            for ( const adapterClass of moduleAdapters ) {
                try {
                    const definition = await serializeAdapter(
                        adapterClass,
                        uiService,
                        components,
                        handlerMap
                    );
                    adapters.push( definition );
                } catch ( error ) {
                    log.error( error, `Failed to export adapter '${ adapterClass.getName?.() ?? adapterClass }'` );
                    throw error;
                }
            }
        }

        if ( includeFlows ) {
            const moduleFlows = ModuleCtor.getFlows?.() ?? [];

            for ( const flowClass of moduleFlows ) {
                try {
                    const definition = await serializeFlow(
                        flowClass as FlowClass,
                        moduleInstance,
                        uiService,
                        components
                    );
                    flows.push( definition );
                } catch ( error ) {
                    log.error( error, `Failed to export flow '${ flowClass.getName?.() ?? flowClass }'` );
                    throw error;
                }
            }
        }
    }

    writeJson( path.join( options.outputDir, "components.json" ), Array.from( components.values() ) );
    writeJson( path.join( options.outputDir, "adapters.json" ), adapters );
    writeJson( path.join( options.outputDir, "flows.json" ), flows );

    log.info(
        exportUIDefinitions,
        `Export completed. Components: ${ components.size }, Adapters: ${ adapters.length }, Flows: ${ flows.length }`
    );
}

function determineAdapterKind( adapterClass: AdapterClass ): string {
    if ( adapterClass.prototype instanceof UIWizardAdapterBase ) {
        return "wizard";
    }

    if ( adapterClass.prototype instanceof UIAdapterExecutionStepsBase ) {
        return "execution";
    }

    return "base";
}

function serializeComponent( componentClass: UIComponentTypeConstructor ): ComponentDefinition {
    const metadata = getComponentMetadata( componentClass );

    const instanceType = metadata?.instanceType ?? safeCall( () => componentClass.getInstanceType() ) ?? "dynamic";
    const rawElementsGroups = metadata?.elementsGroups ?? safeCall( () => componentClass.getElementsGroups() ) ?? [];
    const rawEmbedsGroups = metadata?.embedsGroups ?? safeCall( () => componentClass.getEmbedsGroups() ) ?? [];
    const rawModals = metadata?.modals ?? [];

    const elementsGroups = rawElementsGroups.map( ( group, index ) =>
        serializeElementsGroup( componentClass, group, index )
    );

    const embedsGroups = rawEmbedsGroups.map( ( group, index ) =>
        serializeEmbedsGroup( componentClass, group, index )
    );

    const modals = rawModals.map( ( modal ) => extractEntityName( modal ) );

    return {
        name: componentClass.getName(),
        type: safeCall( () => componentClass.getType() ) ?? "component",
        instanceType,
        elementsGroups,
        embedsGroups,
        modals,
        defaultElementsGroup: metadata?.defaultElementsGroup ?? safeCall( () => componentClass.getDefaultElementsGroup() ) ?? null,
        defaultEmbedsGroup: metadata?.defaultEmbedsGroup ?? safeCall( () => componentClass.getDefaultEmbedsGroup() ) ?? null,
        defaultMarkdownsGroup: metadata?.defaultMarkdownsGroup ?? safeCall( () => componentClass.getDefaultMarkdownsGroup() ) ?? null,
        hooks: [],
        options: undefined
    };
}

function serializeElementsGroup(
    componentClass: UIComponentTypeConstructor,
    group: typeof UIElementsGroupBase,
    index: number
): ElementsGroupDefinition {
    const name = group.getName?.() ?? `${ componentClass.getName() }/ElementsGroup/${ index }`;
    const itemsRaw = safeCall( () => group.getItems?.() ) ?? [];
    const rows = normalize2D( itemsRaw ).map( ( row ) =>
        row.map( ( element ) => ( {
            element: extractEntityName( element )
        } ) )
    );

    return {
        name,
        resolver: undefined,
        items: rows,
        options: undefined
    };
}

function serializeEmbedsGroup(
    componentClass: UIComponentTypeConstructor,
    group: typeof UIEmbedsGroupBase,
    index: number
): EmbedsGroupDefinition {
    const name = group.getName?.() ?? `${ componentClass.getName() }/EmbedsGroup/${ index }`;
    const itemsRaw = safeCall( () => group.getItems?.() ) ?? [];
    const items = itemsRaw.map( ( embed ) => ( {
        embed: extractEntityName( embed )
    } ) );

    return {
        name,
        resolver: undefined,
        items,
        options: undefined
    };
}

async function serializeAdapter(
    adapterClass: TAdapterClassType,
    uiService: UIService,
    components: Map<string, ComponentDefinition>,
    handlerMap: Map<string, HandlerCapture>
): Promise<AdapterDefinition> {
    const adapterName = adapterClass.getName();
    const adapterInstance = uiService.get( adapterName, true ) as UIAdapterBase<any, any> | undefined;
    if ( !adapterInstance ) {
        throw new Error( `Adapter '${ adapterName }' is not registered.` );
    }

    const metadata = getAdapterMetadata( adapterClass );

    const componentClass = adapterClass.getComponent() as UIComponentTypeConstructor | undefined;
    const componentName: string =
        componentClass && typeof componentClass.getName === "function"
            ? componentClass.getName()
            : "";

    if ( componentClass && !components.has( componentName ) ) {
        components.set( componentName, serializeComponent( componentClass ) );
    }

    const executionSteps = serializeExecutionSteps( adapterClass );
    const bindings = await serializeBindings( adapterName, metadata, handlerMap );
    const hooks = serializeAdapterHooks( adapterName, metadata, handlerMap );

    const permissions = safeCall( () => adapterInstance.getPermissions() );
    const channelTypes = safeCall( () => adapterInstance.getChannelTypes() ) ?? [];
    const instanceType = String( safeCall( () => adapterClass.getInstanceType?.() ) ?? "dynamic" );

    return {
        name: adapterName,
        adapterKind: determineAdapterKind( adapterClass as AdapterClass ),
        component: componentName,
        instanceType,
        channelTypes: channelTypes.map( ( type ) => type.toString() ),
        permissions: permissions ? permissions.bitfield.toString() : null,
        middlewares: undefined,
        executionSteps,
        bindings,
        hooks,
        options: undefined
    };
}

function serializeExecutionSteps( adapterClass: TAdapterClassType ): ExecutionStepDefinition[] {
    const executionStepsFn = Reflect.get( adapterClass, "getExecutionStepsInternal" ) as ( () => UIExecutionSteps ) | undefined;
    if ( !executionStepsFn ) {
        return [];
    }

    const steps = executionStepsFn.call( adapterClass );
    return Object.entries( steps ).map( ( [ key, value ] ) => {
        const entry = value as Record<string, unknown> | undefined;
        return {
            key,
            elementsGroup: typeof entry?.elementsGroup === "string" ? entry.elementsGroup : null,
            embedsGroup: typeof entry?.embedsGroup === "string" ? entry.embedsGroup : null,
            markdownGroup: typeof entry?.markdownGroup === "string" ? entry.markdownGroup : null,
            hooks: [],
            options: entry?.options ? JSON.parse( JSON.stringify( entry.options ) ) : undefined
        };
    } );
}

async function serializeBindings(
    adapterName: string,
    metadata: AdapterBuilderMetadata | undefined,
    handlerMap: Map<string, HandlerCapture>
): Promise<BindingDefinition[]> {
    const entityMapHandler = metadata?.entityMapHandler as
        | ( ( binder: CaptureBinder ) => Promise<void> | void )
        | undefined;

    if ( !entityMapHandler ) {
        return [];
    }

    const bindings: BindingDefinition[] = [];

    type CaptureBinder = {
        bindButton: ( name: string, callback?: unknown ) => void;
        bindModal: ( name: string, callback?: unknown ) => void;
        bindModalWithButton: ( button: string, modal: string, callback?: unknown ) => void;
        bindSelectMenu: ( name: string, callback?: unknown ) => void;
        bindUserSelectMenu: ( name: string, callback?: unknown ) => void;
    };

    const binder: CaptureBinder = {
        bindButton: ( name: string ) => {
            const handlerId = `${ adapterName }/Bindings/Button/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            bindings.push( {
                entity: name,
                handler: handlerId,
                kind: "button",
                options: undefined
            } );
        },
        bindModal: ( name: string ) => {
            const handlerId = `${ adapterName }/Bindings/Modal/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            bindings.push( {
                entity: name,
                handler: handlerId,
                kind: "modal",
                options: undefined
            } );
        },
        bindModalWithButton: ( button: string, modal: string ) => {
            const handlerId = `${ adapterName }/Bindings/ModalWithButton/${ button }`;
            handlerMap.set( handlerId, { id: handlerId } );
            bindings.push( {
                entity: `${ button }::${ modal }`,
                handler: handlerId,
                kind: "modal-button",
                options: {
                    button,
                    modal
                }
            } );
        },
        bindSelectMenu: ( name: string ) => {
            const handlerId = `${ adapterName }/Bindings/StringSelect/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            bindings.push( {
                entity: name,
                handler: handlerId,
                kind: "string-select",
                options: undefined
            } );
        },
        bindUserSelectMenu: ( name: string ) => {
            const handlerId = `${ adapterName }/Bindings/UserSelect/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            bindings.push( {
                entity: name,
                handler: handlerId,
                kind: "user-select",
                options: undefined
            } );
        }
    } as const;

    await entityMapHandler( binder );

    return bindings;
}

function serializeAdapterHooks(
    adapterName: string,
    metadata: AdapterBuilderMetadata | undefined,
    handlerMap: Map<string, HandlerCapture>
): HookReference[] {
    const hooks: HookReference[] = [];

    const pushHook = ( hook: string, idSuffix: string, exists: unknown ) => {
        if ( !exists ) {
            return;
        }

        const handlerId = `${ adapterName }/Hooks/${ idSuffix }`;
        handlerMap.set( handlerId, { id: handlerId } );
        hooks.push( {
            hook,
            handler: handlerId,
            options: undefined
        } );
    };

    pushHook( "getStartArgs", "GetStartArgs", metadata?.startArgsHandler );
    pushHook( "getReplyArgs", "GetReplyArgs", metadata?.replyArgsHandler );
    pushHook( "onBeforeBuild", "OnBeforeBuild", metadata?.beforeBuildHandler );
    pushHook( "onAfterBuild", "OnAfterBuild", undefined ); // Not exposed in builder metadata
    pushHook( "onBeforeFinish", "OnBeforeFinish", metadata?.beforeFinishHandler );
    pushHook( "onStep", "OnStep", metadata?.onStepHandler );

    return hooks;
}

async function serializeFlow(
    flowClass: FlowClass,
    moduleInstance: UIModuleBase,
    uiService: UIService,
    components: Map<string, ComponentDefinition>
): Promise<FlowDefinition> {
    const flowName = flowClass.getName();
    const FlowCtor = flowClass as unknown as new ( options: { module: UIModuleBase } ) => UIFlowBase<string, string>;
    const flowInstance = new FlowCtor( { module: moduleInstance } );

    const transitions = serializeFlowTransitions( flowClass );
    const states = serializeFlowStates( flowClass, components );
    const requiredData = serializeFlowRequiredData( flowClass );
    const entryPoints = serializeIntegrationPoints( flowClass.getEntryPoints?.() ?? [] );
    const handoffPoints = serializeIntegrationPoints( flowClass.getHandoffPoints?.() ?? [] );

    const definition: FlowDefinition = {
        name: flowName,
        flowKind: flowClass.getFlowType?.() ?? "ui",
        initialState: flowInstance.getCurrentState(),
        states,
        transitions,
        requiredData,
        entryPoints,
        handoffPoints,
        externalReferences: flowClass.getExternalReferences?.(),
        edgeSourceMappings: flowClass.getEdgeSourceMappings?.(),
        requiredDataComponents: flowClass.getRequiredDataComponents?.(),
        channelTypes: safeCall( () => flowInstance.getChannelTypes()?.map( ( type ) => type.toString() ) ),
        permissions: safeCall( () => flowInstance.getPermissions()?.bitfield.toString() ),
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: flowClass.getFlowType?.(),
        hooks: [],
        options: undefined
    };

    return definition;
}

function serializeFlowTransitions( flowClass: FlowClass ): FlowDefinition["transitions"] {
    const getNextStates = Reflect.get( flowClass, "getNextStates" ) as ( () => Record<string, string> ) | undefined;
    const nextStates = getNextStates?.call( flowClass ) ?? {};
    return Object.entries( nextStates ).map( ( [ transition, target ] ) => ( {
        from: transition,
        to: typeof target === "string" ? target : "",
        options: undefined
    } ) );
}

function serializeFlowStates(
    flowClass: FlowClass,
    components: Map<string, ComponentDefinition>
): FlowStateDefinition[] {
    const getFlowTransitions = Reflect.get( flowClass, "getFlowTransitions" ) as ( () => Record<string, string[]> ) | undefined;
    const transitions = getFlowTransitions?.call( flowClass ) ?? {};

    return Object.keys( transitions ).map( ( stateKey ) => ( {
        key: stateKey,
        component: null,
        transitions: transitions[ stateKey ],
        hooks: [],
        options: undefined
    } ) );
}

function serializeFlowRequiredData( flowClass: FlowClass ): FlowDefinition["requiredData"] {
    const getRequiredData = Reflect.get( flowClass, "getRequiredData" ) as ( () => Record<string, string[]> ) | undefined;
    const requiredData = getRequiredData?.call( flowClass ) ?? {};

    return Object.entries( requiredData ).map( ( [ transition, fields ] ) => ( {
        transition,
        fields: Array.isArray( fields ) ? fields : [],
        options: undefined
    } ) );
}

function serializeIntegrationPoints( points: FlowIntegrationPointBase[] ): FlowIntegrationPointDefinition[] {
    return points.map( ( point ) => ( {
        flowName: point.flowName,
        description: point.description,
        sourceState: point.sourceState,
        targetState: point.targetState,
        transition: point.transition,
        requiredData: point.requiredData,
        integrationType: ( point.constructor as typeof FlowIntegrationPointBase ).getType(),
        options: undefined
    } ) );
}

function getComponentMetadata( componentClass: UIComponentTypeConstructor ): ComponentBuilderMetadata | undefined {
    return Reflect.get( componentClass, BUILDER_METADATA_SYMBOL ) as ComponentBuilderMetadata | undefined;
}

function getAdapterMetadata( adapterClass: TAdapterClassType ): AdapterBuilderMetadata | undefined {
    return Reflect.get( adapterClass, BUILDER_METADATA_SYMBOL ) as AdapterBuilderMetadata | undefined;
}

function normalize2D( input: unknown ): unknown[][] {
    if ( !Array.isArray( input ) ) {
        return [ [ input ] ];
    }

    if ( input.length === 0 ) {
        return [];
    }

    if ( Array.isArray( input[ 0 ] ) ) {
        return input as unknown[][];
    }

    return [ input as unknown[] ];
}

function safeCall<T>( fn: () => T ): T | undefined {
    try {
        return fn();
    } catch {
        return undefined;
    }
}

function writeJson( filePath: string, payload: unknown ) {
    mkdirSync( path.dirname( filePath ), { recursive: true } );
    writeFileSync( filePath, JSON.stringify( payload, null, 4 ), "utf8" );
}

function extractEntityName( entity: unknown ): string {
    if ( typeof entity === "function" && "getName" in entity ) {
        try {
            return ( entity as { getName: () => string } ).getName();
        } catch {
            // ignore
        }
    }

    if ( entity && typeof entity === "object" && "getName" in entity ) {
        try {
            return ( entity as { getName: () => string } ).getName();
        } catch {
            // ignore
        }
    }

    return String( entity );
}


