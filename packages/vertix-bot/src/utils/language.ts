import fs from "fs";
import path from "path";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { EmbedLanguageModel } from "@vertix.gg/bot/src/models/embed-language-model";
import { ElementButtonLanguageModel } from "@vertix.gg/bot/src/models/element-button-language-model";
import { ElementTextInputLanguageModel } from "@vertix.gg/bot/src/models/element-text-input-language-model";
import { ElementSelectMenuLanguageModel } from "@vertix.gg/bot/src/models/element-select-menu-language-model";
import { MarkdownLanguageModel } from "@vertix.gg/bot/src/models/markdown-language-model";

import { ModalLanguageModel } from "@vertix.gg/bot/src/models/modal-language-model";

import { UI_LANGUAGES_PATH } from "@vertix.gg/bot/src/ui-v2/_base/ui-language-definitions";

import type { UILanguageJSON } from "@vertix.gg/bot/src/ui-v2/_base/ui-language-definitions";

export class LanguageUtils extends InitializeBase {
    private static instance: LanguageUtils;

    public static getName(): string {
        return "VertixBot/Utils/LanguageUtils";
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
                    this.logger.info( this.import, `Importing from scratch language with code: '${ object.code }' model: '${ Model.getName() }'` );

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

                this.logger.info( this.import, `Updating language with code: '${ object.code }' model: '${ Model.getName() }'` );

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
