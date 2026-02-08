import path from "path";
import { fileURLToPath } from "node:url";
import { watch } from "fs";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { zFindRootPackageJsonPath } from "@zenflux/utils/workspace";

import { collectUIDefinitions } from "@vertix.gg/gui/src/runtime/ui-definition-exporter";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import type { FSWatcher } from "fs";

import type {
    UIExportedComponent,
    UIExportedFlow,
    UIExportedAdapter,
    UIExportData
} from "@vertix.gg/definitions/src/ui-export-definitions";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

const WATCH_DEBOUNCE_MS = 500;

// Use a globalThis symbol to guarantee a single instance even when Bun resolves
// this module through multiple paths (e.g. workspace alias vs relative import).
const GLOBAL_KEY = Symbol.for( "vertix.gg/api/UIRuntimeLoader" );

export class UIRuntimeLoader extends InitializeBase {
    private exportData: UIExportData | null = null;

    private uiService: UIService | null = null;

    private watcher: FSWatcher | null = null;

    private reloadDebounce: ReturnType<typeof setTimeout> | null = null;

    private reloading = false;

    private loadingPromise: Promise<UIExportData> | null = null;

    public static getName(): string {
        return "VertixAPI/Bootstrap/UIRuntimeLoader";
    }

    public static getInstance(): UIRuntimeLoader {
        if ( !( globalThis as any )[ GLOBAL_KEY ] ) {
            ( globalThis as any )[ GLOBAL_KEY ] = new UIRuntimeLoader();
        }
        return ( globalThis as any )[ GLOBAL_KEY ];
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

    private async doCollectDefinitions( isReload = false ): Promise<void> {
        if ( !this.uiService ) {
            return;
        }

        if ( isReload && this.reloading ) {
            this.logger.info( this.doCollectDefinitions, "Reload already in progress, skipping" );
            return;
        }

        this.reloading = isReload;

        try {
            let collections;

            if ( isReload ) {
                // Spawn a subprocess to collect definitions with a clean module cache.
                // In-process re-registration doesn't work because Bun caches ESM modules
                // and won't re-evaluate changed files within the same process.
                this.logger.info( this.doCollectDefinitions, "Spawning subprocess for fresh UI definitions..." );
                collections = await collectUIDefinitionsInWorker();
                this.logger.info( this.doCollectDefinitions, "Subprocess completed" );
            } else {
                collections = await collectUIDefinitions( this.uiService, {
                    outputDir: "",
                    includeAdapters: true,
                    includeComponents: true,
                    includeFlows: true
                } );
            }

            // The collected definitions have the same runtime shape as UIExportData
            // (the JSON export→parse round-trip produces identical objects)
            this.exportData = collections as unknown as UIExportData;

            this.exportData.meta.exportedAt = new Date().toISOString();

            this.logger.info(
                this.doCollectDefinitions,
                `Collected${ isReload ? " (reload)" : "" }: ${ this.exportData.meta.counts.flows } flows, ${ this.exportData.meta.counts.components } components, ${ this.exportData.adapters.length } adapters`
            );
        } catch( error ) {
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
        } finally {
            this.reloading = false;
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
                    this.logger.info( this.startWatching, `Detected change in ${ filename }, reloading UI modules...` );
                    this.doCollectDefinitions( true ).catch( err => {
                        this.logger.error( this.startWatching, `Failed to reload UI modules: ${ err }` );
                    } );
                }, WATCH_DEBOUNCE_MS );
            } );
        } catch( error ) {
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

        // After HMR, the UILanguageManager singleton may have been reset — re-register if needed
        if ( !UILanguageManager.$.getInitialLanguage() ) {
            await UILanguageManager.$.register( { shouldValidate: false } );
        }

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

        // After HMR, the UILanguageManager singleton may have been reset — re-register if needed
        if ( !UILanguageManager.$.getInitialLanguage() ) {
            await UILanguageManager.$.register( { shouldValidate: false } );
        }

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

/**
 * Collect UI definitions in a subprocess with a completely fresh module cache.
 *
 * Uses `Bun.spawn()` instead of `worker_threads.Worker` because Bun's worker
 * threads share `globalThis` with the parent process. Since `ServiceLocator`
 * stores its singleton on `global.__vertix_base_service_locator__`, a worker
 * thread would reuse the parent's cached `UIService` (with stale adapter
 * metadata) instead of bootstrapping fresh.
 *
 * A subprocess gets its own V8/JSC isolate with a separate `globalThis` and
 * module cache, guaranteeing that all ESM imports are re-evaluated from disk.
 *
 * Returns the collected definitions as a parsed object (same shape as UIExportData).
 */
async function collectUIDefinitionsInWorker(): Promise<object> {
    const subprocessScript = path.resolve(
        path.dirname( fileURLToPath( import.meta.url ) ),
        "_workers/collect-ui-definitions.ts"
    );

    GlobalLogger.$.info( collectUIDefinitionsInWorker, "Spawning subprocess for fresh UI definitions..." );

    const proc = Bun.spawn( [ "bun", "run", subprocessScript ], {
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env },
    } );

    // Collect both streams concurrently to avoid pipe-buffer deadlock.
    // (If we await one before the other, a full pipe buffer on the un-read
    //  stream can block the subprocess and hang both sides.)
    const [ stderrText, stdoutText, exitCode ] = await Promise.all( [
        new Response( proc.stderr ).text(),
        new Response( proc.stdout ).text(),
        proc.exited
    ] );

    if ( stderrText.trim() ) {
        for ( const line of stderrText.trim().split( "\n" ) ) {
            GlobalLogger.$.info( collectUIDefinitionsInWorker, `[subprocess] ${ line }` );
        }
    }

    if ( exitCode !== 0 ) {
        throw new Error(
            `UI definition subprocess exited with code ${ exitCode }.\nstderr: ${ stderrText }`
        );
    }

    if ( !stdoutText.trim() ) {
        throw new Error( "UI definition subprocess produced no output on stdout" );
    }

    try {
        const resultData = JSON.parse( stdoutText );

        GlobalLogger.$.info(
            collectUIDefinitionsInWorker,
            `Subprocess collected: ${ resultData.meta.counts.flows } flows, ${ resultData.meta.counts.components } components, ${ resultData.adapters.length } adapters`
        );

        return resultData;
    } catch( err ) {
        throw new Error( `Failed to parse subprocess result: ${ err }\nstdout (first 500 chars): ${ stdoutText.slice( 0, 500 ) }` );
    }
}

export const uiRuntimeLoader = UIRuntimeLoader.getInstance();

// Backward-compatible alias — existing imports of uiExportLoader continue to work
export const uiExportLoader = uiRuntimeLoader;
