import path from "path";
import { watch } from "fs";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { zFindRootPackageJsonPath } from "@zenflux/utils/workspace";

import { collectUIDefinitions } from "@vertix.gg/gui/src/runtime/ui-definition-exporter";

import type { FSWatcher } from "fs";

import type {
    UIExportedComponent,
    UIExportedFlow,
    UIExportedAdapter,
    UIExportData
} from "@vertix.gg/definitions/src/ui-export-definitions";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

const WATCH_DEBOUNCE_MS = 300;

export class UIRuntimeLoader extends InitializeBase {
    private static instance: UIRuntimeLoader | null = null;

    private exportData: UIExportData | null = null;

    private uiService: UIService | null = null;

    private watcher: FSWatcher | null = null;

    private reloadDebounce: ReturnType<typeof setTimeout> | null = null;

    private loadingPromise: Promise<UIExportData> | null = null;

    public static getName(): string {
        return "VertixAPI/Bootstrap/UIRuntimeLoader";
    }

    public static getInstance(): UIRuntimeLoader {
        if ( !UIRuntimeLoader.instance ) {
            UIRuntimeLoader.instance = new UIRuntimeLoader();
        }
        return UIRuntimeLoader.instance;
    }

    protected initialize(): void {
        this.logger.log( this.initialize, "UI Runtime Loader initialized" );
    }

    public async loadExports(): Promise<UIExportData> {
        if ( this.exportData ) {
            return this.exportData;
        }

        // Guard against concurrent calls — second caller waits for the first to finish
        if ( this.loadingPromise ) {
            return this.loadingPromise;
        }

        this.loadingPromise = this.doLoadExports();

        return this.loadingPromise;
    }

    private async doLoadExports(): Promise<UIExportData> {
        this.logger.info( this.doLoadExports, "Bootstrapping headless UI runtime (no Discord)..." );

        const { bootstrapUIRuntimeHeadless } = await import( "@vertix.gg/bot/src/entrypoint" );
        this.uiService = await bootstrapUIRuntimeHeadless();

        this.logger.info( this.doLoadExports, "Headless UI runtime bootstrapped, collecting definitions..." );

        await this.doCollectDefinitions();

        this.startWatching();

        return this.exportData!;
    }

    private async doCollectDefinitions(): Promise<void> {
        if ( !this.uiService ) {
            return;
        }

        try {
            const collections = await collectUIDefinitions( this.uiService, {
                outputDir: "",
                includeAdapters: true,
                includeComponents: true,
                includeFlows: true
            } );

            // The collected definitions have the same runtime shape as UIExportData
            // (the JSON export→parse round-trip produces identical objects)
            this.exportData = collections as unknown as UIExportData;

            this.logger.info(
                this.doCollectDefinitions,
                `Collected: ${ this.exportData.meta.counts.flows } flows, ${ this.exportData.meta.counts.components } components, ${ this.exportData.adapters.length } adapters`
            );
        } catch ( error ) {
            this.logger.error(
                this.doCollectDefinitions,
                `Failed to collect UI definitions: ${ error }`
            );

            this.exportData = {
                meta: {
                    schemaVersion: "1.0.0",
                    exportedAt: new Date().toISOString(),
                    counts: { components: 0, adapters: 0, flows: 0 },
                    modules: [],
                    moduleSummary: [],
                    embedCoverage: { total: 0, withDefinition: 0, missingDefinition: 0 }
                },
                components: [],
                flows: [],
                adapters: []
            };
        }
    }

    private startWatching(): void {
        if ( this.watcher ) {
            return;
        }

        const rootPath = path.resolve( zFindRootPackageJsonPath(), ".." );
        const uiSourcePath = path.join( rootPath, "packages", "vertix-bot", "src", "ui" );

        this.logger.info( this.startWatching, `Watching for UI source changes in: ${ uiSourcePath }` );

        try {
            this.watcher = watch( uiSourcePath, { recursive: true }, ( _eventType, filename ) => {
                if ( !filename ) {
                    return;
                }

                // Only react to TypeScript source files
                if ( !filename.endsWith( ".ts" ) && !filename.endsWith( ".tsx" ) ) {
                    return;
                }

                if ( this.reloadDebounce ) {
                    clearTimeout( this.reloadDebounce );
                }

                this.reloadDebounce = setTimeout( () => {
                    this.logger.info( this.startWatching, `Detected change in ${ filename }, re-collecting definitions...` );
                    this.doCollectDefinitions().catch( err => {
                        this.logger.error( this.startWatching, `Failed to re-collect definitions: ${ err }` );
                    } );
                }, WATCH_DEBOUNCE_MS );
            } );
        } catch ( error ) {
            this.logger.warn( this.startWatching, `Failed to start watching UI source directory: ${ error }` );
        }
    }

    public stopWatching(): void {
        if ( this.watcher ) {
            this.watcher.close();
            this.watcher = null;
        }
    }

    public getModules(): string[] {
        return this.exportData?.meta.modules ?? [];
    }

    public getModuleSummary( moduleName: string ) {
        return this.exportData?.meta.moduleSummary.find( m => m.module === moduleName );
    }

    public getFlowsForModule( moduleName: string ): UIExportedFlow[] {
        return this.exportData?.flows.filter( f => f.module === moduleName ) ?? [];
    }

    public getComponentsForModule( moduleName: string ): UIExportedComponent[] {
        return this.exportData?.components.filter( c => c.modules.includes( moduleName ) ) ?? [];
    }

    public getComponent( componentName: string ): UIExportedComponent | undefined {
        return this.exportData?.components.find( c => c.name === componentName );
    }

    public getFlow( flowName: string ): UIExportedFlow | undefined {
        return this.exportData?.flows.find( f => f.name === flowName );
    }

    public getAdaptersForModule( moduleName: string ): UIExportedAdapter[] {
        return this.exportData?.adapters.filter( a => a.module === moduleName ) ?? [];
    }

    public getAdapterForComponent( componentName: string ): UIExportedAdapter | undefined {
        return this.exportData?.adapters.find( a => a.component === componentName );
    }

    public async getLanguageTranslations( languageCode: string ): Promise<{
        embeds: Record<string, { title?: string; description?: string }>;
        elements: Record<string, { label?: string }>;
        modals: Record<string, { title?: string }>;
    }> {
        await this.loadExports();

        const { UILanguageManager } = await import( "@vertix.gg/bot/src/ui/ui-language-manager" );
        const languages = UILanguageManager.$.getAvailableLanguages();
        const lang = languages.get( languageCode );

        if ( !lang ) {
            return { embeds: {}, elements: {}, modals: {} };
        }

        const embeds: Record<string, { title?: string; description?: string }> = {};
        const elements: Record<string, { label?: string }> = {};
        const modals: Record<string, { title?: string }> = {};

        lang.embeds.forEach( ( embed ) => {
            embeds[ embed.name ] = {
                title: embed.content.title || undefined,
                description: embed.content.description || undefined
            };
        } );

        lang.elements.buttons.forEach( ( button ) => {
            elements[ button.name ] = {
                label: button.content.label || undefined
            };
        } );

        lang.modals.forEach( ( modal ) => {
            modals[ modal.name ] = {
                title: modal.content.title || undefined
            };
        } );

        return { embeds, elements, modals };
    }

    public async getAvailableLanguages(): Promise<Array<{ code: string; name: string; flag: string }>> {
        // Ensure exports are loaded (which triggers headless bootstrap + UILanguageManager registration)
        await this.loadExports();

        const { UILanguageManager } = await import( "@vertix.gg/bot/src/ui/ui-language-manager" );
        const languages = UILanguageManager.$.getAvailableLanguages();
        const initial = UILanguageManager.$.getInitialLanguage();

        const result: Array<{ code: string; name: string; flag: string }> = [];

        // Add initial language first
        result.push( { code: initial.code, name: initial.name, flag: initial.flag } );

        // Add remaining languages
        languages.forEach( ( lang ) => {
            if ( lang.code !== initial.code ) {
                result.push( { code: lang.code, name: lang.name, flag: lang.flag } );
            }
        } );

        return result;
    }
}

export const uiRuntimeLoader = UIRuntimeLoader.getInstance();

// Backward-compatible alias — existing imports of uiExportLoader continue to work
export const uiExportLoader = uiRuntimeLoader;
