import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ChannelType } from "discord.js";

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
    FlowContextMutationDefinition,
    FlowNavigationDefinition,
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

type AdapterConstructor = new ( ...args: never[] ) => UIAdapterBase<any, any>;

type AdapterClass =
    | AdapterConstructor
    | typeof UIAdapterExecutionStepsBase
    | typeof UIWizardAdapterBase;

type FlowClass = typeof UIFlowBase;

type FlowTriggerCollection = Map<string, FlowTriggerDefinition[]>;
type FlowTriggersByAdapter = Map<string, FlowTriggerCollection>;
type BindingFlowTriggerMap = Map<string, BindingFlowTriggerDefinition[]>;

interface AdapterTriggerData {
    flowName: string;
    byTransition: FlowTriggerCollection;
    byHandler: BindingFlowTriggerMap;
}

export async function exportUIDefinitions( uiService: UIService, options: ExporterOptions ) {
    const includeComponents = options.includeComponents ?? true;
    const includeAdapters = options.includeAdapters ?? true;
    const includeFlows = options.includeFlows ?? true;

    const components = new Map<string, ComponentDefinition>();
    const adapters: AdapterDefinition[] = [];
    const flows: FlowDefinition[] = [];

    const handlerMap = new Map<string, HandlerCapture>();
    const wizardAdapterComponents = new Map<string, string[]>();
    const flowTriggersByAdapter: FlowTriggersByAdapter = new Map();

    const modules = uiService.getUIModules();

    for ( const [ moduleName, ModuleCtor ] of modules ) {
        log.info( "exportUIDefinitions", `Exporting module ${ moduleName }` );
        const moduleInstance = uiService.getUIModule<UIModuleBase>( moduleName, true ) ?? new ModuleCtor();

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
                        flowTriggersByAdapter
                    );
                    adapters.push( definition );

                    const adapterMetadata = getAdapterMetadata( adapterClass );
                    const wizardComponents = extractWizardComponentNames( adapterMetadata );

                    if ( wizardComponents?.length ) {
                        wizardAdapterComponents.set( adapterClass.getName(), wizardComponents );
                    }
                } catch( error ) {
                    log.error(
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
                } catch( error ) {
                    log.error(
                        "exportUIDefinitions",
                        `Failed to export flow '${ flowClass.getName?.() ?? flowClass }'`,
                        error
                    );
                    throw error;
                }
            }
        }
    }

    if ( includeFlows ) {
        const additionalFlows = buildStaticFlowDefinitions( flows, flowTriggersByAdapter );
        for ( const flowDefinition of additionalFlows ) {
            flows.push( flowDefinition );
        }
    }

    const exportMeta = {
        schemaVersion: "1.0.0",
        exportedAt: new Date().toISOString(),
        counts: {
            components: components.size,
            adapters: adapters.length,
            flows: flows.length
        },
        modules: Array.from( modules.keys() )
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

    log.info(
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

function serializeComponent( componentClass: UIComponentTypeConstructor, moduleName?: string ): ComponentDefinition {
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

    let embedsGroups = rawEmbedsGroups.map( ( group, index ) =>
        serializeEmbedsGroup( componentClass, group, index )
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
                    items: directEmbeds.map( ( embed ) => serializeEmbedReference( embed ) ),
                    options: undefined
                }
            ];
        }
    }

    return {
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
    const items = itemsRaw.map( ( embed ) => serializeEmbedReference( embed ) );

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
    flowTriggersByAdapter: FlowTriggersByAdapter
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
        components.set( componentName, serializeComponent( componentClass, moduleName ) );
    }

    const executionSteps = serializeExecutionSteps( adapterClass );
    const bindings = await serializeBindings( adapterName, metadata, handlerMap );
    const triggerData = captureFlowTriggersForAdapter( adapterName, bindings );
    if ( triggerData ) {
        if ( triggerData.byTransition.size ) {
            flowTriggersByAdapter.set( adapterName, triggerData.byTransition );
        }
        applyBindingFlowTriggers( bindings, triggerData.byHandler );
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

function captureFlowTriggersForAdapter(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    if ( adapterName === "VertixBot/UI-V3/SetupNewWizardAdapter" ) {
        return buildSetupNewWizardFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelRenameAdapter" ) {
        return buildDynamicChannelRenameFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter" ) {
        return buildDynamicChannelTransferOwnerFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelLimitAdapter" ) {
        return buildDynamicChannelLimitFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelClearChatAdapter" ) {
        return buildDynamicChannelClearChatFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelResetChannelAdapter" ) {
        return buildDynamicChannelResetChannelFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelRegionAdapter" ) {
        return buildDynamicChannelRegionFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelPermissionsAdapter" ) {
        return buildDynamicChannelPermissionsFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelPrivacyAdapter" ) {
        return buildDynamicChannelPrivacyFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" ) {
        return buildDynamicChannelPrimaryMessageEditFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/ClaimStartAdapter" ) {
        return buildClaimStartFlowTriggers( adapterName, bindings );
    }
    if ( adapterName === "VertixBot/UI-V3/ClaimVoteAdapter" ) {
        return buildClaimVoteFlowTriggers( adapterName, bindings );
    }

    return undefined;
}

function applyBindingFlowTriggers(
    bindings: BindingDefinition[],
    handlerTriggers: BindingFlowTriggerMap
): void {
    for ( const binding of bindings ) {
        const triggers = handlerTriggers.get( binding.handler );
        if ( triggers && triggers.length ) {
            binding.flowTriggers = triggers;
        }
    }
}

function buildSetupNewWizardFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const flowName = "VertixBot/UI-V3/SetupNewWizardFlow";
    const stateStep1 = `${ flowName }/States/Step1NameTemplate`;
    const stateStep2 = `${ flowName }/States/Step2Buttons`;
    const stateStep3 = `${ flowName }/States/Step3Roles`;
    const stateToComponent = new Map<string, string>( [
        [ stateStep1, "VertixBot/UI-V3/SetupStep1Component" ],
        [ stateStep2, "VertixBot/UI-V3/SetupStep2Component" ],
        [ stateStep3, "VertixBot/UI-V3/SetupStep3Component" ]
    ] );

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    const startSetup =
        `${ adapterName }/Bindings/Button/VertixBot/UI-General/SetupMasterCreateV3Button`;
    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        `${ flowName }/Transitions/StartSetup`,
        createFlowTriggerFromBinding(
            bindingIndex.get( startSetup ),
            flowName,
            `${ flowName }/Transitions/StartSetup`,
            {
                navigation: {
                    targetState: stateStep1,
                    executionStep: stateToComponent.get( stateStep1 )
                }
            }
        )
    );

    const submitTemplate =
        `${ adapterName }/Bindings/ModalWithButton/VertixBot/UI-General/ChannelNameTemplateEditButton`;
    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        `${ flowName }/Transitions/UpdateNameTemplateModal`,
        createFlowTriggerFromBinding(
            bindingIndex.get( submitTemplate ),
            flowName,
            `${ flowName }/Transitions/UpdateNameTemplateModal`,
            {
                mutations: [
                    { type: "set", path: [ "dynamicChannelNameTemplate" ] }
                ],
                navigation: {
                    targetState: stateStep1,
                    executionStep: stateToComponent.get( stateStep1 )
                }
            }
        )
    );

    const selectButtonsHandler =
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu`;
    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        `${ flowName }/Transitions/SelectButtons`,
        createFlowTriggerFromBinding(
            bindingIndex.get( selectButtonsHandler ),
            flowName,
            `${ flowName }/Transitions/SelectButtons`,
            {
                mutations: [
                    { type: "set", path: [ "dynamicChannelButtonsTemplate" ] }
                ],
                navigation: {
                    targetState: stateStep2,
                    executionStep: stateToComponent.get( stateStep2 )
                }
            }
        )
    );

    const updateConfigHandler =
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-General/ConfigExtrasSelectMenu`;
    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        `${ flowName }/Transitions/UpdateConfigExtras`,
        createFlowTriggerFromBinding(
            bindingIndex.get( updateConfigHandler ),
            flowName,
            `${ flowName }/Transitions/UpdateConfigExtras`,
            {
                mutations: [
                    { type: "set", path: [ "dynamicChannelMentionable" ] },
                    { type: "set", path: [ "dynamicChannelAutoSave" ] }
                ],
                navigation: {
                    targetState: stateStep2,
                    executionStep: stateToComponent.get( stateStep2 )
                }
            }
        )
    );

    const selectRolesHandler =
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-General/VerifiedRolesMenu`;
    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        `${ flowName }/Transitions/SelectRoles`,
        createFlowTriggerFromBinding(
            bindingIndex.get( selectRolesHandler ),
            flowName,
            `${ flowName }/Transitions/SelectRoles`,
            {
                mutations: [
                    { type: "set", path: [ "dynamicChannelVerifiedRoles" ] }
                ],
                navigation: {
                    targetState: stateStep3,
                    executionStep: stateToComponent.get( stateStep3 )
                }
            }
        )
    );

    const everyoneHandler =
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu`;
    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        `${ flowName }/Transitions/UpdateVerifiedEveryone`,
        createFlowTriggerFromBinding(
            bindingIndex.get( everyoneHandler ),
            flowName,
            `${ flowName }/Transitions/UpdateVerifiedEveryone`,
            {
                mutations: [
                    { type: "set", path: [ "dynamicChannelIncludeEveryoneRole" ] },
                    { type: "set", path: [ "dynamicChannelVerifiedRoles" ] }
                ],
                navigation: {
                    targetState: stateStep3,
                    executionStep: stateToComponent.get( stateStep3 )
                }
            }
        )
    );

    if ( !collection.size ) {
        return undefined;
    }

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelRenameFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelRenameFlow";
    const stateSuccess = `${ flowName }/States/Success`;
    const stateBadword = `${ flowName }/States/Badword`;
    const stateRateLimited = `${ flowName }/States/RateLimited`;

    const transitionSuccess = `${ flowName }/Transitions/SubmitRenameSuccess`;
    const transitionBadword = `${ flowName }/Transitions/SubmitRenameBadword`;
    const transitionRateLimited = `${ flowName }/Transitions/SubmitRenameRateLimited`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const modalBinding = bindings.find(
        ( binding ) => binding.entity === "VertixBot/UI-V3/DynamicChannelRenameModal"
    );

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    const triggerSuccess = createFlowTriggerFromBinding(
        modalBinding,
        flowName,
        transitionSuccess,
        {
            navigation: {
                targetState: stateSuccess,
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameSuccess"
            }
        }
    );
    appendFlowTrigger( collection, handlerMap, flowName, transitionSuccess, triggerSuccess );

    const triggerBadword = createFlowTriggerFromBinding(
        modalBinding,
        flowName,
        transitionBadword,
        {
            mutations: [
                {
                    type: "set",
                    path: [ "badword" ]
                }
            ],
            navigation: {
                targetState: stateBadword,
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameBadword"
            }
        }
    );
    appendFlowTrigger( collection, handlerMap, flowName, transitionBadword, triggerBadword );

    const triggerRateLimited = createFlowTriggerFromBinding(
        modalBinding,
        flowName,
        transitionRateLimited,
        {
            mutations: [
                {
                    type: "set",
                    path: [ "retryAfter" ]
                },
                {
                    type: "set",
                    path: [ "masterChannelId" ]
                }
            ],
            navigation: {
                targetState: stateRateLimited,
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameRateLimited"
            }
        }
    );
    appendFlowTrigger( collection, handlerMap, flowName, transitionRateLimited, triggerRateLimited );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelPermissionsFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelPermissionsFlow";

    const statePublic = `${ flowName }/States/Public`;
    const statePrivate = `${ flowName }/States/Private`;
    const stateHidden = `${ flowName }/States/Hidden`;
    const stateShown = `${ flowName }/States/Shown`;
    const stateGranted = `${ flowName }/States/Granted`;
    const stateDenied = `${ flowName }/States/Denied`;
    const stateBlocked = `${ flowName }/States/Blocked`;
    const stateUnblocked = `${ flowName }/States/Unblocked`;
    const stateKicked = `${ flowName }/States/Kicked`;
    const stateError = `${ flowName }/States/Error`;
    const stateNothingChanged = `${ flowName }/States/NothingChanged`;

    const transitionSetPublic = `${ flowName }/Transitions/SetPublic`;
    const transitionSetPrivate = `${ flowName }/Transitions/SetPrivate`;
    const transitionSetHidden = `${ flowName }/Transitions/SetHidden`;
    const transitionSetShown = `${ flowName }/Transitions/SetShown`;
    const transitionGrantSuccess = `${ flowName }/Transitions/GrantAccessSuccess`;
    const transitionGrantError = `${ flowName }/Transitions/GrantAccessError`;
    const transitionDenySuccess = `${ flowName }/Transitions/DenyAccessSuccess`;
    const transitionDenyNothing = `${ flowName }/Transitions/DenyAccessNothingChanged`;
    const transitionDenyError = `${ flowName }/Transitions/DenyAccessError`;
    const transitionBlockSuccess = `${ flowName }/Transitions/BlockUserSuccess`;
    const transitionBlockNothing = `${ flowName }/Transitions/BlockUserNothingChanged`;
    const transitionBlockError = `${ flowName }/Transitions/BlockUserError`;
    const transitionUnblockSuccess = `${ flowName }/Transitions/UnblockUserSuccess`;
    const transitionUnblockNothing = `${ flowName }/Transitions/UnblockUserNothingChanged`;
    const transitionUnblockError = `${ flowName }/Transitions/UnblockUserError`;
    const transitionKickSuccess = `${ flowName }/Transitions/KickUserSuccess`;
    const transitionKickError = `${ flowName }/Transitions/KickUserError`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    const stateButtonBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Button/VertixBot/UI-V3/DynamicChannelPermissionsStateButton`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSetPublic,
        createFlowTriggerFromBinding(
            stateButtonBinding,
            flowName,
            transitionSetPublic,
            {
                navigation: {
                    targetState: statePublic,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePublic"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSetPrivate,
        createFlowTriggerFromBinding(
            stateButtonBinding,
            flowName,
            transitionSetPrivate,
            {
                navigation: {
                    targetState: statePrivate,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePrivate"
                }
            }
        )
    );

    const visibilityButtonBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Button/VertixBot/UI-V3/DynamicChannelPermissionsVisibilityButton`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSetHidden,
        createFlowTriggerFromBinding(
            visibilityButtonBinding,
            flowName,
            transitionSetHidden,
            {
                navigation: {
                    targetState: stateHidden,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateHidden"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSetShown,
        createFlowTriggerFromBinding(
            visibilityButtonBinding,
            flowName,
            transitionSetShown,
            {
                navigation: {
                    targetState: stateShown,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateShown"
                }
            }
        )
    );

    const grantBinding = bindingIndex.get(
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionGrantSuccess,
        createFlowTriggerFromBinding(
            grantBinding,
            flowName,
            transitionGrantSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "userGrantedDisplayName" ]
                    }
                ],
                navigation: {
                    targetState: stateGranted,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsGranted"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionGrantError,
        createFlowTriggerFromBinding(
            grantBinding,
            flowName,
            transitionGrantError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                }
            }
        )
    );

    const denyBinding = bindingIndex.get(
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionDenySuccess,
        createFlowTriggerFromBinding(
            denyBinding,
            flowName,
            transitionDenySuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "userDeniedDisplayName" ]
                    }
                ],
                navigation: {
                    targetState: stateDenied,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsDenied"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionDenyNothing,
        createFlowTriggerFromBinding(
            denyBinding,
            flowName,
            transitionDenyNothing,
            {
                navigation: {
                    targetState: stateNothingChanged,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionDenyError,
        createFlowTriggerFromBinding(
            denyBinding,
            flowName,
            transitionDenyError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                }
            }
        )
    );

    const blockBinding = bindingIndex.get(
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionBlockSuccess,
        createFlowTriggerFromBinding(
            blockBinding,
            flowName,
            transitionBlockSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "userBlockedDisplayName" ]
                    }
                ],
                navigation: {
                    targetState: stateBlocked,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsBlocked"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionBlockNothing,
        createFlowTriggerFromBinding(
            blockBinding,
            flowName,
            transitionBlockNothing,
            {
                navigation: {
                    targetState: stateNothingChanged,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionBlockError,
        createFlowTriggerFromBinding(
            blockBinding,
            flowName,
            transitionBlockError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                }
            }
        )
    );

    const unblockBinding = bindingIndex.get(
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionUnblockSuccess,
        createFlowTriggerFromBinding(
            unblockBinding,
            flowName,
            transitionUnblockSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "userUnBlockedDisplayName" ]
                    }
                ],
                navigation: {
                    targetState: stateUnblocked,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionUnblockNothing,
        createFlowTriggerFromBinding(
            unblockBinding,
            flowName,
            transitionUnblockNothing,
            {
                navigation: {
                    targetState: stateNothingChanged,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionUnblockError,
        createFlowTriggerFromBinding(
            unblockBinding,
            flowName,
            transitionUnblockError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                }
            }
        )
    );

    const kickBinding = bindingIndex.get(
        `${ adapterName }/Bindings/StringSelect/VertixBot/UI-V3/DynamicChannelPermissionsKickMenu`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionKickSuccess,
        createFlowTriggerFromBinding(
            kickBinding,
            flowName,
            transitionKickSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "userKickedDisplayName" ]
                    }
                ],
                navigation: {
                    targetState: stateKicked,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsKick"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionKickError,
        createFlowTriggerFromBinding(
            kickBinding,
            flowName,
            transitionKickError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
                }
            }
        )
    );

    if ( !collection.size ) {
        return undefined;
    }

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelPermissionsFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelPermissionsFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelPermissionsAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateDefault = `${ flowName }/States/Default`;
    const statePublic = `${ flowName }/States/Public`;
    const statePrivate = `${ flowName }/States/Private`;
    const stateHidden = `${ flowName }/States/Hidden`;
    const stateShown = `${ flowName }/States/Shown`;
    const stateGranted = `${ flowName }/States/Granted`;
    const stateDenied = `${ flowName }/States/Denied`;
    const stateBlocked = `${ flowName }/States/Blocked`;
    const stateUnblocked = `${ flowName }/States/Unblocked`;
    const stateKicked = `${ flowName }/States/Kicked`;
    const stateError = `${ flowName }/States/Error`;
    const stateNothingChanged = `${ flowName }/States/NothingChanged`;

    const transitionSetPublic = `${ flowName }/Transitions/SetPublic`;
    const transitionSetPrivate = `${ flowName }/Transitions/SetPrivate`;
    const transitionSetHidden = `${ flowName }/Transitions/SetHidden`;
    const transitionSetShown = `${ flowName }/Transitions/SetShown`;
    const transitionGrantSuccess = `${ flowName }/Transitions/GrantAccessSuccess`;
    const transitionGrantError = `${ flowName }/Transitions/GrantAccessError`;
    const transitionDenySuccess = `${ flowName }/Transitions/DenyAccessSuccess`;
    const transitionDenyNothing = `${ flowName }/Transitions/DenyAccessNothingChanged`;
    const transitionDenyError = `${ flowName }/Transitions/DenyAccessError`;
    const transitionBlockSuccess = `${ flowName }/Transitions/BlockUserSuccess`;
    const transitionBlockNothing = `${ flowName }/Transitions/BlockUserNothingChanged`;
    const transitionBlockError = `${ flowName }/Transitions/BlockUserError`;
    const transitionUnblockSuccess = `${ flowName }/Transitions/UnblockUserSuccess`;
    const transitionUnblockNothing = `${ flowName }/Transitions/UnblockUserNothingChanged`;
    const transitionUnblockError = `${ flowName }/Transitions/UnblockUserError`;
    const transitionKickSuccess = `${ flowName }/Transitions/KickUserSuccess`;
    const transitionKickError = `${ flowName }/Transitions/KickUserError`;

    const transitionsList: string[] = [
        transitionSetPublic,
        transitionSetPrivate,
        transitionSetHidden,
        transitionSetShown,
        transitionGrantSuccess,
        transitionGrantError,
        transitionDenySuccess,
        transitionDenyNothing,
        transitionDenyError,
        transitionBlockSuccess,
        transitionBlockNothing,
        transitionBlockError,
        transitionUnblockSuccess,
        transitionUnblockNothing,
        transitionUnblockError,
        transitionKickSuccess,
        transitionKickError
    ];

    const states: FlowStateDefinition[] = [
        {
            key: stateDefault,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "default"
            }
        },
        {
            key: statePublic,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePublic"
            }
        },
        {
            key: statePrivate,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePrivate"
            }
        },
        {
            key: stateHidden,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateHidden"
            }
        },
        {
            key: stateShown,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateShown"
            }
        },
        {
            key: stateGranted,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsGranted"
            }
        },
        {
            key: stateDenied,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsDenied"
            }
        },
        {
            key: stateBlocked,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsBlocked"
            }
        },
        {
            key: stateUnblocked,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked"
            }
        },
        {
            key: stateKicked,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsKick"
            }
        },
        {
            key: stateError,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
            }
        },
        {
            key: stateNothingChanged,
            component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
            transitions: transitionsList,
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionSetPublic,
            to: statePublic,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSetPublic ) ),
            options: undefined
        },
        {
            from: transitionSetPrivate,
            to: statePrivate,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSetPrivate ) ),
            options: undefined
        },
        {
            from: transitionSetHidden,
            to: stateHidden,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSetHidden ) ),
            options: undefined
        },
        {
            from: transitionSetShown,
            to: stateShown,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSetShown ) ),
            options: undefined
        },
        {
            from: transitionGrantSuccess,
            to: stateGranted,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionGrantSuccess ) ),
            options: undefined
        },
        {
            from: transitionGrantError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionGrantError ) ),
            options: undefined
        },
        {
            from: transitionDenySuccess,
            to: stateDenied,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionDenySuccess ) ),
            options: undefined
        },
        {
            from: transitionDenyNothing,
            to: stateNothingChanged,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionDenyNothing ) ),
            options: undefined
        },
        {
            from: transitionDenyError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionDenyError ) ),
            options: undefined
        },
        {
            from: transitionBlockSuccess,
            to: stateBlocked,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionBlockSuccess ) ),
            options: undefined
        },
        {
            from: transitionBlockNothing,
            to: stateNothingChanged,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionBlockNothing ) ),
            options: undefined
        },
        {
            from: transitionBlockError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionBlockError ) ),
            options: undefined
        },
        {
            from: transitionUnblockSuccess,
            to: stateUnblocked,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionUnblockSuccess ) ),
            options: undefined
        },
        {
            from: transitionUnblockNothing,
            to: stateNothingChanged,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionUnblockNothing ) ),
            options: undefined
        },
        {
            from: transitionUnblockError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionUnblockError ) ),
            options: undefined
        },
        {
            from: transitionKickSuccess,
            to: stateKicked,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionKickSuccess ) ),
            options: undefined
        },
        {
            from: transitionKickError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionKickError ) ),
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionGrantSuccess,
            fields: [ "userGrantedDisplayName" ],
            options: undefined
        },
        {
            transition: transitionDenySuccess,
            fields: [ "userDeniedDisplayName" ],
            options: undefined
        },
        {
            transition: transitionBlockSuccess,
            fields: [ "userBlockedDisplayName" ],
            options: undefined
        },
        {
            transition: transitionUnblockSuccess,
            fields: [ "userUnBlockedDisplayName" ],
            options: undefined
        },
        {
            transition: transitionKickSuccess,
            fields: [ "userKickedDisplayName" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateDefault,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildStaticFlowDefinitions(
    existingFlows: FlowDefinition[],
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition[] {
    const existing = new Set( existingFlows.map( ( flow ) => flow.name ) );
    const results: FlowDefinition[] = [];

    const renameFlow = buildDynamicChannelRenameFlowDefinition( flowTriggersByAdapter );
    if ( renameFlow && !existing.has( renameFlow.name ) ) {
        results.push( renameFlow );
    }

    const transferFlow = buildDynamicChannelTransferOwnerFlowDefinition( flowTriggersByAdapter );
    if ( transferFlow && !existing.has( transferFlow.name ) ) {
        results.push( transferFlow );
    }

    const limitFlow = buildDynamicChannelLimitFlowDefinition( flowTriggersByAdapter );
    if ( limitFlow && !existing.has( limitFlow.name ) ) {
        results.push( limitFlow );
    }

    const clearChatFlow = buildDynamicChannelClearChatFlowDefinition( flowTriggersByAdapter );
    if ( clearChatFlow && !existing.has( clearChatFlow.name ) ) {
        results.push( clearChatFlow );
    }

    const resetFlow = buildDynamicChannelResetChannelFlowDefinition( flowTriggersByAdapter );
    if ( resetFlow && !existing.has( resetFlow.name ) ) {
        results.push( resetFlow );
    }

    const regionFlow = buildDynamicChannelRegionFlowDefinition( flowTriggersByAdapter );
    if ( regionFlow && !existing.has( regionFlow.name ) ) {
        results.push( regionFlow );
    }

    const permissionsFlow = buildDynamicChannelPermissionsFlowDefinition( flowTriggersByAdapter );
    if ( permissionsFlow && !existing.has( permissionsFlow.name ) ) {
        results.push( permissionsFlow );
    }

    const privacyFlow = buildDynamicChannelPrivacyFlowDefinition( flowTriggersByAdapter );
    if ( privacyFlow && !existing.has( privacyFlow.name ) ) {
        results.push( privacyFlow );
    }

    const primaryMessageEditFlow = buildDynamicChannelPrimaryMessageEditFlowDefinition( flowTriggersByAdapter );
    if ( primaryMessageEditFlow && !existing.has( primaryMessageEditFlow.name ) ) {
        results.push( primaryMessageEditFlow );
    }

    const claimStartFlow = buildClaimStartFlowDefinition( flowTriggersByAdapter );
    if ( claimStartFlow && !existing.has( claimStartFlow.name ) ) {
        results.push( claimStartFlow );
    }

    const claimVoteFlow = buildClaimVoteFlowDefinition( flowTriggersByAdapter );
    if ( claimVoteFlow && !existing.has( claimVoteFlow.name ) ) {
        results.push( claimVoteFlow );
    }

    const claimResultFlowName = "VertixBot/UI-V3/ClaimResultFlow";
    if ( !existing.has( claimResultFlowName ) ) {
        results.push( buildClaimResultFlowDefinition() );
    }

    return results;
}

function buildDynamicChannelRenameFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelRenameFlow";
    const transitionSuccess = `${ flowName }/Transitions/SubmitRenameSuccess`;
    const transitionBadword = `${ flowName }/Transitions/SubmitRenameBadword`;
    const transitionRateLimited = `${ flowName }/Transitions/SubmitRenameRateLimited`;
    const stateInitial = `${ flowName }/States/Initial`;
    const stateSuccess = `${ flowName }/States/Success`;
    const stateBadword = `${ flowName }/States/Badword`;
    const stateRateLimited = `${ flowName }/States/RateLimited`;

    const adapterName = "VertixBot/UI-V3/DynamicChannelRenameAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const states: FlowStateDefinition[] = [
        {
            key: stateInitial,
            component: "VertixBot/UI-V3/DynamicChannelRenameComponent",
            transitions: [
                transitionSuccess,
                transitionBadword,
                transitionRateLimited
            ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        },
        {
            key: stateSuccess,
            component: null,
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameSuccess"
            }
        },
        {
            key: stateBadword,
            component: null,
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameBadword"
            }
        },
        {
            key: stateRateLimited,
            component: null,
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameRateLimited"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionSuccess,
            to: stateSuccess,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSuccess ) ),
            options: undefined
        },
        {
            from: transitionBadword,
            to: stateBadword,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionBadword ) ),
            options: undefined
        },
        {
            from: transitionRateLimited,
            to: stateRateLimited,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionRateLimited ) ),
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionSuccess,
            fields: [],
            options: undefined
        },
        {
            transition: transitionBadword,
            fields: [ "badword" ],
            options: undefined
        },
        {
            transition: transitionRateLimited,
            fields: [ "retryAfter", "masterChannelId" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateInitial,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildDynamicChannelTransferOwnerFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow";

    const stateSelectUser = `${ flowName }/States/SelectUser`;
    const stateConfirm = `${ flowName }/States/Confirm`;
    const stateSuccess = `${ flowName }/States/Success`;
    const stateCancelled = `${ flowName }/States/Cancelled`;

    const transitionOpen = `${ flowName }/Transitions/Open`;
    const transitionUserSelected = `${ flowName }/Transitions/UserSelected`;
    const transitionConfirm = `${ flowName }/Transitions/Confirm`;
    const transitionCancel = `${ flowName }/Transitions/Cancel`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionOpen,
        createFlowTriggerFromBinding(
            bindingIndex.get( `${ adapterName }/Bindings/Button/VertixBot/UI-V3/DynamicChannelTransferOwnerButton` ),
            flowName,
            transitionOpen,
            {
                navigation: {
                    targetState: stateSelectUser,
                    executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionUserSelected,
        createFlowTriggerFromBinding(
            bindingIndex.get( `${ adapterName }/Bindings/UserSelectMenu/VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu` ),
            flowName,
            transitionUserSelected,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "userDisplayName" ]
                    }
                ],
                navigation: {
                    targetState: stateConfirm,
                    executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionConfirm,
        createFlowTriggerFromBinding(
            bindingIndex.get( `${ adapterName }/Bindings/Button/VertixBot/UI-General/YesButton` ),
            flowName,
            transitionConfirm,
            {
                navigation: {
                    targetState: stateSuccess,
                    executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerTransferred"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionCancel,
        createFlowTriggerFromBinding(
            bindingIndex.get( `${ adapterName }/Bindings/Button/VertixBot/UI-General/NoButton` ),
            flowName,
            transitionCancel,
            {
                navigation: {
                    targetState: stateCancelled,
                    executionStep: "VertixBot/UI-V3/DynamicChannelTransferError"
                }
            }
        )
    );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelTransferOwnerFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateSelectUser = `${ flowName }/States/SelectUser`;
    const stateConfirm = `${ flowName }/States/Confirm`;
    const stateSuccess = `${ flowName }/States/Success`;
    const stateCancelled = `${ flowName }/States/Cancelled`;

    const transitionOpen = `${ flowName }/Transitions/Open`;
    const transitionUserSelected = `${ flowName }/Transitions/UserSelected`;
    const transitionConfirm = `${ flowName }/Transitions/Confirm`;
    const transitionCancel = `${ flowName }/Transitions/Cancel`;

    const states: FlowStateDefinition[] = [
        {
            key: stateSelectUser,
            component: "VertixBot/UI-V3/DynamicChannelTransferOwnerComponent",
            transitions: [ transitionUserSelected, transitionCancel ],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser"
            }
        },
        {
            key: stateConfirm,
            component: "VertixBot/UI-V3/DynamicChannelTransferOwnerComponent",
            transitions: [ transitionConfirm, transitionCancel ],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected"
            }
        },
        {
            key: stateSuccess,
            component: "VertixBot/UI-V3/DynamicChannelTransferOwnerComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerTransferred"
            }
        },
        {
            key: stateCancelled,
            component: "VertixBot/UI-V3/DynamicChannelTransferOwnerComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferError"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionOpen,
            to: stateSelectUser,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionOpen ) ),
            options: undefined
        },
        {
            from: transitionUserSelected,
            to: stateConfirm,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionUserSelected ) ),
            options: undefined
        },
        {
            from: transitionConfirm,
            to: stateSuccess,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionConfirm ) ),
            options: undefined
        },
        {
            from: transitionCancel,
            to: stateCancelled,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionCancel ) ),
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateSelectUser,
        states,
        transitions,
        requiredData: [],
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildDynamicChannelLimitFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelLimitFlow";
    const stateInvalid = `${ flowName }/States/InvalidInput`;
    const stateSuccess = `${ flowName }/States/Success`;
    const stateError = `${ flowName }/States/Error`;

    const transitionInvalid = `${ flowName }/Transitions/SubmitInvalid`;
    const transitionSuccess = `${ flowName }/Transitions/SubmitSuccess`;
    const transitionError = `${ flowName }/Transitions/SubmitError`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    const modalBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Modal/VertixBot/UI-V3/DynamicChannelLimitModal`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionInvalid,
        createFlowTriggerFromBinding(
            modalBinding,
            flowName,
            transitionInvalid,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "minValue" ]
                    },
                    {
                        type: "set",
                        path: [ "maxValue" ]
                    }
                ],
                navigation: {
                    targetState: stateInvalid,
                    executionStep: "VertixBot/UI-V3/DynamicChannelLimitInvalidInput"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSuccess,
        createFlowTriggerFromBinding(
            modalBinding,
            flowName,
            transitionSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "userLimit" ]
                    }
                ],
                navigation: {
                    targetState: stateSuccess,
                    executionStep: "VertixBot/UI-V3/DynamicChannelLimitSuccess"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionError,
        createFlowTriggerFromBinding(
            modalBinding,
            flowName,
            transitionError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelLimitError"
                }
            }
        )
    );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelLimitFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelLimitFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelLimitAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateDefault = `${ flowName }/States/Default`;
    const stateInvalid = `${ flowName }/States/InvalidInput`;
    const stateSuccess = `${ flowName }/States/Success`;
    const stateError = `${ flowName }/States/Error`;

    const transitionInvalid = `${ flowName }/Transitions/SubmitInvalid`;
    const transitionSuccess = `${ flowName }/Transitions/SubmitSuccess`;
    const transitionError = `${ flowName }/Transitions/SubmitError`;

    const states: FlowStateDefinition[] = [
        {
            key: stateDefault,
            component: "VertixBot/UI-V3/DynamicChannelLimitComponent",
            transitions: [ transitionInvalid, transitionSuccess, transitionError ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        },
        {
            key: stateInvalid,
            component: "VertixBot/UI-V3/DynamicChannelLimitComponent",
            transitions: [ transitionSuccess, transitionError ],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelLimitInvalidInput"
            }
        },
        {
            key: stateSuccess,
            component: "VertixBot/UI-V3/DynamicChannelLimitComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelLimitSuccess"
            }
        },
        {
            key: stateError,
            component: "VertixBot/UI-V3/DynamicChannelLimitComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelLimitError"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionInvalid,
            to: stateInvalid,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionInvalid ) ),
            options: undefined
        },
        {
            from: transitionSuccess,
            to: stateSuccess,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSuccess ) ),
            options: undefined
        },
        {
            from: transitionError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionError ) ),
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionInvalid,
            fields: [ "minValue", "maxValue" ],
            options: undefined
        },
        {
            transition: transitionSuccess,
            fields: [ "userLimit" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateDefault,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildDynamicChannelClearChatFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelClearChatFlow";
    const stateSuccess = `${ flowName }/States/Success`;
    const stateNothing = `${ flowName }/States/NothingToClear`;
    const stateError = `${ flowName }/States/Error`;

    const transitionSuccess = `${ flowName }/Transitions/ClearSuccess`;
    const transitionNothing = `${ flowName }/Transitions/ClearNothing`;
    const transitionError = `${ flowName }/Transitions/ClearError`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const buttonBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Button/VertixBot/UI-V3/DynamicChannelClearChatButton`
    );

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSuccess,
        createFlowTriggerFromBinding(
            buttonBinding,
            flowName,
            transitionSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "ownerDisplayName" ]
                    },
                    {
                        type: "set",
                        path: [ "totalMessages" ]
                    }
                ],
                navigation: {
                    targetState: stateSuccess,
                    executionStep: "VertixBot/UI-V3/DynamicChannelClearChatSuccess"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionNothing,
        createFlowTriggerFromBinding(
            buttonBinding,
            flowName,
            transitionNothing,
            {
                navigation: {
                    targetState: stateNothing,
                    executionStep: "VertixBot/UI-V3/DynamicChannelClearChatNothingToClear"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionError,
        createFlowTriggerFromBinding(
            buttonBinding,
            flowName,
            transitionError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelClearChatError"
                }
            }
        )
    );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelClearChatFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelClearChatFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelClearChatAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateSuccess = `${ flowName }/States/Success`;
    const stateNothing = `${ flowName }/States/NothingToClear`;
    const stateError = `${ flowName }/States/Error`;

    const transitionSuccess = `${ flowName }/Transitions/ClearSuccess`;
    const transitionNothing = `${ flowName }/Transitions/ClearNothing`;
    const transitionError = `${ flowName }/Transitions/ClearError`;

    const states: FlowStateDefinition[] = [
        {
            key: `${ flowName }/States/Default`,
            component: "VertixBot/UI-V3/DynamicChannelClearChatComponent",
            transitions: [ transitionSuccess, transitionNothing, transitionError ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        },
        {
            key: stateSuccess,
            component: "VertixBot/UI-V3/DynamicChannelClearChatComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatSuccess"
            }
        },
        {
            key: stateNothing,
            component: "VertixBot/UI-V3/DynamicChannelClearChatComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatNothingToClear"
            }
        },
        {
            key: stateError,
            component: "VertixBot/UI-V3/DynamicChannelClearChatComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatError"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionSuccess,
            to: stateSuccess,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSuccess ) ),
            options: undefined
        },
        {
            from: transitionNothing,
            to: stateNothing,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionNothing ) ),
            options: undefined
        },
        {
            from: transitionError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionError ) ),
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionSuccess,
            fields: [ "ownerDisplayName", "totalMessages" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: `${ flowName }/States/Default`,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildDynamicChannelResetChannelFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelResetChannelFlow";
    const stateSuccess = `${ flowName }/States/Success`;
    const stateVoteRequired = `${ flowName }/States/VoteRequired`;
    const stateError = `${ flowName }/States/Error`;

    const transitionSuccess = `${ flowName }/Transitions/ResetSuccess`;
    const transitionVoteRequired = `${ flowName }/Transitions/ResetVoteRequired`;
    const transitionError = `${ flowName }/Transitions/ResetError`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const buttonBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Button/VertixBot/UI-V3/DynamicChannelResetChannelButton`
    );

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSuccess,
        createFlowTriggerFromBinding(
            buttonBinding,
            flowName,
            transitionSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "result" ]
                    }
                ],
                navigation: {
                    targetState: stateSuccess,
                    executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelSuccess"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionVoteRequired,
        createFlowTriggerFromBinding(
            buttonBinding,
            flowName,
            transitionVoteRequired,
            {
                navigation: {
                    targetState: stateVoteRequired,
                    executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelVote"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionError,
        createFlowTriggerFromBinding(
            buttonBinding,
            flowName,
            transitionError,
            {
                navigation: {
                    targetState: stateError,
                    executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelError"
                }
            }
        )
    );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelResetChannelFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelResetChannelFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelResetChannelAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateSuccess = `${ flowName }/States/Success`;
    const stateVoteRequired = `${ flowName }/States/VoteRequired`;
    const stateError = `${ flowName }/States/Error`;

    const transitionSuccess = `${ flowName }/Transitions/ResetSuccess`;
    const transitionVoteRequired = `${ flowName }/Transitions/ResetVoteRequired`;
    const transitionError = `${ flowName }/Transitions/ResetError`;

    const states: FlowStateDefinition[] = [
        {
            key: `${ flowName }/States/Default`,
            component: "VertixBot/UI-V3/DynamicChannelResetChannelComponent",
            transitions: [ transitionSuccess, transitionVoteRequired, transitionError ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        },
        {
            key: stateSuccess,
            component: "VertixBot/UI-V3/DynamicChannelResetChannelComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelSuccess"
            }
        },
        {
            key: stateVoteRequired,
            component: null,
            transitions: [],
            hooks: [],
            options: {
                executionStep: null
            }
        },
        {
            key: stateError,
            component: "VertixBot/UI-V3/DynamicChannelResetChannelComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelError"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionSuccess,
            to: stateSuccess,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSuccess ) ),
            options: undefined
        },
        {
            from: transitionVoteRequired,
            to: stateVoteRequired,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionVoteRequired ) ),
            options: undefined
        },
        {
            from: transitionError,
            to: stateError,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionError ) ),
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionSuccess,
            fields: [ "result" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: `${ flowName }/States/Default`,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildDynamicChannelRegionFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelRegionFlow";
    const transitionSelect = `${ flowName }/Transitions/SelectRegion`;

    const selectBinding = bindings.find(
        ( binding ) => binding.entity === "VertixBot/UI-V3/DynamicChannelRegionSelectMenu"
    );

    if ( !selectBinding ) {
        return undefined;
    }

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSelect,
        createFlowTriggerFromBinding(
            selectBinding,
            flowName,
            transitionSelect,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "region" ]
                    }
                ],
                navigation: {
                    targetState: `${ flowName }/States/Default`,
                    executionStep: "default"
                }
            }
        )
    );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelRegionFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelRegionFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelRegionAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const transitionSelect = `${ flowName }/Transitions/SelectRegion`;

    const states: FlowStateDefinition[] = [
        {
            key: `${ flowName }/States/Default`,
            component: "VertixBot/UI-V3/DynamicChannelRegionComponent",
            transitions: [ transitionSelect ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionSelect,
            to: `${ flowName }/States/Default`,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSelect ) ),
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionSelect,
            fields: [ "region" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: `${ flowName }/States/Default`,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildDynamicChannelPrivacyFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelPrivacyFlow";
    const transitionUpdate = `${ flowName }/Transitions/UpdatePrivacyState`;

    const selectBinding = bindings.find(
        ( binding ) => binding.entity === "VertixBot/UI-V3/DynamicChannelPrivacyMenu"
    );

    if ( !selectBinding ) {
        return undefined;
    }

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionUpdate,
        createFlowTriggerFromBinding(
            selectBinding,
            flowName,
            transitionUpdate,
            {
                navigation: {
                    targetState: `${ flowName }/States/Default`,
                    executionStep: "default"
                }
            }
        )
    );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelPrivacyFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelPrivacyFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelPrivacyAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateDefault = `${ flowName }/States/Default`;
    const transitionUpdate = `${ flowName }/Transitions/UpdatePrivacyState`;

    const states: FlowStateDefinition[] = [
        {
            key: stateDefault,
            component: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
            transitions: [ transitionUpdate ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionUpdate,
            to: stateDefault,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionUpdate ) ),
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateDefault,
        states,
        transitions,
        requiredData: [],
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildDynamicChannelPrimaryMessageEditFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow";
    const stateTitle = `${ flowName }/States/EditTitle`;
    const stateDescription = `${ flowName }/States/EditDescription`;

    const transitionBegin = `${ flowName }/Transitions/BeginEditing`;
    const transitionSubmitTitle = `${ flowName }/Transitions/SubmitTitle`;
    const transitionSubmitDescription = `${ flowName }/Transitions/SubmitDescription`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    const yesBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Button/VertixBot/UI-General/YesButton`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionBegin,
        createFlowTriggerFromBinding(
            yesBinding,
            flowName,
            transitionBegin,
            {
                navigation: {
                    targetState: stateTitle,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent"
                }
            }
        )
    );

    const titleBinding = bindingIndex.get(
        `${ adapterName }/Bindings/ModalWithButton/VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSubmitTitle,
        createFlowTriggerFromBinding(
            titleBinding,
            flowName,
            transitionSubmitTitle,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "title" ]
                    }
                ],
                navigation: {
                    targetState: stateTitle,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent"
                }
            }
        )
    );

    const descriptionBinding = bindingIndex.get(
        `${ adapterName }/Bindings/ModalWithButton/VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton`
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionSubmitDescription,
        createFlowTriggerFromBinding(
            descriptionBinding,
            flowName,
            transitionSubmitDescription,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "description" ]
                    }
                ],
                navigation: {
                    targetState: stateDescription,
                    executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent"
                }
            }
        )
    );

    if ( !collection.size ) {
        return undefined;
    }

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildDynamicChannelPrimaryMessageEditFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow";
    const adapterName = "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateConfirm = `${ flowName }/States/Confirm`;
    const stateTitle = `${ flowName }/States/EditTitle`;
    const stateDescription = `${ flowName }/States/EditDescription`;

    const transitionBegin = `${ flowName }/Transitions/BeginEditing`;
    const transitionSubmitTitle = `${ flowName }/Transitions/SubmitTitle`;
    const transitionSubmitDescription = `${ flowName }/Transitions/SubmitDescription`;

    const states: FlowStateDefinition[] = [
        {
            key: stateConfirm,
            component: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditComponent",
            transitions: [ transitionBegin ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        },
        {
            key: stateTitle,
            component: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent",
            transitions: [
                transitionSubmitTitle,
                "VertixGUI/UIWizardFlowBase/Transitions/Next",
                "VertixGUI/UIWizardFlowBase/Transitions/Back",
                "VertixGUI/UIWizardFlowBase/Transitions/Error"
            ],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent"
            }
        },
        {
            key: stateDescription,
            component: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent",
            transitions: [
                transitionSubmitDescription,
                "VertixGUI/UIWizardFlowBase/Transitions/Back",
                "VertixGUI/UIWizardFlowBase/Transitions/Finish",
                "VertixGUI/UIWizardFlowBase/Transitions/Error"
            ],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent"
            }
        },
        {
            key: "VertixGUI/UIWizardFlowBase/States/Completed",
            component: null,
            transitions: [],
            hooks: [],
            options: undefined
        },
        {
            key: "VertixGUI/UIWizardFlowBase/States/Error",
            component: null,
            transitions: [ transitionBegin ],
            hooks: [],
            options: undefined
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionBegin,
            to: stateTitle,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionBegin ) ),
            options: undefined
        },
        {
            from: transitionSubmitTitle,
            to: stateTitle,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSubmitTitle ) ),
            options: undefined
        },
        {
            from: transitionSubmitDescription,
            to: stateDescription,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionSubmitDescription ) ),
            options: undefined
        },
        {
            from: "VertixGUI/UIWizardFlowBase/Transitions/Next",
            to: stateDescription,
            triggeredBy: undefined,
            options: undefined
        },
        {
            from: "VertixGUI/UIWizardFlowBase/Transitions/Back",
            to: stateTitle,
            triggeredBy: undefined,
            options: undefined
        },
        {
            from: "VertixGUI/UIWizardFlowBase/Transitions/Finish",
            to: "VertixGUI/UIWizardFlowBase/States/Completed",
            triggeredBy: undefined,
            options: undefined
        },
        {
            from: "VertixGUI/UIWizardFlowBase/Transitions/Error",
            to: "VertixGUI/UIWizardFlowBase/States/Error",
            triggeredBy: undefined,
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionSubmitTitle,
            fields: [ "title" ],
            options: undefined
        },
        {
            transition: transitionSubmitDescription,
            fields: [ "description" ],
            options: undefined
        },
        {
            transition: "VertixGUI/UIWizardFlowBase/Transitions/Finish",
            fields: [ "title", "description" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateConfirm,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildClaimStartFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/ClaimStartFlow";
    const transitionRequest = `${ flowName }/Transitions/RequestClaim`;

    const startBinding = bindings.find(
        ( binding ) => binding.entity === "VertixBot/UI-V3/ClaimStartButton"
    );

    if ( !startBinding ) {
        return undefined;
    }

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionRequest,
        createFlowTriggerFromBinding(
            startBinding,
            flowName,
            transitionRequest,
            {
                navigation: {
                    targetState: `${ flowName }/States/Default`,
                    executionStep: "default"
                }
            }
        )
    );

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildClaimStartFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/ClaimStartFlow";
    const adapterName = "VertixBot/UI-V3/ClaimStartAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateDefault = `${ flowName }/States/Default`;
    const transitionRequest = `${ flowName }/Transitions/RequestClaim`;

    const states: FlowStateDefinition[] = [
        {
            key: stateDefault,
            component: "VertixBot/UI-V3/ClaimStartComponent",
            transitions: [ transitionRequest ],
            hooks: [],
            options: {
                executionStep: "default"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionRequest,
            to: stateDefault,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionRequest ) ),
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateDefault,
        states,
        transitions,
        requiredData: [],
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildClaimVoteFlowTriggers(
    adapterName: string,
    bindings: BindingDefinition[]
): AdapterTriggerData | undefined {
    const flowName = "VertixBot/UI-V3/ClaimVoteFlow";

    const stateStepIn = `${ flowName }/States/StepIn`;
    const stateVoteProcess = `${ flowName }/States/VoteProcess`;
    const stateVoteWon = `${ flowName }/States/VoteWon`;
    const stateVoteSelf = `${ flowName }/States/VoteAlreadySelf`;
    const stateVoteSuccess = `${ flowName }/States/VoteSuccess`;
    const stateVoteSame = `${ flowName }/States/VoteSameChoice`;
    const stateVoteUpdated = `${ flowName }/States/VoteUpdated`;

    const transitionStart = `${ flowName }/Transitions/StartVote`;
    const transitionAddCandidate = `${ flowName }/Transitions/AddCandidate`;
    const transitionVoteSelf = `${ flowName }/Transitions/VoteSelf`;
    const transitionVoteSuccess = `${ flowName }/Transitions/VoteSuccess`;
    const transitionVoteSame = `${ flowName }/Transitions/VoteSame`;
    const transitionVoteUpdated = `${ flowName }/Transitions/VoteUpdated`;

    const bindingIndex = new Map<string, BindingDefinition>();
    for ( const binding of bindings ) {
        bindingIndex.set( binding.handler, binding );
    }

    const stepInBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Button/VertixBot/UI-V3/ClaimVoteStepInButton`
    );
    const voteBinding = bindingIndex.get(
        `${ adapterName }/Bindings/Button/VertixBot/UI-V3/ClaimVoteAddButton`
    );

    const collection: FlowTriggerCollection = new Map();
    const handlerMap: BindingFlowTriggerMap = new Map();

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionStart,
        createFlowTriggerFromBinding(
            stepInBinding,
            flowName,
            transitionStart,
            {
                navigation: {
                    targetState: stateVoteProcess,
                    executionStep: "VertixBot/UI-V3/ClaimVoteProcess"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionAddCandidate,
        createFlowTriggerFromBinding(
            stepInBinding,
            flowName,
            transitionAddCandidate,
            {
                navigation: {
                    targetState: stateStepIn,
                    executionStep: "VertixBot/UI-V3/ClaimStepIn"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionVoteSelf,
        createFlowTriggerFromBinding(
            voteBinding,
            flowName,
            transitionVoteSelf,
            {
                navigation: {
                    targetState: stateVoteSelf,
                    executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionVoteSuccess,
        createFlowTriggerFromBinding(
            voteBinding,
            flowName,
            transitionVoteSuccess,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "targetId" ]
                    }
                ],
                navigation: {
                    targetState: stateVoteSuccess,
                    executionStep: "VertixBot/UI-V3/ClaimResultVotedSuccessfully"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionVoteSame,
        createFlowTriggerFromBinding(
            voteBinding,
            flowName,
            transitionVoteSame,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "targetId" ]
                    }
                ],
                navigation: {
                    targetState: stateVoteSame,
                    executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame"
                }
            }
        )
    );

    appendFlowTrigger(
        collection,
        handlerMap,
        flowName,
        transitionVoteUpdated,
        createFlowTriggerFromBinding(
            voteBinding,
            flowName,
            transitionVoteUpdated,
            {
                mutations: [
                    {
                        type: "set",
                        path: [ "prevUserId" ]
                    },
                    {
                        type: "set",
                        path: [ "currentUserId" ]
                    }
                ],
                navigation: {
                    targetState: stateVoteUpdated,
                    executionStep: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
                }
            }
        )
    );

    if ( !collection.size ) {
        return undefined;
    }

    return {
        flowName,
        byTransition: collection,
        byHandler: handlerMap
    };
}

function buildClaimVoteFlowDefinition(
    flowTriggersByAdapter: FlowTriggersByAdapter
): FlowDefinition | undefined {
    const flowName = "VertixBot/UI-V3/ClaimVoteFlow";
    const adapterName = "VertixBot/UI-V3/ClaimVoteAdapter";
    const triggerCollection = flowTriggersByAdapter.get( adapterName );

    if ( !triggerCollection ) {
        return undefined;
    }

    const stateStepIn = `${ flowName }/States/StepIn`;
    const stateVoteProcess = `${ flowName }/States/VoteProcess`;
    const stateVoteWon = `${ flowName }/States/VoteWon`;
    const stateVoteSelf = `${ flowName }/States/VoteAlreadySelf`;
    const stateVoteSuccess = `${ flowName }/States/VoteSuccess`;
    const stateVoteSame = `${ flowName }/States/VoteSameChoice`;
    const stateVoteUpdated = `${ flowName }/States/VoteUpdated`;

    const transitionStart = `${ flowName }/Transitions/StartVote`;
    const transitionAddCandidate = `${ flowName }/Transitions/AddCandidate`;
    const transitionVoteSelf = `${ flowName }/Transitions/VoteSelf`;
    const transitionVoteSuccess = `${ flowName }/Transitions/VoteSuccess`;
    const transitionVoteSame = `${ flowName }/Transitions/VoteSame`;
    const transitionVoteUpdated = `${ flowName }/Transitions/VoteUpdated`;

    const states: FlowStateDefinition[] = [
        {
            key: stateStepIn,
            component: "VertixBot/UI-V3/ClaimVoteComponent",
            transitions: [ transitionStart, transitionAddCandidate ],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimStepIn"
            }
        },
        {
            key: stateVoteProcess,
            component: "VertixBot/UI-V3/ClaimVoteComponent",
            transitions: [
                transitionVoteSelf,
                transitionVoteSuccess,
                transitionVoteSame,
                transitionVoteUpdated
            ],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimVoteProcess"
            }
        },
        {
            key: stateVoteWon,
            component: "VertixBot/UI-V3/ClaimVoteComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimVoteWon"
            }
        },
        {
            key: stateVoteSelf,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted"
            }
        },
        {
            key: stateVoteSuccess,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVotedSuccessfully"
            }
        },
        {
            key: stateVoteSame,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame"
            }
        },
        {
            key: stateVoteUpdated,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
            }
        }
    ];

    const transitions: FlowDefinition[ "transitions" ] = [
        {
            from: transitionStart,
            to: stateVoteProcess,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionStart ) ),
            options: undefined
        },
        {
            from: transitionAddCandidate,
            to: stateStepIn,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionAddCandidate ) ),
            options: undefined
        },
        {
            from: transitionVoteSelf,
            to: stateVoteSelf,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionVoteSelf ) ),
            options: undefined
        },
        {
            from: transitionVoteSuccess,
            to: stateVoteSuccess,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionVoteSuccess ) ),
            options: undefined
        },
        {
            from: transitionVoteSame,
            to: stateVoteSame,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionVoteSame ) ),
            options: undefined
        },
        {
            from: transitionVoteUpdated,
            to: stateVoteUpdated,
            triggeredBy: cloneFlowTriggers( triggerCollection.get( transitionVoteUpdated ) ),
            options: undefined
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: transitionVoteSuccess,
            fields: [ "targetId" ],
            options: undefined
        },
        {
            transition: transitionVoteSame,
            fields: [ "targetId" ],
            options: undefined
        },
        {
            transition: transitionVoteUpdated,
            fields: [ "prevUserId", "currentUserId" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: stateStepIn,
        states,
        transitions,
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function buildClaimResultFlowDefinition(): FlowDefinition {
    const flowName = "VertixBot/UI-V3/ClaimResultFlow";

    const states: FlowStateDefinition[] = [
        {
            key: `${ flowName }/States/OwnerStop`,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultOwnerStop"
            }
        },
        {
            key: `${ flowName }/States/AddedSuccessfully`,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultAddedSuccessfully"
            }
        },
        {
            key: `${ flowName }/States/AlreadyAdded`,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultAlreadyAdded"
            }
        },
        {
            key: `${ flowName }/States/VoteAlreadySelf`,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted"
            }
        },
        {
            key: `${ flowName }/States/VoteSuccess`,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVotedSuccessfully"
            }
        },
        {
            key: `${ flowName }/States/VoteSameChoice`,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame"
            }
        },
        {
            key: `${ flowName }/States/VoteUpdated`,
            component: "VertixBot/UI-V3/ClaimResultComponent",
            transitions: [],
            hooks: [],
            options: {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
            }
        }
    ];

    const requiredData: FlowDefinition[ "requiredData" ] = [
        {
            transition: `${ flowName }/Transitions/VoteSuccess`,
            fields: [ "targetId" ],
            options: undefined
        },
        {
            transition: `${ flowName }/Transitions/VoteSameChoice`,
            fields: [ "targetId" ],
            options: undefined
        },
        {
            transition: `${ flowName }/Transitions/VoteUpdated`,
            fields: [ "prevUserId", "currentUserId" ],
            options: undefined
        }
    ];

    return {
        name: flowName,
        module: "VertixBot/UI-V3/Module",
        flowKind: "ui",
        initialState: `${ flowName }/States/OwnerStop`,
        states,
        transitions: [],
        requiredData,
        entryPoints: [],
        handoffPoints: [],
        externalReferences: undefined,
        edgeSourceMappings: undefined,
        requiredDataComponents: undefined,
        channelTypes: [ "GuildVoice" ],
        permissions: "0",
        initialData: undefined,
        stepStates: undefined,
        stepComponents: undefined,
        flowType: "ui",
        hooks: [],
        options: undefined
    };
}

function createFlowTriggerFromBinding(
    binding: BindingDefinition | undefined,
    flowName: string,
    transition: string,
    details: { mutations?: FlowContextMutationDefinition[]; navigation?: FlowNavigationDefinition }
): BindingFlowTriggerDefinition | undefined {
    if ( !binding ) {
        return undefined;
    }

    return {
        handlerId: binding.handler,
        sourceEntity: binding.entity,
        handlerKind: bindingKindToFlowHandlerKind( binding.kind ),
        mutations: details.mutations,
        navigation: details.navigation,
        flowName,
        transition
    };
}

function appendFlowTrigger(
    collection: FlowTriggerCollection,
    handlerMap: BindingFlowTriggerMap,
    flowName: string,
    transition: string,
    trigger: BindingFlowTriggerDefinition | undefined
): void {
    if ( !trigger ) {
        return;
    }
    const triggerDefinition: FlowTriggerDefinition = {
        handlerId: trigger.handlerId,
        sourceEntity: trigger.sourceEntity,
        handlerKind: trigger.handlerKind,
        mutations: trigger.mutations,
        navigation: trigger.navigation
    };

    const existing = collection.get( transition );
    if ( existing ) {
        existing.push( triggerDefinition );
    } else {
        collection.set( transition, [ triggerDefinition ] );
    }

    const handlerTriggers = handlerMap.get( trigger.handlerId );
    if ( handlerTriggers ) {
        handlerTriggers.push( trigger );
    } else {
        handlerMap.set( trigger.handlerId, [ trigger ] );
    }
}

function bindingKindToFlowHandlerKind( kind: string | undefined ): FlowTriggerHandlerKind {
    switch ( kind ) {
        case "button":
            return "button";
        case "modal":
            return "modal";
        case "modal-button":
            return "modal-button";
        case "string-select":
            return "string-select";
        case "user-select":
            return "user-select";
        case "command":
            return "command";
        default:
            return "unknown";
    }
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
    flowTriggersByAdapter: FlowTriggersByAdapter
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
    triggerMap?: FlowTriggerCollection
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

    return Object.keys( transitions ).map( ( stateKey ) => ( {
        key: stateKey,
        component: stateComponentMap?.get( stateKey ) ?? null,
        transitions: transitions[ stateKey ],
        hooks: [],
        options: undefined
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
