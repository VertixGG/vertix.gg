import fs from "fs";
import path from "path";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { UI_LANGUAGES_PATH } from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UILanguageJSON } from "@vertix.gg/gui/src/bases/ui-language-definitions";

export class LanguageUtils extends InitializeBase {
    private static instance: LanguageUtils;

    public static getName(): string {
        return "VertixBot/Utils/LanguageUtils";
    }

    public static getInstance(): LanguageUtils {
        if ( !LanguageUtils.instance ) {
            LanguageUtils.instance = new LanguageUtils();
        }

        return LanguageUtils.instance;
    }

    public static get $() {
        return LanguageUtils.getInstance();
    }

    public export( object: UILanguageJSON, filePath: string ) {
        this.logger.info( this.export, `Exporting language to path: '${ filePath }'` );

        // Ensure path exists.
        fs.mkdirSync( path.resolve( UI_LANGUAGES_PATH ), { recursive: true } );

        fs.writeFileSync( filePath, JSON.stringify( object, null, 4 ) );

        // Check path exists.
        if ( !fs.existsSync( filePath ) ) {
            throw new Error( `Path: '${ filePath }' does not exist` );
        }
    }
}
