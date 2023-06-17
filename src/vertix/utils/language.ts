import fs from "fs";
import path from "path";

import { EmbedLanguageModel } from "@vertix/models/embed-language-model";
import { ElementButtonLanguageModel } from "@vertix/models/element-button-language-model";
import { ElementTextInputLanguageModel } from "@vertix/models/element-text-input-language-model";
import { ElementSelectMenuLanguageModel } from "@vertix/models/element-select-menu-language-model";
import { MarkdownLanguageModel } from "@vertix/models/markdown-language-model";

import { ModalLanguageModel } from "@vertix/models/modal-language-model";

import { UI_LANGUAGES_PATH, UILanguageJSON } from "@vertix/ui-v2/_base/ui-language-definitions";

import { InitializeBase } from "@internal/bases/initialize-base";

export class LanguageUtils extends InitializeBase {
    private static instance: LanguageUtils;

    public static getName(): string {
        return "Vertix/Utils/LanguageUtils";
    }

    public static getInstance(): LanguageUtils {
        if ( ! LanguageUtils.instance ) {
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
        if ( ! fs.existsSync( filePath ) ) {
            throw new Error( `Path: '${ filePath }' does not exist` );
        }
    }

    public async import( object: UILanguageJSON ) {
        this.logger.info( this.import, `Trying importing language with code: '${ object.code }'` );

        const Models = [
                ElementButtonLanguageModel,
                ElementTextInputLanguageModel,
                ElementSelectMenuLanguageModel,
                EmbedLanguageModel,
                MarkdownLanguageModel,
                ModalLanguageModel,
            ],
            objects = [
                object.elements.buttons,
                object.elements.textInputs,
                object.elements.selectMenus,
                object.embeds,
                object.markdowns,
                object.modals,
            ];

        await Promise.all( Models.map( async ( Model, index ) => {
            const currentObject = objects[ index ],
                count = await Model.$.getCount( object.code );

            if ( currentObject.length !== count ) {
                if ( 0 === count ) {
                    this.logger.log( this.import, `Importing from scratch language with code: '${ object.code }' model: '${ Model.getName() }'` );

                    // TODO: Remove redundant code.
                    for ( const entity of currentObject ) {
                        await Model.$.create(
                            entity.name,
                            object.code,
                            object.name,
                            entity.content
                        );
                    }

                    return;
                }

                this.logger.log( this.import, `Updating language with code: '${ object.code }' model: '${ Model.getName }'` );

                for ( const entity of currentObject ) {
                    // Check if entity exists.
                    const record = await Model.$.get(
                        entity.name,
                        object.code,
                        false
                    );

                    if ( ! record ) {
                        await Model.$.create(
                            entity.name,
                            object.code,
                            object.name,
                            entity.content
                        );
                    }
                }
            }
        } ) );
    }
}
