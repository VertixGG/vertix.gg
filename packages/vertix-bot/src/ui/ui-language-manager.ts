import fs from "fs";

import path from "path";

import { ErrorWithMetadata } from "@vertix.gg/base/src/errors/index";

import { diff } from "jest-diff";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ComponentType } from "discord.js";

import { UnknownElementTypeError } from "@vertix.gg/gui/src/bases/errors/unknown-element-type-error";

import { UI_ELEMENTS_DEPTH } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    UI_LANGUAGES_FILE_EXTENSION,
    UI_LANGUAGES_INITIAL_ATTRIBUTES,
    UI_LANGUAGES_INITIAL_CODE,
    UI_LANGUAGES_INITIAL_FILE_NAME,
    UI_LANGUAGES_INITIAL_FILE_PATH,
    UI_LANGUAGES_PATH
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import { ElementButtonLanguageModel } from "@vertix.gg/bot/src/models/element-button-language-model";

import { ElementSelectMenuLanguageModel } from "@vertix.gg/bot/src/models/element-select-menu-language-model";

import { ElementTextInputLanguageModel } from "@vertix.gg/bot/src/models/element-text-input-language-model";

import { EmbedLanguageModel } from "@vertix.gg/bot/src/models/embed-language-model";

import { MarkdownLanguageModel } from "@vertix.gg/bot/src/models/markdown-language-model";

import { ModalLanguageModel } from "@vertix.gg/bot/src/models/modal-language-model";

import { LanguageUtils } from "@vertix.gg/bot/src/utils/language";

import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";

import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type {
    UIComponentTypeConstructor,
    UIEmbedConstructor,
    UIEntityConstructor,
    UIEntityTypes,
    UIMarkdownConstructor,
    UIModalConstructor
} from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type {
    UIElementButtonLanguage,
    UIElementButtonLanguageContent,
    UIElementSelectMenuLanguage,
    UIElementSelectMenuLanguageContent,
    UIElementTextInputLanguage,
    UIElementTextInputLanguageContent,
    UIEmbedLanguage,
    UIEmbedLanguageContent,
    UILanguageJSON,
    UIMarkdownLanguage,
    UIMarkdownLanguageContent,
    UIModalLanguage,
    UIModalLanguageContent
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import type { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import type { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import type { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";
import type { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import type { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";

interface UILanguageManagerValidateOptions {
    skipSameValues?: boolean;
}

// TODO: Reduce repeated code.
export class UILanguageManager extends InitializeBase implements UILanguageManagerInterface {
    private static instance: UILanguageManager;

    private uiService: UIService;

    private uiAvailableLanguages = new Map<string, UILanguageJSON>();

    private uiInitialLanguage!: UILanguageJSON;

    public static getName() {
        return "Vertix/UI-V2/LanguageManager";
    }

    public static getInstance() {
        if ( ! UILanguageManager.instance ) {
            UILanguageManager.instance = new UILanguageManager();
        }

        return UILanguageManager.instance;
    }

    public static get $() {
        return UILanguageManager.getInstance();
    }

    public constructor() {
        super();

        this.uiService = ServiceLocator.$.get( "VertixGUI/UIService" );
    }

    public getAvailableLanguages() {
        return this.uiAvailableLanguages;
    }

    public getInitialLanguage() {
        return this.uiInitialLanguage;
    }

    public async getButtonTranslatedContent( button: UIElementButtonBase, languageCode: string | undefined ): Promise<UIElementButtonLanguageContent> {
        if ( ! languageCode || UI_LANGUAGES_INITIAL_CODE === languageCode ) {
            return button.getTranslatableContent();
        }

        const buttonLanguage = await ElementButtonLanguageModel.$.get( button.getName(), languageCode );

        if ( ! buttonLanguage ) {
            this.logger.error( this.getButtonTranslatedContent,
                `Button language not found: '${ button.getName() }' - Language: '${ languageCode }'`
            );
            return button.getTranslatableContent();
        }

        return {
            label: buttonLanguage.content.label,
            options: buttonLanguage.content.options as any, // TODO: Not well.
        };
    }

    public async getSelectMenuTranslatedContent( selectMenu: UIElementStringSelectMenu | UIElementUserSelectMenu | UIElementRoleSelectMenu | UIElementChannelSelectMenu, languageCode: string | undefined ): Promise<UIElementSelectMenuLanguageContent> {
        if ( ! languageCode || UI_LANGUAGES_INITIAL_CODE === languageCode ) {
            return selectMenu.getTranslatableContent();
        }

        const selectMenuLanguage = await ElementSelectMenuLanguageModel.$.get( selectMenu.getName(), languageCode );

        if ( ! selectMenuLanguage ) {
            this.logger.error( this.getSelectMenuTranslatedContent,
                `Select menu language not found: '${ selectMenu.getName() }' - Language: '${ languageCode }'`
            );
            return selectMenu.getTranslatableContent();
        }

        return {
            placeholder: selectMenuLanguage.content.placeholder || undefined,
            selectOptions: selectMenuLanguage.content.selectOptions as any,
            options: selectMenuLanguage.content.options as any,
        };
    }

    public async getTextInputTranslatedContent( textInput: UIElementInputBase, languageCode: string | undefined ): Promise<UIElementTextInputLanguageContent> {
        if ( ! languageCode || UI_LANGUAGES_INITIAL_CODE === languageCode ) {
            return textInput.getTranslatableContent();
        }

        const textInputLanguage = await ElementTextInputLanguageModel.$.get( textInput.getName(), languageCode );

        if ( ! textInputLanguage ) {
            this.logger.error( this.getTextInputTranslatedContent,
                `Text input language not found: '${ textInput.getName() }' - Language: '${ languageCode }'`
            );
            return textInput.getTranslatableContent();
        }

        return {
            label: textInputLanguage.content.label,
            placeholder: textInputLanguage.content.placeholder || undefined,
        };
    }

    public async getEmbedTranslatedContent( embed: UIEmbedBase, languageCode: string | undefined ): Promise<UIEmbedLanguageContent> {
        if ( ! languageCode || UI_LANGUAGES_INITIAL_CODE === languageCode ) {
            return embed.getTranslatableContent();
        }

        const embedLanguage = await EmbedLanguageModel.$.get( embed.getName(), languageCode );

        if ( ! embedLanguage ) {
            this.logger.error( this.getEmbedTranslatedContent,
                `Embed language not found: '${ embed.getName() }' - Language: '${ languageCode }'`
            );
            return embed.getTranslatableContent();
        }

        return {
            title: embedLanguage.content.title || undefined,
            description: embedLanguage.content.description || undefined,
            footer: embedLanguage.content.footer || undefined,
            options: embedLanguage.content.options as any,
            arrayOptions: embedLanguage.content.arrayOptions as any,
        };
    }

    public async getMarkdownTranslatedContent( markdown: UIMarkdownBase, languageCode: string | undefined ): Promise<UIMarkdownLanguageContent> {
        if ( ! languageCode || UI_LANGUAGES_INITIAL_CODE === languageCode ) {
            return markdown.getTranslatableContent();
        }

        const markdownLanguage = await MarkdownLanguageModel.$.get( markdown.getName(), languageCode );

        if ( ! markdownLanguage ) {
            this.logger.error( this.getMarkdownTranslatedContent,
                `Markdown language not found: '${ markdown.getName() }' - Language: '${ languageCode }'`
            );
            return markdown.getTranslatableContent();
        }

        return {
            content: markdownLanguage.content.content,
            options: markdownLanguage.content.options as any,
        };
    }

    public async getModalTranslatedContent( modal: UIModalBase, languageCode: string | undefined ): Promise<UIModalLanguageContent> {
        if ( ! languageCode || UI_LANGUAGES_INITIAL_CODE === languageCode ) {
            return modal.getTranslatableContent();
        }

        const modalLanguage = await ModalLanguageModel.$.get( modal.getName(), languageCode );

        if ( ! modalLanguage ) {
            this.logger.error( this.getModalTranslatedContent,
                `Modal language not found: '${ modal.getName() }' - Language: '${ languageCode }'`
            );
            return modal.getTranslatableContent();
        }

        return {
            title: modalLanguage.content.title,
        };
    }

    public async register() {
        const tryImportAvailableLanguages = async () => {
            // Import
            let promises: Promise<void>[] = [];

            this.uiAvailableLanguages.forEach( ( language ) => {
                promises.push( LanguageUtils.$.import( language ) );
            } );

            await Promise.all( promises );
        };

        this.getLanguageFilesPaths().forEach( filePath => {
            // Validate the file content.
            const content = fs.readFileSync( filePath, "utf-8" ),
                currentLanguage = JSON.parse( content ) as UILanguageJSON;

            this.uiAvailableLanguages.set( currentLanguage.code, currentLanguage );
        } );

        // TODO: Use checksum + db checksum to avoid extra validations.
        // TODO: If checksums are the same, load all in initial loading, from disk.
        if ( fs.existsSync( UI_LANGUAGES_INITIAL_FILE_PATH ) ) {
            this.logger.info( this.register, `Initial language code '${ UI_LANGUAGES_INITIAL_CODE }' exists, validating...` );

            this.readInitialLanguage();

            // Load language files.
            await this.validateAvailableLanguages();

            // In case it exist it should be validated against hardcoded entities.
            const entitiesLanguage = await this.extractEntitiesLanguage(),
                sourceOfTruth = {
                    ... UI_LANGUAGES_INITIAL_ATTRIBUTES,
                    ... entitiesLanguage,
                };

            this.validateLanguage( this.getInitialLanguage(), sourceOfTruth, {
                skipSameValues: true,
            } );

            await tryImportAvailableLanguages();

            return;
        }

        // Ensure initial language.
        await this.ensureInitialLanguage();

        // Load language files.
        await this.validateAvailableLanguages();

        await tryImportAvailableLanguages();
    }

    private async ensureInitialLanguage() {
        this.logger.info( this.ensureInitialLanguage, `Initial language code '${ UI_LANGUAGES_INITIAL_CODE }' does not exists, creating...` );

        LanguageUtils.$.export( {
            ... UI_LANGUAGES_INITIAL_ATTRIBUTES,

            ... await this.extractEntitiesLanguage()

        }, UI_LANGUAGES_INITIAL_FILE_PATH );

        // Read initial language file.
        this.readInitialLanguage();

        this.logger.info( this.ensureInitialLanguage, "Initial language code 'en' created." );
    }

    private async validateAvailableLanguages() {
        this.getAvailableLanguages().forEach( currentLanguage => {
            this.validateLanguage( currentLanguage, this.uiInitialLanguage );

            this.uiAvailableLanguages.set( currentLanguage.code, currentLanguage );
        } );
    }

    private validateLanguage( currentLanguage: UILanguageJSON, sourceOfTruth: UILanguageJSON, options: UILanguageManagerValidateOptions = {} ): void {
        const validateElementCount = (elementType: string, currentArray: any[], sourceArray: any[]) => {
            const currentCount = currentArray.length;
            const sourceCount = sourceArray.length;

            if (currentCount !== sourceCount) {
                const message = `Language code: '${currentLanguage.code}' has a different ${elementType} ` +
                    `source count: '${sourceCount}' !== '${currentCount}' diff: \n${ diff( sourceArray, currentArray, {
                        contextLines: 5,
                        expand: false,
                        includeChangeCounts: true,
                    } ) }`;

                throw new Error( message );
            }
        };

        validateElementCount( "buttons", currentLanguage.elements.buttons, sourceOfTruth.elements.buttons );
        validateElementCount( "text inputs", currentLanguage.elements.textInputs, sourceOfTruth.elements.textInputs );
        validateElementCount( "select menus", currentLanguage.elements.selectMenus, sourceOfTruth.elements.selectMenus );
        validateElementCount( "embeds", currentLanguage.embeds, sourceOfTruth.embeds );
        validateElementCount( "markdowns", currentLanguage.markdowns, sourceOfTruth.markdowns );
        validateElementCount( "modals", currentLanguage.modals, sourceOfTruth.modals );

        this.validateElementsLanguage( currentLanguage, sourceOfTruth, options );
        this.validateEmbedsLanguage( currentLanguage, sourceOfTruth, options );
        this.validateMarkdownsLanguage( currentLanguage, sourceOfTruth, options );
        this.validateModalsLanguage( currentLanguage, sourceOfTruth, options );
    }

    private async extractEntitiesLanguage() {
        const allComponents: UIComponentTypeConstructor[] = [];

        ( this.uiService.getAll() ).forEach( ( adapter ) => {
            const AdapterType = adapter as typeof UIAdapterBase;

            // TEMP:
            // Remove?
            if ( AdapterType.getName().includes( "UI-V3" ) ) {
                return;
            }

            if ( ! AdapterType.isMultiLanguage() ) {
                this.logger.log( this.ensureInitialLanguage,
                    `Adapter with name: '${ AdapterType.getName() }' is not multilanguage, skipping...`
                );
                return;
            }

            // Check if component is already exist.
            if ( allComponents.find( ( c ) => c.getName() === AdapterType.getComponent().getName() ) ) {
                this.logger.log( this.ensureInitialLanguage,
                    `Component with name: '${ AdapterType.getComponent().getName() }' already exists, skipping...`
                );
                return;
            }

            allComponents.push( AdapterType.getComponent() );
        } );

        // TODO: Create utils for handling entities, use them where possible.
        const allEntities: ( UIEntityTypes & UIEntityConstructor ) = [];

        allComponents.forEach( ( component ) => {
            const entities = component.getEntities();

            // Ensure entities not already exist.
            entities.forEach( ( entity ) => {
                if ( allEntities.find( ( e ) => e.getName() === entity.getName() ) ) {
                    this.logger.warn( this.ensureInitialLanguage,
                        `Entity with name: '${ entity.getName() }' already exists, skipping...`
                    );
                    return;
                }

                allEntities.push( entity );
            } );
        } );

        // Filter all embeds from entities.
        const allElements = allEntities.filter( ( entity ) => "element" === entity.getType() ),
            allEmbeds = allEntities.filter( ( entity ) => "embed" === entity.getType() ),
            allMarkdowns = allEntities.filter( ( entity ) => "markdown" === entity.getType() ),
            allModals = allEntities.filter( ( entity ) => "modal" === entity.getType() ),
            allModalsElements = allModals.map( ( modal ) =>
                ( modal as any as typeof UIModalBase ).getInputElements()
            );

        const elementsLanguage = await this.extractElementsLanguage(
                [ ... allElements, ... allModalsElements.flat( UI_ELEMENTS_DEPTH ) ] as any
            ), embedsLanguage = await this.extractEmbedsLanguage( allEmbeds as any ),
            markdownsLanguage = await this.extractMarkdownLanguage( allMarkdowns as any ),
            modalsLanguage = await this.extractModalsLanguage( allModals as any );

        return {
            elements: {
                buttons: elementsLanguage.buttons.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
                textInputs: elementsLanguage.textInputs.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
                selectMenus: elementsLanguage.selectMenus.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
            },
            embeds: embedsLanguage.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
            markdowns: markdownsLanguage.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
            modals: modalsLanguage.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
        };
    }

    private async extractElementsLanguage( elements: { new(): UIElementBase<any> }[] | typeof UIElementBase [] ) {
        const buttons: UIElementButtonLanguage[] = [],
            textInputs: UIElementTextInputLanguage[] = [],
            selectMenus: UIElementSelectMenuLanguage[] = [];

        for ( const Element of elements ) {
            const ElementConstructor = Element as { new(): UIElementBase<any> },
                element = new ElementConstructor();

            switch ( ( Element as typeof UIElementBase ).getComponentType() ) {
                case ComponentType.Button:
                    buttons.push( {
                        name: element.getName(),
                        content: await element.getTranslatableContent(),
                    } );
                    break;

                case ComponentType.TextInput:
                    const content = await element.getTranslatableContent();

                    if ( ! Object.keys( content ).length ) {
                        break;
                    }

                    textInputs.push( {
                        name: element.getName(),
                        content
                    } );
                    break;

                case ComponentType.StringSelect:
                case ComponentType.UserSelect:
                case ComponentType.RoleSelect:
                case ComponentType.ChannelSelect:
                    selectMenus.push( {
                        name: element.getName(),
                        content: await element.getTranslatableContent(),
                    } );
                    break;

                default:
                    throw new UnknownElementTypeError( await element.build() );
            }
        }

        return {
            buttons,
            textInputs,
            selectMenus,
        };
    }

    private async extractEmbedsLanguage( embeds: UIEmbedConstructor ): Promise<UIEmbedLanguage[]> {
        const result: UIEmbedLanguage[] = [];

        for ( const Embed of embeds ) {
            const embed = new Embed(),
                data = await embed.getTranslatableContent();

            // Avoid embeds with the same name + warn.
            if ( result.find( ( e: any ) => e.name === embed.getName() ) ) {
                this.logger.warn( this.ensureInitialLanguage,
                    `Embed with name: '${ embed.getName() }' already exists, skipping...`
                );
                continue;
            }

            result.push( {
                name: embed.getName(),
                content: data,
            } );
        }

        return result;
    }

    private async extractMarkdownLanguage( markdowns: UIMarkdownConstructor ) {
        const result: UIMarkdownLanguage[] = [];

        for ( const Markdown of markdowns ) {
            const markdown = new Markdown(),
                data = await markdown.getTranslatableContent();

            // Avoid markdowns with the same name + warn.
            if ( result.find( ( m: any ) => m.name === markdown.getName() ) ) {
                this.logger.warn( this.ensureInitialLanguage,
                    `Markdown with name: '${ markdown.getName() }' already exists, skipping...`
                );
                continue;
            }

            result.push( {
                name: markdown.getName(),
                content: data,
            } );
        }

        return result;
    }

    private async extractModalsLanguage( modals: UIModalConstructor ) {
        const result: UIModalLanguage[] = [];

        for ( const Modal of modals ) {
            const modal = new Modal();

            // Avoid modals with the same name + warn.
            if ( result.find( ( m: any ) => m.name === modal.getName() ) ) {
                this.logger.warn( this.ensureInitialLanguage,
                    `Modal with name: '${ modal.getName() }' already exists, skipping...`
                );
                continue;
            }

            result.push( {
                name: modal.getName(),

                content: await modal.getTranslatableContent(),
            } );
        }

        return result;
    }

    private validateElements<T extends { name: string, content: any }>(
        currentLanguage: UILanguageJSON,
        currentElements: T[],
        initialElements: T[],
        elementName: string,
        options: UILanguageManagerValidateOptions
    ) {
        for ( const initialElement of initialElements ) {
            const currentElement = currentElements.find( ( e ) => e.name === initialElement.name );
            if ( ! currentElement ) {
                throw new Error( `Language code: '${ currentLanguage.code }' does not have ${ elementName } with name: '${ initialElement.name }', if it's changed you have to update language in files and DB` );
            }

            if ( elementName === "button" || elementName === "textInput" ) {
                const validLabel = this.validateString( initialElement.content.label, currentElement.content.label, options );
                if ( validLabel !== "valid" ) {
                    throw new Error( `Language code: '${ currentLanguage.code }' ${ elementName } with name: '${ initialElement.name }' has invalid attribute: 'label' code: '${ validLabel }'.` );
                }
            }

            if ( elementName === "textInput" || elementName === "selectMenu" || elementName === "embed" ) {
                const validPlaceholder = this.validateString( initialElement.content.placeholder, currentElement.content.placeholder, {
                    ... options,
                    skipSameValues: true,
                } );
                if ( validPlaceholder !== "valid" ) {
                    throw new ErrorWithMetadata(
                        `Language code: '${ currentLanguage.code }' ${ elementName } with name: ` +
                        `'${ initialElement.name }' has invalid attribute: 'placeholder' code: '${ validPlaceholder }'`, {
                            initial: initialElement.content.placeholder,
                            current: currentElement.content.placeholder,
                        }
                    );
                }
            }

            if ( elementName === "embed" || elementName === "markdown" ) {
                const validContent = this.validateString( initialElement.content.content, currentElement.content.content, options );
                if ( validContent !== "valid" ) {
                    throw new Error(
                        `Language code: '${ currentLanguage.code }' ${ elementName } with name: `+
                        `'${ initialElement.name }' has invalid content, code: '${ validContent }'.`
                    );
                }
            }

            const initialOptionsLength = Object.keys( initialElement.content.options || {} ).length;
            const currentOptionsLength = Object.keys( currentElement.content.options || {} ).length;

            if ( initialOptionsLength !== currentOptionsLength ) {
                throw new Error( `Language code: '${ currentLanguage.code }' ${ elementName } with name: '${ initialElement.name }' has different options count - '${ initialOptionsLength }' !== '${ currentOptionsLength }'.` );
            }

            if ( elementName === "embed" && typeof initialElement.content.arrayOptions === "object" ) {
                const initialKeys = JSON.stringify( this.getKeysRecursive( initialElement.content.arrayOptions ) );
                const keys = JSON.stringify( this.getKeysRecursive( currentElement.content.arrayOptions ) );
                if ( initialKeys !== keys ) {
                    throw new Error( `Language code: '${ currentLanguage.code }' embed with name: '${ initialElement.name }' has different array options keys` );
                }
            }

            if ( ! options.skipSameValues && initialElement.content.options && currentElement.content.options ) {
                const initialOptions = JSON.stringify( initialElement.content.options );
                const currentOptions = JSON.stringify( currentElement.content.options );
                if ( "{}" !== initialOptions && "{}" !== currentOptions && initialOptions === currentOptions ) {
                    throw new Error( `Language code: '${ currentLanguage.code }' ${ elementName } with name: '${ initialElement.name }' has the same options as initial language.` );
                }
            }
        }
    }

    private validateElementsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        this.validateElements( currentLanguage, currentLanguage.elements.buttons, initialLanguage.elements.buttons, "button", options );
        this.validateElements( currentLanguage, currentLanguage.elements.textInputs, initialLanguage.elements.textInputs, "textInput", options );
        this.validateElements( currentLanguage, currentLanguage.elements.selectMenus, initialLanguage.elements.selectMenus, "selectMenu", options );
    }

    private validateEmbedsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        this.validateElements( currentLanguage, currentLanguage.embeds, initialLanguage.embeds, "embed", options );
    }

    private validateMarkdownsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        this.validateElements( currentLanguage, currentLanguage.markdowns, initialLanguage.markdowns, "markdown", options );
    }

    private validateModalsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        this.validateElements( currentLanguage, currentLanguage.modals, initialLanguage.modals, "modal", options );
    }

    private validateString( initial?: string, current?: string, options?: UILanguageManagerValidateOptions ): "valid" | "current-leaking" | "same" {
        if ( ! initial && ! current ) {
            return "valid";
        }

        if ( initial && ! current ) {
            return "current-leaking";
        }

        if ( ! options?.skipSameValues && initial === current ) {
            // If both start with { and end with } then it's a variable.
            if ( initial && current && initial.startsWith( "{" ) && initial.endsWith( "}" ) && current.startsWith( "{" ) && current.endsWith( "}" ) ) {
                return "valid";
            }

            return "same";
        }

        return "valid";
    }

    private readInitialLanguage() {
        // Read initial language file.
        const initialLanguage = fs.readFileSync( UI_LANGUAGES_INITIAL_FILE_PATH, "utf-8" );

        this.uiInitialLanguage = JSON.parse( initialLanguage );
    }

    private getLanguageFilesPaths( skipInitial = true ): string[] {
        const result: string[] = [];

        // Get all languages from `assets/embeds-*.json` files.
        const directoryPath = UI_LANGUAGES_PATH,
            files = fs.readdirSync( directoryPath ),
            regexPattern = RegExp( UI_LANGUAGES_FILE_EXTENSION + "$" );

        files.forEach( file => {
            // Skip initial language file.
            if ( skipInitial && UI_LANGUAGES_INITIAL_FILE_NAME === file ) {
                return;
            }

            const filePath = path.join( directoryPath, file );

            // Check if the file name matches the regex pattern.
            if ( regexPattern.test( file ) ) {
                result.push( filePath );
            }
        } );

        return result;
    }

    private getKeysRecursive = ( obj: any ) => {
        let keys: any[] = [];

        for ( let key in obj ) {
            if ( obj.hasOwnProperty( key ) ) {
                keys.push( key );

                if ( typeof obj[ key ] === "object" && obj[ key ] !== null ) {
                    const nestedKeys = this.getKeysRecursive( obj[ key ] );
                    keys = keys.concat( nestedKeys.map( nestedKey => `${ key }.${ nestedKey }` ) );
                }
            }
        }

        return keys;
    };
}
