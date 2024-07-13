import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { UIVersionStrategyBase } from "@vertix.gg/gui/src/bases/ui-version-strategy-base";

import type UIAdapterService from "@vertix.gg/gui/src/ui-adapter-service";
import type UIService from "@vertix.gg/gui/src/ui-service";

import type { Base } from "discord.js";

const DEFAULT_UI_PREFIX = "UI-V",
    DEFAULT_NAMESPACE_SEPARATOR = "/";

class FallBackVersionStrategy extends UIVersionStrategyBase {
    public determine() {
        // Return last possible version.
        return Array.from( this.versions.keys() ).pop() || 0;
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

    public get( adapterName: string, context: Base, options: {
        prefix?: string;
        separator?: string;
    } ) {
        const {
            prefix = DEFAULT_UI_PREFIX,
            separator = DEFAULT_NAMESPACE_SEPARATOR,
        } = options;

        const version = this.determineVersion( context );

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

    public determineVersion( context: Base ) {
        for ( const versionStrategy of this.versionStrategies.reverse() ) {
            if ( versionStrategy.determine( context ) ) {
                return versionStrategy.determine( context );
            }
        }

        throw new Error( "Unable to determine version" );
    }
}
