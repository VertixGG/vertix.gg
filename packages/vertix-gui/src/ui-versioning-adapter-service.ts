import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { DEFAULT_UI_NAMESPACE_SEPARATOR, DEFAULT_UI_PREFIX } from "@vertix.gg/gui/src/definitions/ui-declaration";

import { UIVersionStrategyBase } from "@vertix.gg/gui/src/bases/ui-version-strategy-base";

import type UIAdapterService from "@vertix.gg/gui/src/ui-adapter-service";
import type UIService from "@vertix.gg/gui/src/ui-service";

import type { Base } from "discord.js";
import type { TPossibleAdapters } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

class FallBackVersionStrategy extends UIVersionStrategyBase {
    public static getName() {
        return "VertixGUI/FallBackVersionStrategy";
    }

    public async determine() {
        // Return first version
        return this.versions.keys().next().value;
    }
}

export class UIVersioningAdapterService extends ServiceWithDependenciesBase<{
    uiService: UIService;
    uiAdapterService: UIAdapterService;
}> {
    private versions = new Map<number, string>();
    private versionReverse = new Map<string, number>();

    private versionStrategies: ( UIVersionStrategyBase )[] = [
        new FallBackVersionStrategy( this.versions ),
    ];

    public static getName() {
        return "VertixGUI/UIVersioningAdapterService";
    }

    public getDependencies() {
        return {
            uiService: "VertixGUI/UIService",
            uiAdapterService: "VertixGUI/UIAdapterService",
        };
    }

    public registerVersions( range: [ number, number ], prefix = DEFAULT_UI_PREFIX ) {
        // If already have versions then throw an error
        if ( this.versions.size ) {
            throw new Error( "Versions already registered" );
        }

        const [ start, end ] = range;

        for ( let i = start ; i <= end ; i++ ) {
            this.versions.set( i, `${ prefix }${ i }` );
            this.versionReverse.set( `${ prefix }${ i }`, i );
        }
    }

    public registerStrategy( strategy: new( versions: Map<number, string> ) => UIVersionStrategyBase ) {
        this.versionStrategies.push( new strategy( this.versions ) );
    }

    public async get( adapterName: string, context: Base, options: {
        prefix?: string;
        separator?: string;
    } = {} ): Promise<TPossibleAdapters | undefined> {
        const {
            prefix = DEFAULT_UI_PREFIX,
            separator = DEFAULT_UI_NAMESPACE_SEPARATOR,
        } = options;

        const version = await this.determineVersion( context );

        const adapterNameWithVersion =
            this.formAdapterNameWithVersion( adapterName, version, prefix, separator );

        return this.services.uiAdapterService.get( adapterNameWithVersion );
    }

    /**
     * Function formAdapterNameWithVersion() : Get adapter name with version.
     *
     * TODO: This should be fully configurable.
     * Version should stand after the first part of the adapter name
     * Example:
     * `Vertix/RenameAdapter` -> `Vertix/UI-V1/RenameAdapter`
     * `Vertix/CoolEntities/RenameAdapter` -> `Vertix/UI-V1/CoolEntities/RenameAdapter`
     */
    private formAdapterNameWithVersion( adapterName: string, version: number, prefix: string, separator: string ) {
        const [ firstPart, ... restParts ] = adapterName.split( separator );
        return `${ firstPart }${ separator }${ prefix }${ version }${ separator }${ restParts.join( "/" ) }`;
    }

    public getAllVersions() {
        return this.versions;
    }

    public async determineVersion( context: Base ) {
        for ( const versionStrategy of this.versionStrategies.reverse() ) {
            const tryVersion = await versionStrategy.determine( context );

            if ( tryVersion ) {
                return tryVersion;
            }
        }

        throw new Error( "Unable to determine version" );
    }
}

export default UIVersioningAdapterService;
