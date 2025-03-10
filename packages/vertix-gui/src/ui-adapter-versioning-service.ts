import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { DEFAULT_UI_NAMESPACE_SEPARATOR, DEFAULT_UI_PREFIX } from "@vertix.gg/gui/src/definitions/ui-declaration";

import { UIVersionStrategyBase } from "@vertix.gg/gui/src/bases/ui-version-strategy-base";

import type { Base } from "discord.js";
import type { UIService, TAdapterMapping } from "@vertix.gg/gui/src/ui-service";

class FallBackVersionStrategy extends UIVersionStrategyBase {
    public static getName () {
        return "VertixGUI/FallBackVersionStrategy";
    }

    public async determine () {
        // Return the first version
        return this.versions.keys().next().value || 0;
    }
}

export class UIAdapterVersioningService extends ServiceWithDependenciesBase<{
    uiService: UIService;
}> {
    private versions = new Map<number, string>();
    private versionNames = new Map<string, number>();

    private versionStrategies: UIVersionStrategyBase[] = [ new FallBackVersionStrategy( this.versions ) ];

    public constructor () {
        super();
        // Register a timer to check if versions are registered after initialization
        setTimeout( () => {
            if ( this.versions.size === 0 ) {
                console.warn( "No versions registered after initialization, registering default versions [2, 3]" );
                try {
                    this.registerVersions( [ 2, 3 ] );
                } catch ( error ) {
                    console.error( "Error registering default versions in constructor:", error );
                }
            }
        }, 5000 ); // Check after 5 seconds to ensure all services are initialized
    }

    public static getName () {
        return "VertixGUI/UIVersioningAdapterService";
    }

    public getDependencies () {
        return {
            uiService: "VertixGUI/UIService"
        };
    }

    public registerVersions ( range: [number, number], prefix = DEFAULT_UI_PREFIX ) {
        try {
            // If already have versions, then log and return
            if ( this.versions.size ) {
                console.warn( "Versions already registered, skipping registration" );
                return;
            }

            const [ start, end ] = range;

            if ( start > end ) {
                console.error( `Invalid version range: [${ start }, ${ end }]` );
                throw new Error( `Invalid version range: start (${ start }) must be less than or equal to end (${ end })` );
            }

            console.log( `Registering versions range [${ start }, ${ end }] with prefix ${ prefix }` );

            for ( let i = start; i <= end; i++ ) {
                this.versions.set( i, `${ prefix }${ i }` );
                this.versionNames.set( `${ prefix }${ i }`, i );
                console.log( `Registered version ${ i } as ${ prefix }${ i }` );
            }

            console.log( `Successfully registered ${ this.versions.size } versions` );
        } catch ( error ) {
            console.error( "Error registering versions:", error );

            // Ensure at least one version is registered to prevent crashes
            if ( this.versions.size === 0 ) {
                console.warn( "Emergency registering version 3 to prevent crashes" );
                this.versions.set( 3, `${ prefix }3` );
                this.versionNames.set( `${ prefix }3`, 3 );
            }

            throw error;
        }
    }

    public registerStrategy ( strategy: new ( versions: Map<number, string> ) => UIVersionStrategyBase ) {
        this.versionStrategies.push( new strategy( this.versions ) );
    }

    public async get<T extends keyof TAdapterMapping = "base"> (
        adapterName: string,
        context: Base | any,
        options: {
            prefix?: string;
            separator?: string;
        } = {}
    ) {
        const { prefix = DEFAULT_UI_PREFIX, separator = DEFAULT_UI_NAMESPACE_SEPARATOR } = options;

        const version = await this.determineVersion( context );

        const adapterNameWithVersion = this.formAdapterNameWithVersion( adapterName, version, prefix, separator );

        return this.services.uiService.get<T>( adapterNameWithVersion );
    }

    public getAllVersions () {
        return this.versions;
    }

    /**
     * Function `formAdapterNameWithVersion()` - Get adapter name with version.
     *
     * TODO: This should be fully configurable.
     * Version should stand after the first part of the adapter name
     * Example:
     * `Vertix/RenameAdapter` -> `Vertix/UI-V1/RenameAdapter`
     * `Vertix/CoolEntities/RenameAdapter` -> `Vertix/UI-V1/CoolEntities/RenameAdapter`
     */
    private formAdapterNameWithVersion ( adapterName: string, version: number, prefix: string, separator: string ) {
        const [ firstPart, ...restParts ] = adapterName.split( separator );
        return `${ firstPart }${ separator }${ prefix }${ version }${ separator }${ restParts.join( "/" ) }`;
    }

    public async determineVersion ( context: Base ) {
        // `Slice` used to get copy of an array
        for ( const versionStrategy of this.versionStrategies.slice().reverse() ) {
            const tryVersion = await versionStrategy.determine( context );

            if ( tryVersion ) {
                return tryVersion;
            }
        }

        throw new Error( "Unable to determine version" );
    }
}

export default UIAdapterVersioningService;
