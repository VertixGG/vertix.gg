import path from "path";
import fs from "fs/promises";
import { watchFile, unwatchFile } from "fs";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { zFindRootPackageJsonPath } from "@zenflux/utils/workspace";

import { EXPORT_DIRECTORY, EXPORT_FILES, FILE_WATCH_CONFIG } from "@vertix.gg/api/src/server/constants";

import type {
    UIExportedComponent,
    UIExportedFlow,
    UIExportedMeta,
    UIExportedAdapter,
    UIExportData
} from "@vertix.gg/definitions/src/ui-export-definitions";

export class UIExportLoader extends InitializeBase {
    private static instance: UIExportLoader | null = null;

    private exportData: UIExportData | null = null;

    private exportsPath: string | null = null;

    private watchedFiles: string[] = [];

    private reloadDebounce: ReturnType<typeof setTimeout> | null = null;

    public static getName(): string {
        return "VertixAPI/Bootstrap/UIExportLoader";
    }

    public static getInstance(): UIExportLoader {
        if ( !UIExportLoader.instance ) {
            UIExportLoader.instance = new UIExportLoader();
        }
        return UIExportLoader.instance;
    }

    protected initialize(): void {
        this.logger.log( this.initialize, "UI Export Loader initialized" );
    }

    public async loadExports(): Promise<UIExportData> {
        if ( this.exportData ) {
            return this.exportData;
        }

        const rootPath = path.resolve( zFindRootPackageJsonPath(), ".." );
        this.exportsPath = path.join( rootPath, EXPORT_DIRECTORY );

        this.logger.info( this.loadExports, `Loading UI exports from: ${ this.exportsPath }` );

        await this.doLoadExports();

        this.startWatching();

        return this.exportData!;
    }

    private async doLoadExports(): Promise<void> {
        if ( !this.exportsPath ) {
            return;
        }

        try {
            const [ metaContent, componentsContent, flowsContent, adaptersContent ] = await Promise.all( [
                fs.readFile( path.join( this.exportsPath, EXPORT_FILES.META ), "utf-8" ),
                fs.readFile( path.join( this.exportsPath, EXPORT_FILES.COMPONENTS ), "utf-8" ),
                fs.readFile( path.join( this.exportsPath, EXPORT_FILES.FLOWS ), "utf-8" ),
                fs.readFile( path.join( this.exportsPath, EXPORT_FILES.ADAPTERS ), "utf-8" )
            ] );

            this.exportData = {
                meta: JSON.parse( metaContent ) as UIExportedMeta,
                components: JSON.parse( componentsContent ) as UIExportedComponent[],
                flows: JSON.parse( flowsContent ) as UIExportedFlow[],
                adapters: JSON.parse( adaptersContent ) as UIExportedAdapter[]
            };

            this.logger.info(
                this.doLoadExports,
                `Loaded: ${ this.exportData.meta.counts.flows } flows, ${ this.exportData.meta.counts.components } components, ${ this.exportData.adapters.length } adapters`
            );
        } catch {
            this.logger.warn(
                this.doLoadExports,
                `Failed to load exports from ${ this.exportsPath }. Files may not exist yet. Export will create them.`
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
        if ( !this.exportsPath || this.watchedFiles.length > 0 ) {
            return;
        }

        const filesToWatch = [
            path.join( this.exportsPath, EXPORT_FILES.META ),
            path.join( this.exportsPath, EXPORT_FILES.COMPONENTS ),
            path.join( this.exportsPath, EXPORT_FILES.FLOWS )
        ];

        this.logger.info( this.startWatching, `Watching for changes in: ${ this.exportsPath }` );

        const handleChange = ( filename: string ) => {
            if ( this.reloadDebounce ) {
                clearTimeout( this.reloadDebounce );
            }

            this.reloadDebounce = setTimeout( () => {
                this.logger.info( this.startWatching, `Detected change in ${ path.basename( filename ) }, reloading exports...` );
                this.doLoadExports().catch( err => {
                    this.logger.error( this.startWatching, `Failed to reload exports: ${ err }` );
                } );
            }, FILE_WATCH_CONFIG.DEBOUNCE_MS );
        };

        for ( const file of filesToWatch ) {
            watchFile( file, { interval: FILE_WATCH_CONFIG.INTERVAL_MS }, () => {
                handleChange( file );
            } );
            this.watchedFiles.push( file );
        }
    }

    public stopWatching(): void {
        for ( const file of this.watchedFiles ) {
            unwatchFile( file );
        }
        this.watchedFiles = [];
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
}

export const uiExportLoader = UIExportLoader.getInstance();
