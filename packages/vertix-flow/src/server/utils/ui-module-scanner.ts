import { readdir, access } from "fs/promises";
import { constants } from "fs";
import path from "path";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";
import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

export interface UIModuleFile {
    name: string;
    path: string;
    moduleInfo: {
        name: string;
        adapters: string[];
        flows: string[];
    };
}

async function registerConfigs() {

    const { ConfigManager } = await import( "@vertix.gg/base/src/managers/config-manager" );

    const configs = await Promise.all( [
        import( "@vertix.gg/bot/src/config/master-channel-config" ),
        import( "@vertix.gg/bot/src/config/master-channel-config-v3" )
    ] );

    await Promise.all(
        configs.map( async( config ) => {
            await ConfigManager.$.register<ConfigBase<ConfigBaseInterface>>( config.default );

        } )
    );

}

// Initialize services once when module is loaded
const servicesInitialized = ( async() => {
    const uiServices = await Promise.all( [
        import( "@vertix.gg/gui/src/ui-service" ),
        import( "@vertix.gg/gui/src/ui-hash-service" ),
        import( "@vertix.gg/gui/src/ui-adapter-versioning-service" ),
    ] );


    uiServices.forEach( ( service ) => {
        ServiceLocator.$.register<ServiceBase>( service.default, {} );
    } );

    await registerConfigs();


    await ServiceLocator.$.waitForAll();

    // Get UI service to register wizard buttons
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    // Register the wizard buttons
    const { UIRegenerateButton } = await import( "@vertix.gg/bot/src/ui/general/regenerate/ui-regenerate-button" ),
        { UIWizardBackButton } = await import( "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-back-button" ),
        { UIWizardNextButton } = await import( "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-next-button" ),
        { UIWizardFinishButton } = await import( "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-finish-button" );

    uiService.$$.registerSystemElements( {
        RegenerateButton: UIRegenerateButton,
        WizardBackButton: UIWizardBackButton,
        WizardNextButton: UIWizardNextButton,
        WizardFinishButton: UIWizardFinishButton
    } );
} )();

export async function scanUIModules( baseDir: string ): Promise<UIModuleFile[]> {
    // Wait for services to be initialized if they haven't been
    await servicesInitialized;

    const files: UIModuleFile[] = [];

    // Check if directory exists and is accessible
    try {
        await access( baseDir, constants.R_OK );
    } catch {
        console.warn( `Directory ${ baseDir } does not exist or is not accessible` );
        return [];
    }

    async function scanDir( dir: string ) {
        let entries;
        try {
            entries = await readdir( dir, { withFileTypes: true } );
        } catch ( error ) {
            console.error( `Error reading directory ${ dir }:`, error );
            return;
        }

        for ( const entry of entries ) {
            const fullPath = path.join( dir, entry.name );

            try {
                if ( entry.isDirectory() ) {
                    await scanDir( fullPath );
                } else if ( entry.isFile() && entry.name === "ui-module.ts" ) {
                    const relativePath = path.relative( baseDir, fullPath );

                    // Get module information by importing the module
                    const moduleInfo = await getModuleInfo( fullPath );

                    if ( moduleInfo.name ) {
                        // Only add if we successfully got module info
                        files.push( {
                            name: entry.name,
                            path: "/" + relativePath,
                            moduleInfo,
                        } );
                    }
                }
            } catch ( error ) {
                console.error( `Error processing file ${ fullPath }:`, error );
            }
        }
    }

    await scanDir( baseDir );
    return files;
}

async function getModuleInfo( modulePath: string ) {
    try {
        // Import the module using Bun's dynamic import
        const module = await import( modulePath );
        const ModuleClass = module.default;

        if (
            ModuleClass &&
            typeof ModuleClass.getName === "function" &&
            typeof ModuleClass.getAdapters === "function" &&
            typeof ModuleClass.getFlows === "function"
        ) {
            const name = ModuleClass.getName();
            const adapters = ModuleClass.getAdapters().map( ( adapter: any ) => adapter.getName() );
            const flows = ModuleClass.getFlows().map( ( FlowClass: any ) => FlowClass.getName() );

            return { name, adapters, flows };
        }

        throw new Error( "Invalid UI module format" );
    } catch ( error ) {
        console.error( "Error loading module:", error );
        return { name: "", adapters: [], flows: [] };
    }
}
