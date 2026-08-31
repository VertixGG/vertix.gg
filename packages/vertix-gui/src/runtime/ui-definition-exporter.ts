import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ChannelType } from "discord.js";

import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";
import { VirtualFlowGenerator } from "@vertix.gg/gui/src/runtime/virtual-flow-generator";

import {
    UI_LANGUAGES_INITIAL_CODE,
    UI_LANGUAGES_INITIAL_FILE_PATH
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type {
    UIElementButtonLanguageContent,
    UIElementSelectMenuLanguageContent,
    UIElementTextInputLanguageContent,
    UIEmbedLanguageContent,
    UIModalLanguageContent
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UIWizardFlowBase } from "@vertix.gg/gui/src/bases/ui-wizard-flow-base";

import type {
    AdapterDefinition,
    BindingDefinition,
    ComponentDefinition,
    ElementDefinition,
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
    JsonObject,
    ModalDefinition,
    ModalInputDefinition
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
import type { UIFlowBase, UIFlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
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

type LanguageEntry<TContent> = {
    name: string;
    content: TContent;
};

type ElementLanguageContent = Partial<
    UIElementButtonLanguageContent
    & UIElementTextInputLanguageContent
    & UIElementSelectMenuLanguageContent
>;

interface InitialLanguageFile {
    code?: string;
    elements?: {
        buttons?: LanguageEntry<UIElementButtonLanguageContent>[];
        textInputs?: LanguageEntry<UIElementTextInputLanguageContent>[];
        selectMenus?: LanguageEntry<UIElementSelectMenuLanguageContent>[];
    };
    embeds?: LanguageEntry<UIEmbedLanguageContent>[];
    modals?: LanguageEntry<UIModalLanguageContent>[];
}

interface InitialLanguage {
    elements: Map<string, ElementLanguageContent>;
    embeds: Map<string, UIEmbedLanguageContent>;
    modals: Map<string, UIModalLanguageContent>;
}

interface ExporterOptions {
    outputDir: string;
    includeFlows?: boolean;
    includeAdapters?: boolean;
    includeComponents?: boolean;
}

interface UIDefinitionExportMeta {
    schemaVersion: string;
    exportedAt: string;
    counts: {
        components: number;
        adapters: number;
        flows: number;
    };
    modules: string[];
    moduleSummary: Array<{
        module: string;
        components: number;
        adapters: number;
        flows: number;
        embeds: {
            total: number;
            withDefinition: number;
            missingDefinition: number;
        };
        componentsWithEmbeds: number;
        componentsWithMissingEmbeds: number;
    }>;
    embedCoverage: {
        total: number;
        withDefinition: number;
        missingDefinition: number;
    };
}

interface UIDefinitionCollections {
    components: ComponentDefinition[];
    adapters: AdapterDefinition[];
    flows: FlowDefinition[];
    meta: UIDefinitionExportMeta;
}

interface UIDefinitionCollectionResult {
    collections: UIDefinitionCollections;
    embedDiagnostics: ComponentEmbedDiagnostics[];
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

interface ComponentSerializationResult {
    definition: ComponentDefinition;
    embedAudit: EmbedAuditStats;
    diagnostics: ComponentEmbedDiagnostics;
}

interface WizardStateComponentData {
    stateToComponent: Map<string, string>;
    orderedStateNames: string[];
    componentNames: string[];
}

type FlowTriggerRegistrar = (
    flowName: string,
    transition: string,
    trigger: FlowTriggerDefinition
) => void;

export class UIDefinitionExporter extends UIBase {
    private readonly logger: Logger;

    // undefined until first use, null once it turned out to be unreadable.
    private initialLanguage: InitialLanguage | null | undefined;

    public static override getName(): string {
        return "VertixGUI/Runtime/UIDefinitionExporter";
    }

    public constructor() {
        super();
        this.logger = new Logger( UIDefinitionExporter.getName() );
    }

    public async export( uiService: UIService, options: ExporterOptions ): Promise<void> {
        const { collections, embedDiagnostics } = await this.collectUIDefinitionsInternal( uiService, options );

        const _includeComponents = options.includeComponents ?? true;
        const includeAdapters = options.includeAdapters ?? true;
        const includeFlows = options.includeFlows ?? true;

        if ( _includeComponents ) {
            this.writeJson( path.join( options.outputDir, "components.json" ), collections.components );
        }

        if ( includeAdapters ) {
            this.writeJson( path.join( options.outputDir, "adapters.json" ), collections.adapters );
        }

        if ( includeFlows ) {
            this.writeJson( path.join( options.outputDir, "flows.json" ), collections.flows );
        }

        this.writeJson( path.join( options.outputDir, "meta.json" ), collections.meta );

        if ( embedDiagnostics.length ) {
            const missingTotal = embedDiagnostics.reduce( ( sum, entry ) => sum + entry.missing.length, 0 );
            this.logger.warn(
                "exportUIDefinitions",
                `Found ${ embedDiagnostics.length } component(s) with ${ missingTotal } embed definition(s) missing metadata.`
            );
            embedDiagnostics.forEach( ( entry ) => {
                const details = entry.missing
                    .map( ( item ) => `${ item.group } -> ${ item.embed }` )
                    .join( ", " );
                this.logger.warn(
                    "exportUIDefinitions",
                    `Component '${ entry.module ? `${ entry.module }::${ entry.component }` : entry.component }' missing embeds: ${ details }`
                );
            } );
        }

        this.logger.info(
            "exportUIDefinitions",
            `Export completed. Components: ${ collections.meta.counts.components }, Adapters: ${ collections.meta.counts.adapters }, Flows: ${ collections.meta.counts.flows }`
        );
    }

    public async collect( uiService: UIService, options: ExporterOptions ): Promise<UIDefinitionCollections> {
        const { collections } = await this.collectUIDefinitionsInternal( uiService, options );

        return collections;
    }

    private async collectUIDefinitionsInternal(
        uiService: UIService,
        options: ExporterOptions
    ): Promise<UIDefinitionCollectionResult> {
        const _includeComponentsInternal = options.includeComponents ?? true;
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

        // First pass: collect all system flow names to avoid generating duplicate virtual flows
        const systemFlowNames = new Set<string>();
        if ( includeFlows ) {
            for ( const [ , ModuleCtor ] of modules ) {
                const moduleSystemFlows = ModuleCtor.getSystemFlows?.() ?? [];
                for ( const flowClass of moduleSystemFlows ) {
                    const flowName = flowClass.getName?.();
                    if ( flowName ) {
                        systemFlowNames.add( flowName );
                    }
                }
            }
        }

        for ( const [ moduleName, ModuleCtor ] of modules ) {
            this.logger.info( "exportUIDefinitions", `Exporting module ${ moduleName }` );
            const moduleInstance = uiService.getUIModule<UIModuleBase>( moduleName, true ) ?? new ModuleCtor();
            const moduleSummary = this.getOrCreateModuleSummary( moduleSummaries, moduleName );

            if ( includeAdapters ) {
                const moduleAdapters = ModuleCtor.getAdapters?.() ?? [];

                for ( const adapterClass of moduleAdapters ) {
                    try {
                        const definition = await this.serializeAdapter(
                            adapterClass,
                            uiService,
                            components,
                            handlerMap,
                            moduleName,
                            flowTriggersByAdapter,
                            moduleSummary,
                            globalEmbedStats,
                            embedDiagnostics
                        );
                        adapters.push( definition );
                        moduleSummary.adapters += 1;

                        const adapterMetadata = this.getAdapterMetadata( adapterClass );

                        // Generate virtual flow from adapter transactions if defined (skip hidden flows and duplicates of system flows)
                        if ( includeFlows && adapterMetadata?.transactions && !adapterMetadata.transactions.getHidden() ) {
                            const virtualFlow = VirtualFlowGenerator.generate(
                                adapterMetadata.transactions,
                                {
                                    moduleName,
                                    componentName: definition.component,
                                    executionSteps: adapterMetadata.executionSteps
                                }
                            );

                            // Skip if a system flow with the same name already exists
                            if ( systemFlowNames.has( virtualFlow.name ) ) {
                                this.logger.info(
                                    "exportUIDefinitions",
                                    `Skipping virtual flow '${ virtualFlow.name }' - system flow with same name exists`
                                );
                            } else {
                                flows.push( virtualFlow );
                                moduleSummary.flows += 1;
                                this.logger.info(
                                    "exportUIDefinitions",
                                    `Generated virtual flow '${ virtualFlow.name }' from adapter '${ adapterClass.getName() }' transactions`
                                );
                            }
                        }

                        const wizardComponents = this.extractWizardComponentNames( adapterMetadata );

                        if ( wizardComponents?.length ) {
                            wizardAdapterComponents.set( adapterClass.getName(), wizardComponents );

                            const wizardComponentClasses = this.extractWizardComponentClasses( adapterMetadata );
                            for ( const wizardComponentClass of wizardComponentClasses ) {
                                const wizardCompName = this.callStaticString( wizardComponentClass, "getName" );
                                if ( wizardCompName && !components.has( wizardCompName ) ) {
                                    try {
                                        const { definition, embedAudit, diagnostics } = await this.serializeComponent(
                                            wizardComponentClass,
                                            moduleName
                                        );
                                        components.set( wizardCompName, definition );
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
                                    } catch( wizardCompError ) {
                                        this.logger.warn(
                                            "exportUIDefinitions",
                                            `Failed to serialize wizard component '${ wizardCompName }': ${ wizardCompError }`
                                        );
                                    }
                                }
                            }
                        }
                    } catch( error ) {
                        this.logger.error(
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
                        const definition = await this.serializeFlow(
                            flowClass as FlowClass,
                            moduleInstance,
                            wizardAdapterComponents,
                            moduleName,
                            flowTriggersByAdapter
                        );
                        flows.push( definition );
                        moduleSummary.flows += 1;
                    } catch( error ) {
                        this.logger.error(
                            "exportUIDefinitions",
                            `Failed to export flow '${ flowClass.getName?.() ?? flowClass }'`,
                            error
                        );
                        throw error;
                    }
                }

                const moduleSystemFlows = ModuleCtor.getSystemFlows?.() ?? [];

                for ( const flowClass of moduleSystemFlows ) {
                    try {
                        const definition = await this.serializeFlow(
                            flowClass as FlowClass,
                            moduleInstance,
                            wizardAdapterComponents,
                            moduleName,
                            flowTriggersByAdapter
                        );
                        definition.flowKind = "system";
                        flows.push( definition );
                    } catch( error ) {
                        this.logger.error(
                            "exportUIDefinitions",
                            `Failed to export system flow '${ flowClass.getName?.() ?? flowClass }'`,
                            error
                        );
                        throw error;
                    }
                }
            }
        }

        // Generate virtual flows from binding flowTriggers (for adapters that don't use defineTransactions)
        if ( includeFlows ) {
            const virtualFlowsFromBindings = this.generateVirtualFlowsFromBindingTriggers(
                flowTriggersByAdapter,
                flows.map( f => f.name )
            );

            for ( const virtualFlow of virtualFlowsFromBindings ) {
                const existingIndex = flows.findIndex( f => f.name === virtualFlow.name );
                if ( existingIndex === -1 ) {
                    flows.push( virtualFlow );
                    // Find module for this flow based on adapter
                    const adapterName = virtualFlow.options?.sourceAdapter as string | undefined;
                    if ( adapterName ) {
                        for ( const [ modName, summary ] of moduleSummaries ) {
                            if ( virtualFlow.module === modName ) {
                                summary.flows += 1;
                                break;
                            }
                        }
                    }
                    this.logger.info(
                        "exportUIDefinitions",
                        `Generated virtual flow '${ virtualFlow.name }' from adapter binding flowTriggers`
                    );
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

        const exportMeta: UIDefinitionExportMeta = {
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
            }
        };

        const collections: UIDefinitionCollections = {
            components: Array.from( components.values() ),
            adapters: [ ...adapters ],
            flows: [ ...flows ],
            meta: exportMeta
        };

        return {
            collections,
            embedDiagnostics
        };
    }

    private getOrCreateModuleSummary(
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

    private determineAdapterKind( adapterClass: AdapterClass ): string {
        if ( adapterClass.prototype instanceof UIWizardAdapterBase ) {
            return "wizard";
        }

        if ( adapterClass.prototype instanceof UIAdapterExecutionStepsBase ) {
            return "execution";
        }

        return "base";
    }

    private async serializeComponent(
        componentClass: UIComponentTypeConstructor,
        moduleName: string | undefined
    ): Promise<ComponentSerializationResult> {
        const metadata = this.getComponentMetadata( componentClass );

        const instanceType = metadata?.instanceType ?? this.safeCall( () => componentClass.getInstanceType() ) ?? "dynamic";
        const rawElementsGroups =
            metadata?.elementsGroups ??
            this.safeCall( () => componentClass.getElementsGroups?.() ) ??
            [];
        const rawEmbedsGroups =
            metadata?.embedsGroups ??
            this.safeCall( () => componentClass.getEmbedsGroups?.() ) ??
            [];
        const staticModals = this.safeCall( () =>
            ( componentClass as unknown as { getModals?: () => unknown[] } ).getModals?.()
        );

        const rawModals =
            ( metadata?.modals && metadata.modals.length ? metadata.modals : undefined ) ??
            staticModals ??
            [];

        const elementsGroups = await Promise.all(
            rawElementsGroups.map( ( group, index ) =>
                this.serializeElementsGroup( componentClass, group, index )
            )
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
            this.serializeEmbedsGroup( componentClass, group, index, recordEmbed )
        );

        const modals = rawModals.map( ( modal ) => this.extractEntityName( modal ) );
        const modalDefinitions = await this.serializeModals( rawModals );

        if ( !elementsGroups.length ) {
            const directElements = this.callStaticArray( componentClass, "getElements" );

            if ( directElements?.length ) {
                const groupName =
                    metadata?.defaultElementsGroup ??
                    this.safeCall( () => componentClass.getDefaultElementsGroup?.() ) ??
                    `${ componentClass.getName() }/ElementsGroup`;

                elementsGroups.push( await this.createElementsGroupFromDirect( groupName, directElements ) );
            }
        }

        if ( !embedsGroups.length ) {
            const directEmbeds = this.callStaticArray( componentClass, "getEmbeds" );

            if ( directEmbeds?.length ) {
                const groupName =
                    metadata?.defaultEmbedsGroup ??
                    this.safeCall( () => componentClass.getDefaultEmbedsGroup?.() ) ??
                    `${ componentClass.getName() }/EmbedsGroup`;

                embedsGroups = [
                    {
                        name: groupName,
                        resolver: undefined,
                        items: directEmbeds.map( ( embed ) => {
                            const reference = this.serializeEmbedReference( embed );
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
            type: this.safeCall( () => componentClass.getType() ) ?? "component",
            instanceType,
            modules: moduleName ? [ moduleName ] : undefined,
            elementsGroups,
            embedsGroups,
            modals,
            modalDefinitions,
            defaultElementsGroup:
                metadata?.defaultElementsGroup ??
                this.safeCall( () => componentClass.getDefaultElementsGroup?.() ) ??
                null,
            defaultEmbedsGroup:
                metadata?.defaultEmbedsGroup ??
                this.safeCall( () => componentClass.getDefaultEmbedsGroup?.() ) ??
                null,
            defaultMarkdownsGroup:
                metadata?.defaultMarkdownsGroup ??
                this.safeCall( () => componentClass.getDefaultMarkdownsGroup?.() ) ??
                null,
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
            this.logger.warn(
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

    private async serializeModals( rawModals: unknown[] ): Promise<ModalDefinition[]> {
        const modalDefinitions: ModalDefinition[] = [];

        for ( const modal of rawModals ) {
            if ( !modal || typeof modal !== "function" ) {
                continue;
            }

            const ModalClass = modal as {
                getName?: () => string;
                getInputElements?: () => unknown[][];
                prototype?: {
                    getTitle?: () => string;
                };
            };

            const name = ModalClass.getName?.() ?? "UnknownModal";
            let title: string | undefined;

            if ( ModalClass.prototype?.getTitle ) {
                try {
                    title = ModalClass.prototype.getTitle.call( {} );
                } catch {
                    title = undefined;
                }
            }

            title = this.getModalLanguageContent( name )?.title ?? title;

            const inputs: ModalInputDefinition[] = [];
            const rawInputElements = ModalClass.getInputElements?.() ?? [];
            const inputElements = this.normalize2D( rawInputElements );

            for ( const row of inputElements ) {
                if ( !Array.isArray( row ) ) {
                    continue;
                }

                for ( const input of row ) {
                    if ( !input || typeof input !== "function" ) {
                        continue;
                    }

                    const InputClass = input as {
                        getName?: () => string;
                        prototype?: {
                            getLabel?: () => Promise<string>;
                            getPlaceholder?: () => Promise<string>;
                            getStyle?: () => Promise<string>;
                            getMinLength?: () => Promise<number>;
                            getMaxLength?: () => Promise<number>;
                        };
                    };

                    const inputName = InputClass.getName?.() ?? "UnknownInput";
                    let label: string | undefined;
                    let placeholder: string | undefined;
                    let style: "short" | "paragraph" | undefined;
                    let minLength: number | undefined;
                    let maxLength: number | undefined;

                    const proto = InputClass.prototype;

                    if ( proto?.getLabel ) {
                        try {
                            label = await proto.getLabel.call( {} );
                        } catch {
                            label = undefined;
                        }
                    }

                    if ( proto?.getPlaceholder ) {
                        try {
                            placeholder = await proto.getPlaceholder.call( {} );
                        } catch {
                            placeholder = undefined;
                        }
                    }

                    if ( proto?.getStyle ) {
                        try {
                            const rawStyle = await proto.getStyle.call( {} );
                            style = rawStyle === "long" || rawStyle === "paragraph" ? "paragraph" : "short";
                        } catch {
                            style = "short";
                        }
                    }

                    if ( proto?.getMinLength ) {
                        try {
                            minLength = await proto.getMinLength.call( {} );
                        } catch {
                            minLength = undefined;
                        }
                    }

                    if ( proto?.getMaxLength ) {
                        try {
                            maxLength = await proto.getMaxLength.call( {} );
                        } catch {
                            maxLength = undefined;
                        }
                    }

                    const inputContent = this.getElementLanguageContent( inputName );

                    label = inputContent?.label ?? label;
                    placeholder = inputContent?.placeholder ?? placeholder;

                    inputs.push( {
                        name: inputName,
                        label,
                        placeholder,
                        style,
                        minLength,
                        maxLength
                    } );
                }
            }

            modalDefinitions.push( {
                name,
                title,
                inputs
            } );
        }

        return modalDefinitions;
    }

    private async serializeElementsGroup(
        componentClass: UIComponentTypeConstructor,
        group: typeof UIElementsGroupBase,
        index: number
    ): Promise<ElementsGroupDefinition> {
        const name = group.getName?.() ?? `${ componentClass.getName() }/ElementsGroup/${ index }`;
        const itemsRaw = this.safeCall( () => group.getItems?.() ) ?? [];
        const normalized = this.normalize2D( itemsRaw );

        const rows: Array<Array<{ element: string; definition?: ElementDefinition }>> = [];

        for ( const row of normalized ) {
            const rowItems: Array<{ element: string; definition?: ElementDefinition }> = [];
            for ( const element of row ) {
                const elementName = this.extractEntityName( element );
                const definition = await this.serializeElementDefinition( element );
                rowItems.push( { element: elementName, definition } );
            }
            rows.push( rowItems );
        }

        return {
            name,
            resolver: undefined,
            items: rows,
            options: undefined
        };
    }

    private async serializeElementDefinition( element: unknown ): Promise<ElementDefinition | undefined> {
        if ( !element || typeof element !== "function" ) {
            return undefined;
        }

        const ElementClass = element as {
            getName?: () => string;
            getInstanceType?: () => string;
            getComponentType?: () => number;
            prototype?: {
                getLabel?: () => Promise<string>;
                isLabelOmitted?: () => Promise<boolean>;
                getStyle?: () => Promise<string | number>;
                getEmoji?: () => Promise<string>;
                getURL?: () => Promise<string>;
                getPlaceholder?: () => Promise<string>;
            };
        };

        const name = this.safeCall( () => ElementClass.getName?.() ) ?? "";
        const instanceType = this.safeCall( () => ElementClass.getInstanceType?.() );
        const componentType = this.safeCall( () => ElementClass.getComponentType?.() );

        const proto = ElementClass.prototype;
        const hasGetURL = Boolean( proto && typeof proto.getURL === "function" );

        const definition: ElementDefinition = {
            name,
            elementType: this.resolveElementType( componentType, hasGetURL ),
            instanceType: instanceType ? String( instanceType ) : undefined
        };

        if ( !proto ) {
            return definition;
        }

        if ( proto.isLabelOmitted ) {
            try {
                const isOmitted = await proto.isLabelOmitted.call( {} );
                if ( isOmitted ) {
                    definition.labelOmitted = true;
                }
            } catch {
            }
        }

        if ( proto.getLabel && !definition.labelOmitted ) {
            try {
                const label = await proto.getLabel.call( {} );
                if ( label ) {
                    definition.label = label;
                }
            } catch {
            }
        }

        if ( proto.getStyle ) {
            try {
                const styleValue = await proto.getStyle.call( {} );
                const style = this.normalizeButtonStyle( styleValue );
                if ( style ) {
                    definition.style = style;
                }
            } catch {
            }
        }

        if ( hasGetURL ) {
            definition.style = "link";
            try {
                const url = await proto.getURL!.call( {} );
                if ( url ) {
                    definition.url = url;
                }
            } catch {
            }
        }

        if ( proto.getEmoji ) {
            try {
                const emoji = await proto.getEmoji.call( {} );
                if ( emoji ) {
                    definition.emoji = this.normalizeEmoji( emoji ) ?? ( typeof emoji === "string" ? emoji : undefined );
                }
            } catch {
            }
        }

        if ( proto.getPlaceholder ) {
            try {
                const placeholder = await proto.getPlaceholder.call( {} );
                if ( placeholder ) {
                    definition.placeholder = placeholder;
                }
            } catch {
            }
        }

        if ( definition.elementType === "select-menu" ) {
            const selectOptions = await this.extractSelectOptionsForElement( element, name );
            if ( selectOptions?.length ) {
                definition.selectOptions = selectOptions;
            }
        }

        this.applyElementLanguageContent( definition, name );

        return definition;
    }

    /**
     * Language content wins over the class, exactly as it does at render time.
     */
    private applyElementLanguageContent( definition: ElementDefinition, name: string ): void {
        const content = this.getElementLanguageContent( name );

        if ( ! content ) {
            return;
        }

        if ( content.label && ! definition.labelOmitted ) {
            definition.label = content.label;
        }

        if ( content.placeholder ) {
            definition.placeholder = content.placeholder;
        }

        if ( ! content.selectOptions?.length || ! definition.selectOptions?.length ) {
            return;
        }

        // Same merge the select menu does: by value where there is one, by position otherwise, and
        // only the label is translated.
        definition.selectOptions = definition.selectOptions.map( ( option, index ) => {
            const translated = content.selectOptions?.find( ( item ) => item.value && item.value === option.value )
                ?? content.selectOptions?.[ index ];

            return translated?.label ? { ...option, label: translated.label } : option;
        } );
    }

    /**
     * The text a user actually sees comes from the initial language file, not from the classes: at
     * runtime every getter reads `content?.x || getX()`, so an exporter that only calls the class
     * hands out whatever the code happened to hardcode - stale wording included.
     */
    private getInitialLanguage(): InitialLanguage | null {
        if ( this.initialLanguage !== undefined ) {
            return this.initialLanguage;
        }

        this.initialLanguage = this.loadInitialLanguage();

        return this.initialLanguage;
    }

    private loadInitialLanguage(): InitialLanguage | null {
        if ( ! existsSync( UI_LANGUAGES_INITIAL_FILE_PATH ) ) {
            this.logger.warn(
                "loadInitialLanguage",
                `No '${ UI_LANGUAGES_INITIAL_CODE }' language file at '${ UI_LANGUAGES_INITIAL_FILE_PATH }' - exporting the text the classes hardcode.`
            );

            return null;
        }

        try {
            const file = JSON.parse( readFileSync( UI_LANGUAGES_INITIAL_FILE_PATH, "utf-8" ) ) as InitialLanguageFile;

            const elements = new Map<string, ElementLanguageContent>();

            for ( const entry of [
                ... file.elements?.buttons ?? [],
                ... file.elements?.textInputs ?? [],
                ... file.elements?.selectMenus ?? []
            ] as LanguageEntry<ElementLanguageContent>[] ) {
                elements.set( entry.name, entry.content );
            }

            const language: InitialLanguage = {
                elements,
                embeds: new Map( ( file.embeds ?? [] ).map( ( entry ) => [ entry.name, entry.content ] ) ),
                modals: new Map( ( file.modals ?? [] ).map( ( entry ) => [ entry.name, entry.content ] ) )
            };

            this.logger.log(
                "loadInitialLanguage",
                `Loaded '${ file.code ?? UI_LANGUAGES_INITIAL_CODE }': ${ language.elements.size } element(s), ${ language.embeds.size } embed(s), ${ language.modals.size } modal(s).`
            );

            return language;
        } catch( error ) {
            this.logger.warn(
                "loadInitialLanguage",
                `Could not read '${ UI_LANGUAGES_INITIAL_FILE_PATH }' - exporting the text the classes hardcode.`,
                error
            );

            return null;
        }
    }

    private getElementLanguageContent( name: string ): ElementLanguageContent | undefined {
        return name ? this.getInitialLanguage()?.elements.get( name ) : undefined;
    }

    private getEmbedLanguageContent( name: string ): UIEmbedLanguageContent | undefined {
        return name ? this.getInitialLanguage()?.embeds.get( name ) : undefined;
    }

    private getModalLanguageContent( name: string ): UIModalLanguageContent | undefined {
        return name ? this.getInitialLanguage()?.modals.get( name ) : undefined;
    }

    private async extractSelectOptionsForElement(
        element: unknown,
        elementName: string
    ): Promise<Array<{ label?: string; value?: string; emoji?: string; description?: string }> | undefined> {
        if ( !element || typeof element !== "function" ) {
            return undefined;
        }

        const ElementClass = element as {
            prototype?: {
                getSelectOptions?: () => Promise<Array<{ label?: string; value?: string; emoji?: string; description?: string }>>;
            };
        };

        const proto = ElementClass.prototype;

        if ( !proto?.getSelectOptions ) {
            return undefined;
        }

        try {
            const mockInstance = Object.create( proto );
            mockInstance.uiArgs = {};

            const options = await mockInstance.getSelectOptions();

            if ( !Array.isArray( options ) || options.length === 0 ) {
                this.logger.debug(
                    "extractSelectOptionsForElement",
                    `No selectOptions found for '${ elementName }'`
                );
                return undefined;
            }

            this.logger.info(
                "extractSelectOptionsForElement",
                `Extracted ${ options.length } selectOptions for '${ elementName }'`
            );

            return options.map( ( opt ) => ( {
                label: opt.label,
                value: opt.value,
                emoji: this.normalizeEmoji( opt.emoji ),
                description: opt.description,
            } ) );
        } catch( error ) {
            this.logger.warn(
                "extractSelectOptionsForElement",
                `Failed to get selectOptions for '${ elementName }': ${ error }`
            );
            return undefined;
        }
    }

    /**
     * Normalize emoji from Discord API format to a plain string.
     * Handles: string "🌐", object { name: "🌐" }, object { id, name, animated }, undefined.
     */
    private normalizeEmoji( emoji: unknown ): string | undefined {
        if ( ! emoji ) {
            return undefined;
        }

        if ( typeof emoji === "string" ) {
            return emoji;
        }

        if ( typeof emoji === "object" ) {
            const emojiObj = emoji as { id?: string; name?: string; animated?: boolean };

            // Custom Discord emoji with id → format as <:name:id> or <a:name:id>
            if ( emojiObj.id && emojiObj.name ) {
                const prefix = emojiObj.animated ? "a" : "";
                return `<${ prefix }:${ emojiObj.name }:${ emojiObj.id }>`;
            }

            // Unicode emoji stored as { name: "🌐" }
            if ( emojiObj.name ) {
                return emojiObj.name;
            }
        }

        return undefined;
    }

    private resolveElementType(
        componentType: number | undefined,
        hasGetURL: boolean
    ): ElementDefinition[ "elementType" ] {
        if ( componentType === 2 ) {
            return hasGetURL ? "button-url" : "button";
        }
        if ( componentType === 3 ) {
            return "select-menu";
        }
        if ( componentType === 4 ) {
            return "text-input";
        }
        if ( componentType === 5 ) {
            return "user-select";
        }
        if ( componentType === 6 ) {
            return "role-select";
        }
        if ( componentType === 7 ) {
            return "mentionable-select";
        }
        if ( componentType === 8 ) {
            return "channel-select";
        }

        return "unknown";
    }

    private normalizeButtonStyle( styleValue: string | number ): ElementDefinition[ "style" ] | undefined {
        const validStyles = [ "primary", "secondary", "success", "danger", "link" ] as const;

        if ( typeof styleValue === "string" ) {
            const lower = styleValue.toLowerCase();
            if ( validStyles.includes( lower as typeof validStyles[ number ] ) ) {
                return lower as ElementDefinition[ "style" ];
            }
            return undefined;
        }

        if ( styleValue === 1 ) {
            return "primary";
        }
        if ( styleValue === 2 ) {
            return "secondary";
        }
        if ( styleValue === 3 ) {
            return "success";
        }
        if ( styleValue === 4 ) {
            return "danger";
        }
        if ( styleValue === 5 ) {
            return "link";
        }

        return undefined;
    }

    private serializeEmbedsGroup(
        componentClass: UIComponentTypeConstructor,
        group: typeof UIEmbedsGroupBase,
        index: number,
        recordEmbed?: ( reference: EmbedReference, groupName: string ) => void
    ): EmbedsGroupDefinition {
        const name = group.getName?.() ?? `${ componentClass.getName() }/EmbedsGroup/${ index }`;
        const itemsRaw = this.safeCall( () => group.getItems?.() ) ?? [];
        const items = itemsRaw.map( ( embed ) => {
            const reference = this.serializeEmbedReference( embed );
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

    private async serializeAdapter(
        adapterClass: TAdapterClassType,
        uiService: UIService,
        components: Map<string, ComponentDefinition>,
        handlerMap: Map<string, HandlerCapture>,
        moduleName: string,
        flowTriggersByAdapter: Map<string, Map<string, FlowTriggerDefinition[]>>,
        moduleSummary: ModuleExportSummary,
        globalEmbedStats: EmbedAuditStats,
        embedDiagnostics: ComponentEmbedDiagnostics[]
    ): Promise<AdapterDefinition> {
        const adapterName = adapterClass.getName();
        const adapterInstance = uiService.get( adapterName, true ) as UIAdapterBase<any, any> | undefined;
        if ( !adapterInstance ) {
            throw new Error( `Adapter '${ adapterName }' is not registered.` );
        }

        const metadata = this.getAdapterMetadata( adapterClass );

        const componentClass = adapterClass.getComponent() as UIComponentTypeConstructor | undefined;
        const componentName: string =
            componentClass && typeof componentClass.getName === "function"
                ? componentClass.getName()
                : "";

        if ( componentClass && !components.has( componentName ) ) {
            const { definition, embedAudit, diagnostics } = await this.serializeComponent( componentClass, moduleName );
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

        const executionSteps = this.serializeExecutionSteps( adapterClass );
        const triggerCollection = new Map<string, FlowTriggerDefinition[]>();
        const bindings = await this.serializeBindings(
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
        const hooks = this.serializeAdapterHooks( adapterName, metadata, handlerMap );

        const permissions = this.safeCall( () => adapterInstance.getPermissions() );
        const channelTypes = this.safeCall( () => adapterInstance.getChannelTypes() ) ?? [];
        const instanceType = String( this.safeCall( () => adapterClass.getInstanceType?.() ) ?? "dynamic" );

        // Extract modal triggers from bindings with kind "modal-button"
        const modalTriggers = bindings
            .filter( ( binding ) => binding.kind === "modal-button" && binding.options )
            .map( ( binding ) => ( {
                buttonElement: binding.options!.button as string,
                modalName: binding.options!.modal as string
            } ) )
            .filter( ( trigger ) => trigger.buttonElement && trigger.modalName );

        return {
            name: adapterName,
            adapterKind: this.determineAdapterKind( adapterClass as AdapterClass ),
            component: componentName,
            module: moduleName,
            instanceType,
            channelTypes: this.normalizeChannelTypes( channelTypes ),
            permissions: permissions ? permissions.bitfield.toString() : null,
            middlewares: undefined,
            executionSteps,
            bindings,
            modalTriggers: modalTriggers.length ? modalTriggers : undefined,
            hooks,
            options: undefined
        };
    }

    private serializeExecutionSteps( adapterClass: TAdapterClassType ): ExecutionStepDefinition[] {
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

    private async serializeBindings(
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

    private serializeAdapterHooks(
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
        pushHook( "onAfterBuild", "OnAfterBuild", undefined );
        pushHook( "onBeforeFinish", "OnBeforeFinish", metadata?.beforeFinishHandler );
        pushHook( "onStep", "OnStep", metadata?.onStepHandler );

        return hooks;
    }

    private cloneFlowTriggers(
        entries: FlowTriggerDefinition[] | undefined,
        handlerIdSuffix: string | undefined
    ): FlowTriggerDefinition[] | undefined {
        if ( !entries || entries.length === 0 ) {
            return undefined;
        }

        return entries.map( ( entry ) => ( {
            handlerId: handlerIdSuffix ? `${ entry.handlerId }/${ handlerIdSuffix }` : entry.handlerId,
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

    private async serializeFlow(
        flowClass: FlowClass,
        moduleInstance: UIModuleBase,
        wizardAdapterComponents: Map<string, string[]>,
        moduleName: string,
        flowTriggersByAdapter: Map<string, Map<string, FlowTriggerDefinition[]>>
    ): Promise<FlowDefinition> {
        const flowName = flowClass.getName();
        const FlowCtor = flowClass as unknown as new ( options: { module: UIModuleBase } ) => UIFlowBase<string, string>;
        const flowInstance = new FlowCtor( { module: moduleInstance } );

        const flowAdapterName = this.deriveAdapterNameFromFlow( flowName );
        const wizardComponentNames = flowAdapterName ? wizardAdapterComponents.get( flowAdapterName ) : undefined;

        let wizardStateData = wizardComponentNames?.length
            ? this.buildWizardStateComponentDataFromNames( flowClass, wizardComponentNames )
            : undefined;

        if ( !wizardStateData && this.isWizardFlowInstance( flowInstance ) ) {
            wizardStateData = this.buildWizardStateComponentDataFromInstance( flowInstance );
        }

        const adapterTriggers = flowAdapterName ? flowTriggersByAdapter.get( flowAdapterName ) : undefined;
        const transitions = this.serializeFlowTransitions( flowClass, adapterTriggers );
        const states = this.serializeFlowStates( flowClass, wizardStateData?.stateToComponent );
        const requiredData = this.serializeFlowRequiredData( flowClass );
        const entryPoints = this.serializeIntegrationPoints( flowClass.getEntryPoints?.() ?? [] );
        const handoffPoints = this.serializeIntegrationPoints( flowClass.getHandoffPoints?.() ?? [] );

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
            inputRequirements: flowClass.getInputRequirements?.(),
            channelTypes: this.normalizeChannelTypes( this.safeCall( () => flowInstance.getChannelTypes() ) ),
            permissions: this.safeCall( () => flowInstance.getPermissions()?.bitfield.toString() ),
            initialData: undefined,
            stepStates: wizardStateData?.orderedStateNames,
            stepComponents: wizardStateData?.componentNames,
            flowType: flowClass.getFlowType?.(),
            hooks: [],
            options: undefined
        };

        return definition;
    }

    private serializeFlowTransitions(
        flowClass: FlowClass,
        triggerMap?: Map<string, FlowTriggerDefinition[]>
    ): FlowDefinition[ "transitions" ] {
        const getNextStates = Reflect.get( flowClass, "getNextStates" ) as ( () => Record<string, string> ) | undefined;
        const nextStates = getNextStates?.call( flowClass ) ?? {};
        return Object.entries( nextStates ).map( ( [ transition, target ] ) => ( {
            from: transition,
            to: typeof target === "string" ? target : "",
            triggeredBy: this.cloneFlowTriggers( triggerMap?.get( transition ), transition ),
            options: undefined
        } ) );
    }

    private serializeFlowStates(
        flowClass: FlowClass,
        stateComponentMap?: Map<string, string>
    ): FlowStateDefinition[] {
        const getFlowTransitions = Reflect.get( flowClass, "getFlowTransitions" ) as ( () => Record<string, string[]> ) | undefined;
        const transitions = getFlowTransitions?.call( flowClass ) ?? {};
        const getStateOptions = Reflect.get( flowClass, "getStateOptions" ) as ( () => Record<string, JsonObject> ) | undefined;
        const stateOptions = getStateOptions?.call( flowClass ) ?? {};

        return Object.keys( transitions ).map( ( stateKey ) => ( {
            key: stateKey,
            component:
                stateComponentMap?.get( stateKey )
                ?? this.normalizeExecutionStepToComponent( stateOptions[ stateKey ]?.executionStep ),
            transitions: transitions[ stateKey ],
            hooks: [],
            options: stateOptions[ stateKey ]
        } ) );
    }

    private normalizeExecutionStepToComponent( executionStep: unknown ): string | undefined {
        if ( typeof executionStep !== "string" ) {
            return undefined;
        }

        const normalized = executionStep.trim();

        return normalized.length ? normalized : undefined;
    }

    private serializeFlowRequiredData( flowClass: FlowClass ): FlowDefinition[ "requiredData" ] {
        const getRequiredData = Reflect.get( flowClass, "getRequiredData" ) as ( () => Record<string, string[]> ) | undefined;
        const requiredData = getRequiredData?.call( flowClass ) ?? {};

        return Object.entries( requiredData ).map( ( [ transition, fields ] ) => ( {
            transition,
            fields: Array.isArray( fields ) ? fields : [],
            options: undefined
        } ) );
    }

    private serializeIntegrationPoints( points: UIFlowIntegrationPointBase[] ): FlowIntegrationPointDefinition[] {
        return points.map( ( point ) => ( {
            flowName: point.flowName,
            description: point.description,
            sourceState: point.sourceState,
            targetState: point.targetState,
            transition: point.transition,
            requiredData: point.requiredData,
            integrationType: this.getIntegrationPointType( point ),
            options: undefined
        } ) );
    }

    private getComponentMetadata(
        componentClass: UIComponentTypeConstructor
    ): ComponentBuilderMetadata | undefined {
        return Reflect.get( componentClass, BUILDER_METADATA_SYMBOL ) as ComponentBuilderMetadata | undefined;
    }

    private getAdapterMetadata( adapterClass: TAdapterClassType ): AdapterBuilderMetadata | undefined {
        return Reflect.get( adapterClass, BUILDER_METADATA_SYMBOL ) as AdapterBuilderMetadata | undefined;
    }

    private getEmbedMetadata( embedClass: typeof UIEmbedBase ): EmbedBuilderMetadata | undefined {
        return Reflect.get( embedClass, BUILDER_METADATA_SYMBOL ) as EmbedBuilderMetadata | undefined;
    }

    private normalize2D( input: unknown ): unknown[][] {
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

    private safeCall<T>( fn: () => T ): T | undefined {
        try {
            return fn();
        } catch {
            return undefined;
        }
    }

    private writeJson( filePath: string, payload: unknown ) {
        mkdirSync( path.dirname( filePath ), { recursive: true } );
        writeFileSync( filePath, JSON.stringify( payload, null, 4 ), "utf8" );
    }

    private extractEntityName( entity: unknown ): string {
        if ( typeof entity === "function" && "getName" in entity ) {
            try {
                return ( entity as { getName: () => string } ).getName();
            } catch {
            }
        }

        if ( entity && typeof entity === "object" && "getName" in entity ) {
            try {
                return ( entity as { getName: () => string } ).getName();
            } catch {
            }
        }

        return String( entity );
    }

    private callStaticArray<T>( ClassCtor: object, method: string ): T[] | undefined {
        const fn = Reflect.get( ClassCtor, method );

        if ( typeof fn !== "function" ) {
            return undefined;
        }

        const result = fn.call( ClassCtor );

        return Array.isArray( result ) ? ( result as T[] ) : undefined;
    }

    private serializeEmbedReference( embed: unknown ): EmbedReference {
        const embedName = this.extractEntityName( embed );
        let definition: EmbedContentDefinition | undefined;

        if ( typeof embed === "function" ) {
            const embedClass = embed as typeof UIEmbedBase;
            const metadata = this.getEmbedMetadata( embedClass );
            if ( !metadata ) {
                this.logger.warn(
                    "serializeEmbedReference",
                    `Embed '${ embedName }' is missing builder metadata.`
                );
            }
            definition = this.applyEmbedLanguageContent( this.buildEmbedDefinitionFromMetadata( metadata ), embedName );
            if ( metadata && ( !definition || Object.keys( definition ).length === 0 ) ) {
                this.logger.warn(
                    "serializeEmbedReference",
                    `Embed '${ embedName }' has builder metadata but produced empty definition.`
                );
            }
        }

        const reference: EmbedReference = { embed: embedName };

        if ( definition && Object.keys( definition ).length ) {
            reference.definition = definition;
        }

        return reference;
    }

    /**
     * Both sides are templates - the vars are filled in when the embed is rendered - so the
     * language text simply replaces what the class declared, as it does at render time.
     */
    private applyEmbedLanguageContent(
        definition: EmbedContentDefinition | undefined,
        name: string
    ): EmbedContentDefinition | undefined {
        const content = this.getEmbedLanguageContent( name );

        if ( ! content ) {
            return definition;
        }

        const merged: EmbedContentDefinition = { ... definition };

        if ( content.title ) {
            merged.title = content.title;
        }

        if ( content.description ) {
            merged.description = content.description;
        }

        if ( content.footer ) {
            merged.footer = content.footer;
        }

        return Object.keys( merged ).length ? merged : definition;
    }

    private buildEmbedDefinitionFromMetadata<TArgs extends UIArgs, TVars extends Record<string, JsonValue>>(
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

        const title = this.evaluateEmbedText( metadata.title, vars );
        if ( title ) {
            definition.title = title;
        }

        const description = this.evaluateEmbedText( metadata.description, vars );
        if ( description ) {
            definition.description = description;
        }

        const footer = this.evaluateEmbedText( metadata.footer, vars );
        if ( footer ) {
            definition.footer = footer;
        }

        const image = this.evaluateEmbedText( metadata.image, vars );
        if ( image ) {
            definition.image = image;
        }

        const thumbnail = this.evaluateEmbedText( metadata.thumbnail, vars );
        if ( thumbnail ) {
            definition.thumbnail = thumbnail;
        }

        const colorValue = this.evaluateEmbedNumber( metadata.color, vars );
        if ( colorValue !== undefined ) {
            definition.color = colorValue;
        }

        const optionsValue = this.evaluateEmbedOptions( metadata.options, vars );
        if ( optionsValue ) {
            definition.options = optionsValue;
        }

        const arrayOptionsValue = this.evaluateEmbedOptions( metadata.arrayOptions, vars );
        if ( arrayOptionsValue ) {
            definition.arrayOptions = arrayOptionsValue;
        }

        if ( vars !== undefined ) {
            definition.vars = this.serializeEmbedVars( vars );
        }

        if ( metadata.defaultVars && vars ) {
            definition.defaultVars = this.serializePartialEmbedVars( metadata.defaultVars( vars ) );
        }

        return Object.keys( definition ).length ? definition : undefined;
    }

    private evaluateEmbedText<TVars>(
        source: StringHandler<TVars> | undefined,
        vars: TVars | undefined
    ): string | undefined {
        const value = this.evaluateEmbedValue( source, vars );

        if ( typeof value === "string" && value.length > 0 ) {
            return value;
        }

        return undefined;
    }

    private evaluateEmbedNumber<TVars>(
        source: NumberHandler<TVars> | undefined,
        vars: TVars | undefined
    ): number | undefined {
        const value = this.evaluateEmbedValue( source, vars );

        return typeof value === "number" ? value : undefined;
    }

    private evaluateEmbedOptions<TVars>(
        source: OptionsHandler<TVars> | undefined,
        vars: TVars | undefined
    ): JsonObject | undefined {
        const value = this.evaluateEmbedValue( source, vars );

        if ( value && this.isJsonObjectValue( value ) ) {
            return this.serializeOptionsObject( value );
        }

        return undefined;
    }

    private evaluateEmbedValue<TResult, TVars>(
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

                if ( typeof result === "object" && result !== null && this.isPromise( result ) ) {
                    return undefined;
                }

                return result;
            } catch {
                return undefined;
            }
        }

        return source as TResult;
    }

    private serializeEmbedVars<TVars extends Record<string, JsonValue>>( vars: TVars ): JsonValue {
        const entries = Object.entries( vars ).map<[ string, JsonValue ]>( ( [ key, value ] ) => [
            key,
            this.normalizeJsonValue( value )
        ] );

        return Object.fromEntries( entries );
    }

    private serializePartialEmbedVars( vars: Partial<Record<string, JsonValue>> ): JsonObject {
        const entries = Object.entries( vars )
            .filter( ( entry ): entry is [ string, JsonValue ] => entry[ 1 ] !== undefined )
            .map<[ string, JsonValue ]>( ( [ key, value ] ) => [
                key,
                this.normalizeJsonValue( value )
            ] );

        return Object.fromEntries( entries );
    }

    private serializeOptionsObject( options: JsonObject ): JsonObject {
        const result: Record<string, JsonValue> = {};

        for ( const [ key, value ] of Object.entries( options ) ) {
            result[ key ] = this.normalizeJsonValue( value );
        }

        return result as JsonObject;
    }

    private normalizeJsonValue( value: JsonValue ): JsonValue {
        if ( value === null ) {
            return null;
        }

        if ( Array.isArray( value ) ) {
            return value.map( ( entry ) => this.normalizeJsonValue( entry ) );
        }

        if ( this.isJsonObjectValue( value ) ) {
            return this.serializeOptionsObject( value );
        }

        return value;
    }

    private isJsonObjectValue( value: JsonValue ): value is JsonObject {
        return typeof value === "object" && value !== null && !Array.isArray( value );
    }

    private isPromise<T>( value: object ): value is Promise<T> {
        return typeof ( value as { then?: unknown } ).then === "function";
    }

    private callStaticString( ClassCtor: object, method: string ): string | undefined {
        const fn = Reflect.get( ClassCtor, method );

        if ( typeof fn !== "function" ) {
            return undefined;
        }

        const result = fn.call( ClassCtor );

        return typeof result === "string" ? result : undefined;
    }

    private normalizeChannelTypes( channelTypes: readonly unknown[] | undefined ): string[] | undefined {
        if ( !channelTypes?.length ) {
            return undefined;
        }

        const labels: string[] = [];
        const seen = new Set<string>();

        for ( const entry of channelTypes ) {
            const label = this.resolveChannelTypeLabel( entry );
            if ( !seen.has( label ) ) {
                seen.add( label );
                labels.push( label );
            }
        }

        return labels;
    }

    private resolveChannelTypeLabel( entry: unknown ): string {
        if ( typeof entry === "string" ) {
            if ( Object.prototype.hasOwnProperty.call( ChannelType, entry ) ) {
                return entry;
            }

            const numeric = Number( entry );
            if ( Number.isInteger( numeric ) ) {
                return this.resolveChannelTypeLabel( numeric );
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

    private async createElementsGroupFromDirect(
        name: string | null | undefined,
        elements: unknown
    ): Promise<ElementsGroupDefinition> {
        const groupName = name ?? "Component/Elements";
        const normalized = this.normalize2D( elements );

        const rows: Array<Array<{ element: string; definition?: ElementDefinition }>> = [];

        for ( const row of normalized ) {
            const rowItems: Array<{ element: string; definition?: ElementDefinition }> = [];
            for ( const element of row ) {
                const elementName = this.extractEntityName( element );
                const definition = await this.serializeElementDefinition( element );
                rowItems.push( { element: elementName, definition } );
            }
            rows.push( rowItems );
        }

        return {
            name: groupName,
            resolver: undefined,
            items: rows,
            options: undefined
        };
    }

    private getIntegrationPointType(
        point: UIFlowIntegrationPointBase
    ): FlowIntegrationPointDefinition[ "integrationType" ] {
        const ctor = point.constructor as { getType?: () => FlowIntegrationPointDefinition[ "integrationType" ] };
        return typeof ctor.getType === "function" ? ctor.getType() : undefined;
    }

    private isWizardFlowInstance( flow: UIFlowBase<string, string> ): flow is UIWizardFlowBase {
        return typeof ( flow as UIWizardFlowBase ).getStepComponents === "function";
    }

    private buildWizardStateComponentDataFromInstance(
        flowInstance: UIWizardFlowBase
    ): WizardStateComponentData {
        const stateToComponent = new Map<string, string>();
        const orderedStateNames: string[] = [];

        const componentNames = flowInstance
            .getStepComponents()
            .map( ( ComponentCtor ) => this.callStaticString( ComponentCtor, "getName" ) )
            .filter( ( name ): name is string => typeof name === "string" && name.length > 0 );

        const flowClass = flowInstance.constructor as FlowClass;
        const transitionsFactory = Reflect.get( flowClass, "getFlowTransitions" ) as ( () => Record<string, string[]> ) | undefined;
        const stateKeys = Object.keys( transitionsFactory?.call( flowClass ) ?? {} );
        const getStateOptions = Reflect.get( flowClass, "getStateOptions" ) as ( () => Record<string, JsonObject> ) | undefined;
        const stateOptions = getStateOptions?.call( flowClass ) ?? {};
        const hasStepStates = stateKeys.some( ( key ) => this.extractWizardStepIndex( key ) !== null );

        if ( !hasStepStates ) {
            return {
                stateToComponent: new Map<string, string>(),
                orderedStateNames: [],
                componentNames
            };
        }

        let sequentialIndex = 0;

        for ( const stateKey of stateKeys ) {
            if ( stateKey.includes( "UIWizardFlowBase/States" ) ) {
                continue;
            }

            const executionStep = this.normalizeExecutionStepToComponent( stateOptions[ stateKey ]?.executionStep );

            if ( executionStep ) {
                stateToComponent.set( stateKey, executionStep );
                continue;
            }

            const stepIndex = this.extractWizardStepIndex( stateKey );
            const componentIndex = stepIndex !== null ? stepIndex : sequentialIndex;

            const componentName = componentNames[ componentIndex ];

            if ( !componentName ) {
                continue;
            }

            stateToComponent.set( stateKey, componentName );
            orderedStateNames[ componentIndex ] = stateKey;

            if ( stepIndex === null ) {
                sequentialIndex += 1;
            }
        }

        return {
            stateToComponent,
            orderedStateNames: orderedStateNames.filter( Boolean ),
            componentNames
        };
    }

    private extractWizardStepIndex( stateKey: string ): number | null {
        const match = stateKey.match( /\/States\/Step(\d+)/ );

        if ( !match ) {
            return null;
        }

        const value = parseInt( match[ 1 ], 10 );

        return Number.isNaN( value ) ? null : Math.max( value - 1, 0 );
    }

    private buildWizardStateComponentDataFromNames(
        flowClass: FlowClass,
        componentNames: readonly string[]
    ): WizardStateComponentData | undefined {
        const stateToComponent = new Map<string, string>();
        const orderedStateNames: string[] = [];

        const transitionsFactory = Reflect.get( flowClass, "getFlowTransitions" ) as ( () => Record<string, string[]> ) | undefined;
        const stateKeys = Object.keys( transitionsFactory?.call( flowClass ) ?? {} );
        const getStateOptions = Reflect.get( flowClass, "getStateOptions" ) as ( () => Record<string, JsonObject> ) | undefined;
        const stateOptions = getStateOptions?.call( flowClass ) ?? {};
        const hasStepStates = stateKeys.some( ( key ) => this.extractWizardStepIndex( key ) !== null );

        if ( !hasStepStates ) {
            return undefined;
        }

        let sequentialIndex = 0;

        for ( const stateKey of stateKeys ) {
            if ( stateKey.includes( "UIWizardFlowBase/States" ) ) {
                continue;
            }

            const executionStep = this.normalizeExecutionStepToComponent( stateOptions[ stateKey ]?.executionStep );

            if ( executionStep ) {
                stateToComponent.set( stateKey, executionStep );
                continue;
            }

            const stepIndex = this.extractWizardStepIndex( stateKey );

            const componentIndex = stepIndex !== null ? stepIndex : sequentialIndex;
            const componentName = componentNames[ componentIndex ];

            if ( !componentName ) {
                continue;
            }

            stateToComponent.set( stateKey, componentName );
            orderedStateNames[ componentIndex ] = stateKey;

            if ( stepIndex === null ) {
                sequentialIndex += 1;
            }
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

    private deriveAdapterNameFromFlow( flowName: string ): string | undefined {
        if ( !flowName ) {
            return undefined;
        }

        return flowName.replace( /Flow$/, "Adapter" );
    }

    /**
     * Generate virtual flows from binding flowTriggers for adapters that don't use defineTransactions().
     * This extracts flow structure from the inline flowTriggers defined in adapter bindings.
     */
    private generateVirtualFlowsFromBindingTriggers(
        flowTriggersByAdapter: Map<string, Map<string, FlowTriggerDefinition[]>>,
        existingFlowNames: string[]
    ): FlowDefinition[] {
        // Group all triggers by flow name
        const triggersByFlow = new Map<string, {
            triggers: FlowTriggerDefinition[];
            transitions: Map<string, FlowTriggerDefinition[]>;
            adapterName: string;
            moduleName?: string;
        }>();

        for ( const [ adapterName, transitionMap ] of flowTriggersByAdapter ) {
            for ( const [ transition, triggers ] of transitionMap ) {
                for ( const trigger of triggers ) {
                    const flowName = ( trigger as { flowName?: string } ).flowName;
                    if ( !flowName ) {
                        continue;
                    }

                    // Skip if this flow already exists (from manual flow class or defineTransactions)
                    if ( existingFlowNames.includes( flowName ) ) {
                        continue;
                    }

                    let flowData = triggersByFlow.get( flowName );
                    if ( !flowData ) {
                        // Derive module from flow name
                        const moduleName = this.deriveModuleFromFlowName( flowName );
                        flowData = {
                            triggers: [],
                            transitions: new Map(),
                            adapterName,
                            moduleName
                        };
                        triggersByFlow.set( flowName, flowData );
                    }

                    flowData.triggers.push( trigger );

                    const transitionKey = transition || ( trigger as { transition?: string } ).transition || "unknown";
                    const existingTransitions = flowData.transitions.get( transitionKey ) || [];
                    existingTransitions.push( trigger );
                    flowData.transitions.set( transitionKey, existingTransitions );
                }
            }
        }

        // Generate FlowDefinition for each unique flow
        const virtualFlows: FlowDefinition[] = [];

        for ( const [ flowName, flowData ] of triggersByFlow ) {
            const states = this.extractStatesFromTriggers( flowName, flowData.triggers );
            const transitions = this.extractTransitionsFromTriggers( flowName, flowData.transitions );
            const initialState = states.length > 0 ? states[ 0 ].key : `${ flowName }/States/Default`;

            const flowDefinition: FlowDefinition = {
                name: flowName,
                module: flowData.moduleName,
                flowKind: "virtual",
                initialState,
                states,
                transitions,
                requiredData: [],
                entryPoints: [],
                handoffPoints: [],
                hooks: [],
                options: {
                    generatedFrom: "BindingFlowTriggers",
                    isVirtual: true,
                    sourceAdapter: flowData.adapterName
                }
            };

            virtualFlows.push( flowDefinition );
        }

        return virtualFlows;
    }

    /**
     * Extract unique states from trigger navigation targets.
     */
    private extractStatesFromTriggers(
        flowName: string,
        triggers: FlowTriggerDefinition[]
    ): FlowStateDefinition[] {
        const statesMap = new Map<string, FlowStateDefinition>();

        // Add a default state
        const defaultStateKey = `${ flowName }/States/Default`;
        statesMap.set( defaultStateKey, {
            key: defaultStateKey,
            component: undefined,
            transitions: [],
            hooks: [],
            options: { executionStep: "default" }
        } );

        for ( const trigger of triggers ) {
            const navigation = trigger.navigation;
            if ( !navigation?.targetState ) {
                continue;
            }

            const stateKey = navigation.targetState;
            if ( statesMap.has( stateKey ) ) {
                continue;
            }

            statesMap.set( stateKey, {
                key: stateKey,
                component: undefined,
                transitions: [],
                hooks: [],
                options: navigation.executionStep
                    ? { executionStep: navigation.executionStep }
                    : undefined
            } );
        }

        return Array.from( statesMap.values() );
    }

    /**
     * Extract transitions from trigger definitions.
     */
    private extractTransitionsFromTriggers(
        flowName: string,
        transitionsMap: Map<string, FlowTriggerDefinition[]>
    ): FlowDefinition[ "transitions" ] {
        const transitions: FlowDefinition[ "transitions" ] = [];
        const defaultState = `${ flowName }/States/Default`;

        for ( const [ _transitionKey, triggers ] of transitionsMap ) {
            const trigger = triggers[ 0 ]; // Use first trigger for navigation info
            const targetState = trigger?.navigation?.targetState || defaultState;

            transitions.push( {
                from: defaultState, // Most adapter flows start from default
                to: targetState,
                triggeredBy: triggers.map( t => ( {
                    handlerId: t.handlerId,
                    sourceEntity: t.sourceEntity,
                    handlerKind: t.handlerKind,
                    navigation: t.navigation
                        ? {
                            targetState: t.navigation.targetState,
                            executionStep: t.navigation.executionStep
                        }
                        : undefined,
                    mutations: t.mutations?.map( m => ( {
                        type: m.type,
                        path: [ ...m.path ]
                    } ) )
                } ) ),
                options: undefined
            } );
        }

        return transitions;
    }

    /**
     * Derive module name from flow name pattern.
     */
    private deriveModuleFromFlowName( flowName: string ): string | undefined {
        if ( flowName.includes( "UI-V3" ) ) {
            return "VertixBot/UI-V3/Module";
        }
        if ( flowName.includes( "UI-V2" ) ) {
            return "VertixBot/UI-V2/Module";
        }
        if ( flowName.includes( "UI-General" ) ) {
            return "VertixBot/UI-General/Module";
        }
        return undefined;
    }

    private extractWizardComponentNames(
        metadata: AdapterBuilderMetadata | undefined
    ): string[] | undefined {
        const components = metadata?.wizard?.componentConfig?.components;

        if ( !components?.length ) {
            return undefined;
        }

        const names = components
            .map( ( ComponentCtor ) => this.callStaticString( ComponentCtor, "getName" ) )
            .filter( ( name ): name is string => typeof name === "string" && name.length > 0 );

        return names.length ? names : undefined;
    }

    private extractWizardComponentClasses(
        metadata: AdapterBuilderMetadata | undefined
    ): UIComponentTypeConstructor[] {
        const components = metadata?.wizard?.componentConfig?.components;

        if ( !components?.length ) {
            return [];
        }

        return components as UIComponentTypeConstructor[];
    }
}

let uiDefinitionExporter: UIDefinitionExporter | null = null;

function getUIDefinitionExporter(): UIDefinitionExporter {
    if ( !uiDefinitionExporter ) {
        uiDefinitionExporter = new UIDefinitionExporter();
    }
    return uiDefinitionExporter;
}

export async function exportUIDefinitions( uiService: UIService, options: ExporterOptions ) {
    await getUIDefinitionExporter().export( uiService, options );
}

export async function collectUIDefinitions( uiService: UIService, options: ExporterOptions ) {
    return getUIDefinitionExporter().collect( uiService, options );
}
