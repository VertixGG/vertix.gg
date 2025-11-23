import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ChannelType } from "discord.js";

import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";

import type { UIWizardFlowBase } from "@vertix.gg/gui/src/bases/ui-wizard-flow-base";

import type {
    AdapterDefinition,
    BindingDefinition,
    ComponentDefinition,
    ElementsGroupDefinition,
    EmbedsGroupDefinition,
    EmbedReference,
    EmbedContentDefinition,
    ExecutionStepDefinition,
    FlowDefinition,
    FlowIntegrationPointDefinition,
    FlowStateDefinition,
    FlowTriggerHandlerKind,
    FlowTriggerDefinition,
    BindingFlowTriggerDefinition,
    HookReference,
    JsonValue,
    JsonObject
} from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type {
    AdapterBuilderMetadata,
    ComponentBuilderMetadata,
    EmbedBuilderMetadata
} from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import type {
    UIArgs,
    UIComponentTypeConstructor,
    UIExecutionSteps
} from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import type { UIFlowBase, FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import type { TAdapterClassType } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import type {
    StringHandler,
    NumberHandler,
    OptionsHandler
} from "@vertix.gg/gui/src/builders/embed-builder";
import type {
    BindingRegistrationOptions
} from "@vertix.gg/gui/src/builders/builders-definitions";

interface ExporterOptions {
    outputDir: string;
    includeFlows?: boolean;
    includeAdapters?: boolean;
    includeComponents?: boolean;
}

interface HandlerCapture {
    id: string;
}

type AdapterConstructor = new ( ...args: never[] ) => UIAdapterBase<any, any>;

type AdapterClass =
    | AdapterConstructor
    | typeof UIAdapterExecutionStepsBase
    | typeof UIWizardAdapterBase;

type FlowClass = typeof UIFlowBase;

export class UIDefinitionExporter extends UIBase {
    private readonly logger: Logger;

    public static override getName(): string {
        return "VertixGUI/Runtime/UIDefinitionExporter";
    }

    public constructor() {
        super();
        this.logger = new Logger( UIDefinitionExporter.getName() );
    }

    public async export( uiService: UIService, options: ExporterOptions ): Promise<void> {
        await exportUIDefinitionsInternal( uiService, options, this.logger );
    }
}

const uiDefinitionExporter = new UIDefinitionExporter();

export async function exportUIDefinitions( uiService: UIService, options: ExporterOptions ) {
    await uiDefinitionExporter.export( uiService, options );
}

interface EmbedAuditStats {
    total: number;
    withDefinition: number;
    missingDefinition: number;
}

interface ComponentEmbedDiagnostics {
    component: string;
    module?: string;
    total: number;
    withDefinition: number;
    missing: ComponentEmbedDiagnosticEntry[];
}

interface ComponentEmbedDiagnosticEntry {
    group: string;
    embed: string;
}

interface ModuleExportSummary {
    components: number;
    adapters: number;
    flows: number;
    embedsTotal: number;
    embedsWithDefinition: number;
    embedsMissingDefinition: number;
    componentsWithEmbeds: number;
    componentsWithMissingEmbeds: number;
}

type FlowTriggerRegistrar = (
    flowName: string,
    transition: string,
    trigger: FlowTriggerDefinition
) => void;

function getOrCreateModuleSummary(
    summaries: Map<string, ModuleExportSummary>,
    moduleName: string
): ModuleExportSummary {
    let summary = summaries.get( moduleName );
    if ( !summary ) {
        summary = {
            components: 0,
            adapters: 0,
            flows: 0,
            embedsTotal: 0,
            embedsWithDefinition: 0,
            embedsMissingDefinition: 0,
            componentsWithEmbeds: 0,
            componentsWithMissingEmbeds: 0
        };
        summaries.set( moduleName, summary );
    }

    return summary;
}

async function exportUIDefinitionsInternal( uiService: UIService, options: ExporterOptions, logger: Logger ) {
    const includeComponents = options.includeComponents ?? true;
    const includeAdapters = options.includeAdapters ?? true;
    const includeFlows = options.includeFlows ?? true;

    const components = new Map<string, ComponentDefinition>();
    const adapters: AdapterDefinition[] = [];
    const flows: FlowDefinition[] = [];

    const handlerMap = new Map<string, HandlerCapture>();
    const wizardAdapterComponents = new Map<string, string[]>();
    const flowTriggersByAdapter = new Map<string, Map<string, FlowTriggerDefinition[]>>();
    const moduleSummaries = new Map<string, ModuleExportSummary>();
    const globalEmbedStats: EmbedAuditStats = { total: 0, withDefinition: 0, missingDefinition: 0 };
    const embedDiagnostics: ComponentEmbedDiagnostics[] = [];

    const modules = uiService.getUIModules();

    for ( const [ moduleName, ModuleCtor ] of modules ) {
        logger.info( "exportUIDefinitions", `Exporting module ${ moduleName }` );
        const moduleInstance = uiService.getUIModule<UIModuleBase>( moduleName, true ) ?? new ModuleCtor();
        const moduleSummary = getOrCreateModuleSummary( moduleSummaries, moduleName );

        if ( includeAdapters ) {
            const moduleAdapters = ModuleCtor.getAdapters?.() ?? [];

            for ( const adapterClass of moduleAdapters ) {
                try {
                    const definition = await serializeAdapter(
                        adapterClass,
                        uiService,
                        components,
                        handlerMap,
                        moduleName,
                        flowTriggersByAdapter,
                        moduleSummary,
                        globalEmbedStats,
                        embedDiagnostics,
                        logger
                    );
                    adapters.push( definition );
                    moduleSummary.adapters += 1;

                    const adapterMetadata = getAdapterMetadata( adapterClass );
                    const wizardComponents = extractWizardComponentNames( adapterMetadata );

                    if ( wizardComponents?.length ) {
                        wizardAdapterComponents.set( adapterClass.getName(), wizardComponents );
                    }
                } catch( error ) {
                    logger.error(
                        "exportUIDefinitions",
                        `Failed to export adapter '${ adapterClass.getName?.() ?? adapterClass }'`,
                        error
                    );
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
                        wizardAdapterComponents,
                        moduleName,
                        flowTriggersByAdapter
                    );
                    flows.push( definition );
                    moduleSummary.flows += 1;
                } catch( error ) {
                    logger.error(
                        "exportUIDefinitions",
                        `Failed to export flow '${ flowClass.getName?.() ?? flowClass }'`,
                        error
                    );
                    throw error;
                }
            }
        }
    }

    const moduleSummaryList = Array.from( moduleSummaries.entries() ).map( ( [ moduleName, summary ] ) => ( {
        module: moduleName,
        components: summary.components,
        adapters: summary.adapters,
        flows: summary.flows,
        embeds: {
            total: summary.embedsTotal,
            withDefinition: summary.embedsWithDefinition,
            missingDefinition: summary.embedsMissingDefinition
        },
        componentsWithEmbeds: summary.componentsWithEmbeds,
        componentsWithMissingEmbeds: summary.componentsWithMissingEmbeds
    } ) );

    const exportMeta = {
        schemaVersion: "1.0.0",
        exportedAt: new Date().toISOString(),
        counts: {
            components: components.size,
            adapters: adapters.length,
            flows: flows.length
        },
        modules: Array.from( modules.keys() ),
        moduleSummary: moduleSummaryList,
        embedCoverage: {
            total: globalEmbedStats.total,
            withDefinition: globalEmbedStats.withDefinition,
            missingDefinition: globalEmbedStats.missingDefinition
        },
        embedDiagnostics
    };

    if ( includeComponents ) {
        writeJson( path.join( options.outputDir, "components.json" ), Array.from( components.values() ) );
    }

    if ( includeAdapters ) {
        writeJson( path.join( options.outputDir, "adapters.json" ), adapters );
    }

    if ( includeFlows ) {
        writeJson( path.join( options.outputDir, "flows.json" ), flows );
    }

    writeJson( path.join( options.outputDir, "meta.json" ), exportMeta );

    if ( embedDiagnostics.length ) {
        const missingTotal = embedDiagnostics.reduce( ( sum, entry ) => sum + entry.missing.length, 0 );
        logger.warn(
            "exportUIDefinitions",
            `Found ${ embedDiagnostics.length } component(s) with ${ missingTotal } embed definition(s) missing metadata.`
        );
        embedDiagnostics.forEach( ( entry ) => {
            const details = entry.missing
                .map( ( item ) => `${ item.group } -> ${ item.embed }` )
                .join( ", " );
            logger.warn(
                "exportUIDefinitions",
                `Component '${ entry.module ? `${ entry.module }::${ entry.component }` : entry.component }' missing embeds: ${ details }`
            );
        } );
    }

    logger.info(
        "exportUIDefinitions",
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

interface ComponentSerializationResult {
    definition: ComponentDefinition;
    embedAudit: EmbedAuditStats;
    diagnostics: ComponentEmbedDiagnostics;
}

function serializeComponent(
    componentClass: UIComponentTypeConstructor,
    moduleName: string | undefined,
    logger: Logger
): ComponentSerializationResult {
    const metadata = getComponentMetadata( componentClass );

    const instanceType = metadata?.instanceType ?? safeCall( () => componentClass.getInstanceType() ) ?? "dynamic";
    const rawElementsGroups =
        metadata?.elementsGroups ??
        safeCall( () => componentClass.getElementsGroups?.() ) ??
        [];
    const rawEmbedsGroups =
        metadata?.embedsGroups ??
        safeCall( () => componentClass.getEmbedsGroups?.() ) ??
        [];
    const rawModals = metadata?.modals ?? [];

    const elementsGroups = rawElementsGroups.map( ( group, index ) =>
        serializeElementsGroup( componentClass, group, index )
    );

    const embedAudit: EmbedAuditStats = {
        total: 0,
        withDefinition: 0,
        missingDefinition: 0
    };
    const missingEmbeds: ComponentEmbedDiagnosticEntry[] = [];
    const recordEmbed = ( reference: EmbedReference, groupName: string ) => {
        embedAudit.total += 1;
        if ( reference.definition ) {
            embedAudit.withDefinition += 1;
            return;
        }
        missingEmbeds.push( {
            group: groupName,
            embed: reference.embed
        } );
    };

    let embedsGroups = rawEmbedsGroups.map( ( group, index ) =>
        serializeEmbedsGroup( componentClass, group, index, recordEmbed )
    );

    const modals = rawModals.map( ( modal ) => extractEntityName( modal ) );

    if ( !elementsGroups.length ) {
        const directElements = callStaticArray( componentClass, "getElements" );

        if ( directElements?.length ) {
            const groupName =
                metadata?.defaultElementsGroup ??
                safeCall( () => componentClass.getDefaultElementsGroup?.() ) ??
                `${ componentClass.getName() }/ElementsGroup`;

            elementsGroups.push( createElementsGroupFromDirect( groupName, directElements ) );
        }
    }

    if ( !embedsGroups.length ) {
        const directEmbeds = callStaticArray( componentClass, "getEmbeds" );

        if ( directEmbeds?.length ) {
            const groupName =
                metadata?.defaultEmbedsGroup ??
                safeCall( () => componentClass.getDefaultEmbedsGroup?.() ) ??
                `${ componentClass.getName() }/EmbedsGroup`;

            embedsGroups = [
                {
                    name: groupName,
                    resolver: undefined,
                    items: directEmbeds.map( ( embed ) => {
                        const reference = serializeEmbedReference( embed );
                        recordEmbed( reference, groupName );
                        return reference;
                    } ),
                    options: undefined
                }
            ];
        }
    }

    embedAudit.missingDefinition = embedAudit.total - embedAudit.withDefinition;

    const componentDefinition: ComponentDefinition = {
        name: componentClass.getName(),
        type: safeCall( () => componentClass.getType() ) ?? "component",
        instanceType,
        modules: moduleName ? [ moduleName ] : undefined,
        elementsGroups,
        embedsGroups,
        modals,
        defaultElementsGroup:
            metadata?.defaultElementsGroup ?? safeCall( () => componentClass.getDefaultElementsGroup?.() ) ?? null,
        defaultEmbedsGroup:
            metadata?.defaultEmbedsGroup ?? safeCall( () => componentClass.getDefaultEmbedsGroup?.() ) ?? null,
        defaultMarkdownsGroup:
            metadata?.defaultMarkdownsGroup ?? safeCall( () => componentClass.getDefaultMarkdownsGroup?.() ) ?? null,
        hooks: [],
        options: embedAudit.total
            ? {
                embedAudit: {
                    total: embedAudit.total,
                    withDefinition: embedAudit.withDefinition,
                    missingDefinition: embedAudit.missingDefinition
                }
            }
            : undefined
    };

    if ( embedAudit.missingDefinition > 0 ) {
        const scope = moduleName ? `${ componentDefinition.name } (module ${ moduleName })` : componentDefinition.name;
        logger.warn(
            "serializeComponent",
            `Component '${ scope }' has ${ embedAudit.missingDefinition } of ${ embedAudit.total } embed(s) missing metadata captured by builders.`
        );
    }

    const diagnostics: ComponentEmbedDiagnostics = {
        component: componentDefinition.name,
        module: moduleName,
        total: embedAudit.total,
        withDefinition: embedAudit.withDefinition,
        missing: missingEmbeds
    };

    return {
        definition: componentDefinition,
        embedAudit,
        diagnostics
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
    index: number,
    recordEmbed?: ( reference: EmbedReference, groupName: string ) => void
): EmbedsGroupDefinition {
    const name = group.getName?.() ?? `${ componentClass.getName() }/EmbedsGroup/${ index }`;
    const itemsRaw = safeCall( () => group.getItems?.() ) ?? [];
    const items = itemsRaw.map( ( embed ) => {
        const reference = serializeEmbedReference( embed );
        recordEmbed?.( reference, name );
        return reference;
    } );

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
    handlerMap: Map<string, HandlerCapture>,
    moduleName: string,
    flowTriggersByAdapter: Map<string, Map<string, FlowTriggerDefinition[]>>,
    moduleSummary: ModuleExportSummary,
    globalEmbedStats: EmbedAuditStats,
    embedDiagnostics: ComponentEmbedDiagnostics[],
    logger: Logger
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
        const { definition, embedAudit, diagnostics } = serializeComponent( componentClass, moduleName, logger );
        components.set( componentName, definition );
        moduleSummary.components += 1;
        moduleSummary.embedsTotal += embedAudit.total;
        moduleSummary.embedsWithDefinition += embedAudit.withDefinition;
        moduleSummary.embedsMissingDefinition += embedAudit.missingDefinition;
        globalEmbedStats.total += embedAudit.total;
        globalEmbedStats.withDefinition += embedAudit.withDefinition;
        globalEmbedStats.missingDefinition += embedAudit.missingDefinition;

        if ( embedAudit.total > 0 ) {
            moduleSummary.componentsWithEmbeds += 1;
        }
        if ( diagnostics.missing.length ) {
            moduleSummary.componentsWithMissingEmbeds += 1;
            embedDiagnostics.push( diagnostics );
        }
    }

    const executionSteps = serializeExecutionSteps( adapterClass );
    const triggerCollection = new Map<string, FlowTriggerDefinition[]>();
    const bindings = await serializeBindings(
        adapterName,
        metadata,
        handlerMap,
        ( _flowName, transition, trigger ) => {
            const existing = triggerCollection.get( transition );
            if ( existing ) {
                existing.push( trigger );
            } else {
                triggerCollection.set( transition, [ trigger ] );
            }
        }
    );
    if ( triggerCollection.size ) {
        flowTriggersByAdapter.set( adapterName, triggerCollection );
    }
    const hooks = serializeAdapterHooks( adapterName, metadata, handlerMap );

    const permissions = safeCall( () => adapterInstance.getPermissions() );
    const channelTypes = safeCall( () => adapterInstance.getChannelTypes() ) ?? [];
    const instanceType = String( safeCall( () => adapterClass.getInstanceType?.() ) ?? "dynamic" );

    return {
        name: adapterName,
        adapterKind: determineAdapterKind( adapterClass as AdapterClass ),
        component: componentName,
        module: moduleName,
        instanceType,
        channelTypes: normalizeChannelTypes( channelTypes ),
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
    handlerMap: Map<string, HandlerCapture>,
    registerFlowTrigger?: FlowTriggerRegistrar
): Promise<BindingDefinition[]> {
    const entityMapHandler = metadata?.entityMapHandler as
        | ( ( binder: CaptureBinder ) => Promise<void> | void )
        | undefined;

    if ( !entityMapHandler ) {
        return [];
    }

    const bindings: BindingDefinition[] = [];

    const addFlowTriggersToBinding = (
        binding: BindingDefinition,
        options: BindingRegistrationOptions | undefined,
        handlerKind: FlowTriggerHandlerKind,
        handlerId: string,
        sourceEntity: string
    ) => {
        if ( !options?.flowTriggers?.length ) {
            return;
        }

        const triggers = options.flowTriggers.map<BindingFlowTriggerDefinition>( ( config ) => ( {
            handlerId,
            sourceEntity,
            handlerKind,
            flowName: config.flowName,
            transition: config.transition,
            navigation: config.navigation
                ? {
                    targetState: config.navigation.targetState,
                    executionStep: config.navigation.executionStep
                }
                : undefined,
            mutations: config.mutations?.map( ( mutation ) => ( {
                type: mutation.type,
                path: [ ...mutation.path ]
            } ) )
        } ) );

        binding.flowTriggers = triggers;

        if ( !registerFlowTrigger ) {
            return;
        }

        for ( const trigger of triggers ) {
            registerFlowTrigger(
                trigger.flowName,
                trigger.transition,
                {
                    handlerId: trigger.handlerId,
                    sourceEntity: trigger.sourceEntity,
                    handlerKind: trigger.handlerKind,
                    navigation: trigger.navigation
                        ? {
                            targetState: trigger.navigation.targetState,
                            executionStep: trigger.navigation.executionStep
                        }
                        : undefined,
                    mutations: trigger.mutations?.map( ( mutation ) => ( {
                        type: mutation.type,
                        path: [ ...mutation.path ]
                    } ) )
                }
            );
        }
    };

    type CaptureBinder = {
        bindButton: ( name: string, callback?: unknown, options?: BindingRegistrationOptions ) => void;
        bindModal: ( name: string, callback?: unknown, options?: BindingRegistrationOptions ) => void;
        bindModalWithButton: (
            button: string,
            modal: string,
            callback?: unknown,
            options?: BindingRegistrationOptions
        ) => void;
        bindSelectMenu: ( name: string, callback?: unknown, options?: BindingRegistrationOptions ) => void;
        bindUserSelectMenu: ( name: string, callback?: unknown, options?: BindingRegistrationOptions ) => void;
    };

    const binder: CaptureBinder = {
        bindButton: ( name: string, _callback?: unknown, options?: BindingRegistrationOptions ) => {
            const handlerId = `${ adapterName }/Bindings/Button/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            const binding: BindingDefinition = {
                entity: name,
                handler: handlerId,
                kind: "button",
                options: undefined
            };
            addFlowTriggersToBinding( binding, options, "button", handlerId, name );
            bindings.push( binding );
        },
        bindModal: ( name: string, _callback?: unknown, options?: BindingRegistrationOptions ) => {
            const handlerId = `${ adapterName }/Bindings/Modal/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            const binding: BindingDefinition = {
                entity: name,
                handler: handlerId,
                kind: "modal",
                options: undefined
            };
            addFlowTriggersToBinding( binding, options, "modal", handlerId, name );
            bindings.push( binding );
        },
        bindModalWithButton: ( button: string, modal: string, _callback?: unknown, options?: BindingRegistrationOptions ) => {
            const handlerId = `${ adapterName }/Bindings/ModalWithButton/${ button }`;
            handlerMap.set( handlerId, { id: handlerId } );
            const entity = `${ button }::${ modal }`;
            const binding: BindingDefinition = {
                entity,
                handler: handlerId,
                kind: "modal-button",
                options: {
                    button,
                    modal
                }
            };
            addFlowTriggersToBinding( binding, options, "modal-button", handlerId, entity );
            bindings.push( binding );
        },
        bindSelectMenu: ( name: string, _callback?: unknown, options?: BindingRegistrationOptions ) => {
            const handlerId = `${ adapterName }/Bindings/StringSelect/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            const binding: BindingDefinition = {
                entity: name,
                handler: handlerId,
                kind: "string-select",
                options: undefined
            };
            addFlowTriggersToBinding( binding, options, "string-select", handlerId, name );
            bindings.push( binding );
        },
        bindUserSelectMenu: ( name: string, _callback?: unknown, options?: BindingRegistrationOptions ) => {
            const handlerId = `${ adapterName }/Bindings/UserSelect/${ name }`;
            handlerMap.set( handlerId, { id: handlerId } );
            const binding: BindingDefinition = {
                entity: name,
                handler: handlerId,
                kind: "user-select",
                options: undefined
            };
            addFlowTriggersToBinding( binding, options, "user-select", handlerId, name );
            bindings.push( binding );
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

function cloneFlowTriggers( entries: FlowTriggerDefinition[] | undefined ): FlowTriggerDefinition[] | undefined {
    if ( !entries || entries.length === 0 ) {
        return undefined;
    }

    return entries.map( ( entry ) => ( {
        handlerId: entry.handlerId,
        sourceEntity: entry.sourceEntity,
        handlerKind: entry.handlerKind,
        mutations: entry.mutations
            ? entry.mutations.map( ( mutation ) => ( {
                type: mutation.type,
                path: [ ...mutation.path ]
            } ) )
            : undefined,
        navigation: entry.navigation
            ? {
                targetState: entry.navigation.targetState,
                executionStep: entry.navigation.executionStep
            }
            : undefined
    } ) );
}

async function serializeFlow(
    flowClass: FlowClass,
    moduleInstance: UIModuleBase,
    wizardAdapterComponents: Map<string, string[]>,
    moduleName: string,
    flowTriggersByAdapter: Map<string, Map<string, FlowTriggerDefinition[]>>
): Promise<FlowDefinition> {
    const flowName = flowClass.getName();
    const FlowCtor = flowClass as unknown as new ( options: { module: UIModuleBase } ) => UIFlowBase<string, string>;
    const flowInstance = new FlowCtor( { module: moduleInstance } );

    const flowAdapterName = deriveAdapterNameFromFlow( flowName );
    const wizardComponentNames = flowAdapterName ? wizardAdapterComponents.get( flowAdapterName ) : undefined;

    let wizardStateData = wizardComponentNames?.length
        ? buildWizardStateComponentDataFromNames( flowClass, wizardComponentNames )
        : undefined;

    if ( !wizardStateData && isWizardFlowInstance( flowInstance ) ) {
        wizardStateData = buildWizardStateComponentDataFromInstance( flowInstance );
    }

    const adapterTriggers = flowAdapterName ? flowTriggersByAdapter.get( flowAdapterName ) : undefined;
    const transitions = serializeFlowTransitions( flowClass, adapterTriggers );
    const states = serializeFlowStates( flowClass, wizardStateData?.stateToComponent );
    const requiredData = serializeFlowRequiredData( flowClass );
    const entryPoints = serializeIntegrationPoints( flowClass.getEntryPoints?.() ?? [] );
    const handoffPoints = serializeIntegrationPoints( flowClass.getHandoffPoints?.() ?? [] );

    const definition: FlowDefinition = {
        name: flowName,
        module: moduleName,
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
        channelTypes: normalizeChannelTypes( safeCall( () => flowInstance.getChannelTypes() ) ),
        permissions: safeCall( () => flowInstance.getPermissions()?.bitfield.toString() ),
        initialData: undefined,
        stepStates: wizardStateData?.orderedStateNames,
        stepComponents: wizardStateData?.componentNames,
        flowType: flowClass.getFlowType?.(),
        hooks: [],
        options: undefined
    };

    return definition;
}

function serializeFlowTransitions(
    flowClass: FlowClass,
    triggerMap?: Map<string, FlowTriggerDefinition[]>
): FlowDefinition[ "transitions" ] {
    const getNextStates = Reflect.get( flowClass, "getNextStates" ) as ( () => Record<string, string> ) | undefined;
    const nextStates = getNextStates?.call( flowClass ) ?? {};
    return Object.entries( nextStates ).map( ( [ transition, target ] ) => ( {
        from: transition,
        to: typeof target === "string" ? target : "",
        triggeredBy: cloneFlowTriggers( triggerMap?.get( transition ) ),
        options: undefined
    } ) );
}

function serializeFlowStates(
    flowClass: FlowClass,
    stateComponentMap?: Map<string, string>
): FlowStateDefinition[] {
    const getFlowTransitions = Reflect.get( flowClass, "getFlowTransitions" ) as ( () => Record<string, string[]> ) | undefined;
    const transitions = getFlowTransitions?.call( flowClass ) ?? {};
    const getStateOptions = Reflect.get( flowClass, "getStateOptions" ) as ( () => Record<string, JsonObject> ) | undefined;
    const stateOptions = getStateOptions?.call( flowClass ) ?? {};

    return Object.keys( transitions ).map( ( stateKey ) => ( {
        key: stateKey,
        component: stateComponentMap?.get( stateKey ) ?? null,
        transitions: transitions[ stateKey ],
        hooks: [],
        options: stateOptions[ stateKey ]
    } ) );
}

function serializeFlowRequiredData( flowClass: FlowClass ): FlowDefinition[ "requiredData" ] {
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
        integrationType: getIntegrationPointType( point ),
        options: undefined
    } ) );
}

function getComponentMetadata( componentClass: UIComponentTypeConstructor ): ComponentBuilderMetadata | undefined {
    return Reflect.get( componentClass, BUILDER_METADATA_SYMBOL ) as ComponentBuilderMetadata | undefined;
}

function getAdapterMetadata( adapterClass: TAdapterClassType ): AdapterBuilderMetadata | undefined {
    return Reflect.get( adapterClass, BUILDER_METADATA_SYMBOL ) as AdapterBuilderMetadata | undefined;
}

function getEmbedMetadata( embedClass: typeof UIEmbedBase ): EmbedBuilderMetadata | undefined {
    return Reflect.get( embedClass, BUILDER_METADATA_SYMBOL ) as EmbedBuilderMetadata | undefined;
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

function callStaticArray<T>( ClassCtor: object, method: string ): T[] | undefined {
    const fn = Reflect.get( ClassCtor, method );

    if ( typeof fn !== "function" ) {
        return undefined;
    }

    const result = fn.call( ClassCtor );

    return Array.isArray( result ) ? ( result as T[] ) : undefined;
}

function serializeEmbedReference( embed: unknown ): EmbedReference {
    const embedName = extractEntityName( embed );
    let definition: EmbedContentDefinition | undefined;

    if ( typeof embed === "function" ) {
        const embedClass = embed as typeof UIEmbedBase;
        const metadata = getEmbedMetadata( embedClass );
        definition = buildEmbedDefinitionFromMetadata( metadata );
    }

    const reference: EmbedReference = { embed: embedName };

    if ( definition && Object.keys( definition ).length ) {
        reference.definition = definition;
    }

    return reference;
}

function buildEmbedDefinitionFromMetadata<TArgs extends UIArgs, TVars extends Record<string, JsonValue>>(
    metadata: EmbedBuilderMetadata<TArgs, TVars> | undefined
): EmbedContentDefinition | undefined {
    if ( !metadata ) {
        return undefined;
    }

    const vars = metadata.vars;
    const definition: EmbedContentDefinition = {};

    if ( metadata.instanceType ) {
        definition.instanceType = String( metadata.instanceType );
    }

    const title = evaluateEmbedText( metadata.title, vars );
    if ( title ) {
        definition.title = title;
    }

    const description = evaluateEmbedText( metadata.description, vars );
    if ( description ) {
        definition.description = description;
    }

    const footer = evaluateEmbedText( metadata.footer, vars );
    if ( footer ) {
        definition.footer = footer;
    }

    const image = evaluateEmbedText( metadata.image, vars );
    if ( image ) {
        definition.image = image;
    }

    const colorValue = evaluateEmbedNumber( metadata.color, vars );
    if ( colorValue !== undefined ) {
        definition.color = colorValue;
    }

    const optionsValue = evaluateEmbedOptions( metadata.options, vars );
    if ( optionsValue ) {
        definition.options = optionsValue;
    }

    const arrayOptionsValue = evaluateEmbedOptions( metadata.arrayOptions, vars );
    if ( arrayOptionsValue ) {
        definition.arrayOptions = arrayOptionsValue;
    }

    if ( vars !== undefined ) {
        definition.vars = serializeEmbedVars( vars );
    }

    return Object.keys( definition ).length ? definition : undefined;
}

function evaluateEmbedText<TVars>(
    source: StringHandler<TVars> | undefined,
    vars: TVars | undefined
): string | undefined {
    const value = evaluateEmbedValue( source, vars );

    if ( typeof value === "string" && value.length > 0 ) {
        return value;
    }

    return undefined;
}

function evaluateEmbedNumber<TVars>(
    source: NumberHandler<TVars> | undefined,
    vars: TVars | undefined
): number | undefined {
    const value = evaluateEmbedValue( source, vars );

    return typeof value === "number" ? value : undefined;
}

function evaluateEmbedOptions<TVars>(
    source: OptionsHandler<TVars> | undefined,
    vars: TVars | undefined
): JsonObject | undefined {
    const value = evaluateEmbedValue( source, vars );

    if ( value && isJsonObjectValue( value ) ) {
        return serializeOptionsObject( value );
    }

    return undefined;
}

function evaluateEmbedValue<TResult, TVars>(
    source: ( ( vars: TVars ) => Promise<TResult> | TResult ) | TResult | undefined,
    vars: TVars | undefined
): TResult | undefined {
    if ( source === undefined ) {
        return undefined;
    }

    if ( typeof source === "function" ) {
        if ( vars === undefined ) {
            return undefined;
        }

        try {
            const result = ( source as ( input: TVars ) => TResult | Promise<TResult> )( vars );

            if ( typeof result === "object" && result !== null && isPromise( result ) ) {
                return undefined;
            }

            return result;
        } catch {
            return undefined;
        }
    }

    return source as TResult;
}

function serializeEmbedVars<TVars extends Record<string, JsonValue>>( vars: TVars ): JsonValue {
    const entries = Object.entries( vars ).map<[ string, JsonValue ]>( ( [ key, value ] ) => [
        key,
        normalizeJsonValue( value )
    ] );

    return Object.fromEntries( entries );
}

function serializeOptionsObject( options: JsonObject ): JsonObject {
    const result: Record<string, JsonValue> = {};

    for ( const [ key, value ] of Object.entries( options ) ) {
        result[ key ] = normalizeJsonValue( value );
    }

    return result as JsonObject;
}

function normalizeJsonValue( value: JsonValue ): JsonValue {
    if ( value === null ) {
        return null;
    }

    if ( Array.isArray( value ) ) {
        return value.map( ( entry ) => normalizeJsonValue( entry ) );
    }

    if ( isJsonObjectValue( value ) ) {
        return serializeOptionsObject( value );
    }

    return value;
}

function isJsonObjectValue( value: JsonValue ): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray( value );
}

function isPromise<T>( value: object ): value is Promise<T> {
    return typeof ( value as { then?: unknown } ).then === "function";
}

function callStaticString( ClassCtor: object, method: string ): string | undefined {
    const fn = Reflect.get( ClassCtor, method );

    if ( typeof fn !== "function" ) {
        return undefined;
    }

    const result = fn.call( ClassCtor );

    return typeof result === "string" ? result : undefined;
}

function normalizeChannelTypes( channelTypes: readonly unknown[] | undefined ): string[] | undefined {
    if ( !channelTypes?.length ) {
        return undefined;
    }

    const labels: string[] = [];
    const seen = new Set<string>();

    for ( const entry of channelTypes ) {
        const label = resolveChannelTypeLabel( entry );
        if ( !seen.has( label ) ) {
            seen.add( label );
            labels.push( label );
        }
    }

    return labels;
}

function resolveChannelTypeLabel( entry: unknown ): string {
    if ( typeof entry === "string" ) {
        if ( Object.prototype.hasOwnProperty.call( ChannelType, entry ) ) {
            return entry;
        }

        const numeric = Number( entry );
        if ( Number.isInteger( numeric ) ) {
            return resolveChannelTypeLabel( numeric );
        }

        return entry;
    }

    if ( typeof entry === "number" ) {
        const candidate = Reflect.get( ChannelType, entry ) as string | undefined;
        if ( typeof candidate === "string" ) {
            return candidate;
        }

        return entry.toString();
    }

    return String( entry );
}

function createElementsGroupFromDirect(
    name: string | null | undefined,
    elements: unknown
): ElementsGroupDefinition {
    const groupName = name ?? "Component/Elements";
    const rows = normalize2D( elements ).map( ( row ) =>
        row.map( ( element ) => ( {
            element: extractEntityName( element )
        } ) )
    );

    return {
        name: groupName,
        resolver: undefined,
        items: rows,
        options: undefined
    };
}

function getIntegrationPointType( point: FlowIntegrationPointBase ): FlowIntegrationPointDefinition[ "integrationType" ] {
    const ctor = point.constructor as { getType?: () => FlowIntegrationPointDefinition[ "integrationType" ] };
    return typeof ctor.getType === "function" ? ctor.getType() : undefined;
}

interface WizardStateComponentData {
    stateToComponent: Map<string, string>;
    orderedStateNames: string[];
    componentNames: string[];
}

function isWizardFlowInstance( flow: UIFlowBase<string, string> ): flow is UIWizardFlowBase {
    return typeof ( flow as UIWizardFlowBase ).getStepComponents === "function";
}

function buildWizardStateComponentDataFromInstance( flowInstance: UIWizardFlowBase ): WizardStateComponentData {
    const stateToComponent = new Map<string, string>();
    const orderedStateNames: string[] = [];

    const componentNames = flowInstance
        .getStepComponents()
        .map( ( ComponentCtor ) => callStaticString( ComponentCtor, "getName" ) )
        .filter( ( name ): name is string => typeof name === "string" && name.length > 0 );

    const flowClass = flowInstance.constructor as FlowClass;
    const transitionsFactory = Reflect.get( flowClass, "getFlowTransitions" ) as ( () => Record<string, string[]> ) | undefined;
    const stateKeys = Object.keys( transitionsFactory?.call( flowClass ) ?? {} );

    for ( const stateKey of stateKeys ) {
        const stepIndex = extractWizardStepIndex( stateKey );

        if ( stepIndex === null ) {
            continue;
        }

        const componentName = componentNames[ stepIndex ];

        if ( !componentName ) {
            continue;
        }

        stateToComponent.set( stateKey, componentName );
        orderedStateNames[ stepIndex ] = stateKey;
    }

    return {
        stateToComponent,
        orderedStateNames: orderedStateNames.filter( Boolean ),
        componentNames
    };
}

function extractWizardStepIndex( stateKey: string ): number | null {
    const match = stateKey.match( /\/States\/Step(\d+)/ );

    if ( !match ) {
        return null;
    }

    const value = parseInt( match[ 1 ], 10 );

    return Number.isNaN( value ) ? null : Math.max( value - 1, 0 );
}

function buildWizardStateComponentDataFromNames(
    flowClass: FlowClass,
    componentNames: readonly string[]
): WizardStateComponentData | undefined {
    const stateToComponent = new Map<string, string>();
    const orderedStateNames: string[] = [];

    const transitionsFactory = Reflect.get( flowClass, "getFlowTransitions" ) as ( () => Record<string, string[]> ) | undefined;
    const stateKeys = Object.keys( transitionsFactory?.call( flowClass ) ?? {} );

    for ( const stateKey of stateKeys ) {
        const stepIndex = extractWizardStepIndex( stateKey );

        if ( stepIndex === null ) {
            continue;
        }

        const componentName = componentNames[ stepIndex ];

        if ( !componentName ) {
            continue;
        }

        stateToComponent.set( stateKey, componentName );
        orderedStateNames[ stepIndex ] = stateKey;
    }

    if ( stateToComponent.size === 0 ) {
        return undefined;
    }

    return {
        stateToComponent,
        orderedStateNames: orderedStateNames.filter( Boolean ),
        componentNames: [ ...componentNames ]
    };
}

function deriveAdapterNameFromFlow( flowName: string ): string | undefined {
    if ( !flowName ) {
        return undefined;
    }

    return flowName.replace( /Flow$/, "Adapter" );
}

function extractWizardComponentNames( metadata: AdapterBuilderMetadata | undefined ): string[] | undefined {
    const components = metadata?.wizard?.componentConfig?.components;

    if ( !components?.length ) {
        return undefined;
    }

    const names = components
        .map( ( ComponentCtor ) => callStaticString( ComponentCtor, "getName" ) )
        .filter( ( name ): name is string => typeof name === "string" && name.length > 0 );

    return names.length ? names : undefined;
}
