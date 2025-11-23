import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";
import { UIDefinitionLoader } from "@vertix.gg/gui/src/runtime/ui-definition-loader";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type {
    AdapterDefinition,
    ComponentDefinition,
    FlowDefinition
} from "@vertix.gg/gui/src/runtime/ui-definition-types";

interface JsonCollectionOptions<T extends { name: string }> {
    readonly entries: T[];
}

class JsonCollection<T extends { name: string }> {
    private readonly entries: Map<string, T>;

    public constructor( options: JsonCollectionOptions<T> ) {
        this.entries = new Map( options.entries.map( ( entry ) => [ entry.name, entry ] ) );
    }

    public async findOne( filter: { name: string } ): Promise<T | null> {
        return this.entries.get( filter.name ) ?? null;
    }
}

function loadJsonFile<T>( filePath: string ): T {
    const raw = readFileSync( filePath, "utf8" );
    return JSON.parse( raw ) as T;
}

function resolveExportsDirectory(): string {
    const candidates = [
        path.resolve( process.cwd(), "exports", "ui" ),
        path.resolve( process.cwd(), "..", "exports", "ui" ),
        path.resolve( process.cwd(), "..", "..", "exports", "ui" ),
        path.resolve( process.cwd(), "..", "..", "..", "exports", "ui" ),
        path.resolve( process.cwd(), "..", "..", "..", "..", "exports", "ui" )
    ];

    for ( const candidate of candidates ) {
        if ( existsSync( path.join( candidate, "components.json" ) ) ) {
            return candidate;
        }
    }

    throw new Error( "UIDefinitionLoaderService: unable to locate 'exports/ui' directory" );
}

// TODO: Move to VertixGUI
export default class UIDefinitionLoaderService extends ServiceWithDependenciesBase<{
    uiService: UIService;
}> {
    private loader: UIDefinitionLoader | null = null;

    public static getName() {
        return "VertixBot/Services/UIDefinitionLoaderService";
    }

    public getLoader(): UIDefinitionLoader {
        if ( !this.loader ) {
            throw new Error( "UIDefinitionLoaderService: loader accessed before initialization" );
        }

        return this.loader;
    }

    public getDependencies() {
        return {
            uiService: "VertixGUI/UIService"
        };
    }

    protected async initialize(): Promise<void> {
        await super.initialize();

        const exportsDir = resolveExportsDirectory();

        const components = loadJsonFile<ComponentDefinition[]>( path.join( exportsDir, "components.json" ) );
        const adapters = loadJsonFile<AdapterDefinition[]>( path.join( exportsDir, "adapters.json" ) );
        const flows = loadJsonFile<FlowDefinition[]>( path.join( exportsDir, "flows.json" ) );

        this.loader = new UIDefinitionLoader( {
            mode: "mongo",
            componentsCollection: new JsonCollection<ComponentDefinition>( { entries: components } ),
            adaptersCollection: new JsonCollection<AdapterDefinition>( { entries: adapters } ),
            flowsCollection: new JsonCollection<FlowDefinition>( { entries: flows } )
        } );
    }
}

