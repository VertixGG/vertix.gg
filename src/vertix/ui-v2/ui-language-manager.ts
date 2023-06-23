import fs from "fs";
import path from "path";

import { ComponentType } from "discord.js";

import {
    UI_ELEMENTS_DEPTH,
    UIComponentTypeConstructor,
    UIEmbedConstructor,
    UIEntityConstructor,
    UIEntityTypes,
    UIMarkdownConstructor,
    UIModalConstructor,
} from "@vertix/ui-v2/_base/ui-definitions";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";
import { UIElementBase } from "@vertix/ui-v2/_base/ui-element-base";
import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIElementStringSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-string-select-menu";
import { UIElementInputBase } from "@vertix/ui-v2/_base/elements/ui-element-input-base";
import { UIElementUserSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-user-select-menu";
import { UIElementRoleSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-role-select-menu";
import { UIElementChannelSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-channel-select-menu";
import { UIMarkdownBase } from "@vertix/ui-v2/_base/ui-markdown-base";
import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";

import { UnknownElementTypeError } from "@vertix/ui-v2/_base/errors/unknown-element-type-error";

import { ElementButtonLanguageModel } from "@vertix/models/element-button-language-model";
import { ElementSelectMenuLanguageModel } from "@vertix/models/element-select-menu-language-model";
import { ElementTextInputLanguageModel } from "@vertix/models/element-text-input-language-model";
import { EmbedLanguageModel } from "@vertix/models/embed-language-model";
import { MarkdownLanguageModel } from "@vertix/models/markdown-language-model";
import { ModalLanguageModel } from "@vertix/models/modal-language-model";

import { LanguageUtils } from "@vertix/utils/language";

import {
    UI_LANGUAGES_FILE_EXTENSION,
    UI_LANGUAGES_INITIAL_ATTRIBUTES,
    UI_LANGUAGES_INITIAL_CODE,
    UI_LANGUAGES_INITIAL_FILE_NAME,
    UI_LANGUAGES_INITIAL_FILE_PATH,
    UI_LANGUAGES_PATH,
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
} from "@vertix/ui-v2/_base/ui-language-definitions";

import { InitializeBase } from "@internal/bases/initialize-base";

interface UILanguageManagerValidateOptions {
    skipSameValues?: boolean;
}

// TODO: Reduce repeated code.
export class UILanguageManager extends InitializeBase {
    private static instance: UILanguageManager;

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

    private validateLanguage( currentLanguage: UILanguageJSON, sourceOfTruth: UILanguageJSON, options: UILanguageManagerValidateOptions = {} ) {
        // Validate elements counts.
        if ( sourceOfTruth.elements.buttons.length !== currentLanguage.elements.buttons.length ) {
            throw new Error( `Language code: '${ currentLanguage.code }' has different buttons count - '${ sourceOfTruth.elements.buttons.length }' !== '${ currentLanguage.elements.buttons.length }'` );
        }

        if ( sourceOfTruth.elements.textInputs.length !== currentLanguage.elements.textInputs.length ) {
            throw new Error( `Language code: '${ currentLanguage.code }' has different text inputs count - '${ sourceOfTruth.elements.textInputs.length }' !== '${ currentLanguage.elements.textInputs.length }'` );
        }

        if ( sourceOfTruth.elements.selectMenus.length !== currentLanguage.elements.selectMenus.length ) {
            throw new Error( `Language code: '${ currentLanguage.code }' has different select menus count - '${ sourceOfTruth.elements.selectMenus.length }' !== '${ currentLanguage.elements.selectMenus.length }'` );
        }

        // Validate embeds counts.
        if ( sourceOfTruth.embeds.length !== currentLanguage.embeds.length ) {
            throw new Error( `Language code: '${ currentLanguage.code }' has different embeds count - '${ sourceOfTruth.embeds.length }' !== '${ currentLanguage.embeds.length }'` );
        }

        // Validate markdowns counts.
        if ( sourceOfTruth.markdowns.length !== currentLanguage.markdowns.length ) {
            throw new Error( `Language code: '${ currentLanguage.code }' has different markdowns count - '${ sourceOfTruth.markdowns.length }' !== '${ currentLanguage.markdowns.length }'` );
        }

        // Validate modals counts.
        if ( sourceOfTruth.modals.length !== currentLanguage.modals.length ) {
            throw new Error( `Language code: '${ currentLanguage.code }' has different modals count - '${ sourceOfTruth.modals.length }' !== '${ currentLanguage.modals.length }'` );
        }

        this.validateElementsLanguage( currentLanguage, sourceOfTruth, options );
        this.validateEmbedsLanguage( currentLanguage, sourceOfTruth, options );
        this.validateMarkdownsLanguage( currentLanguage, sourceOfTruth, options );
        this.validateMarkdownsLanguage( currentLanguage, sourceOfTruth, options );
        this.validateModalsLanguage( currentLanguage, sourceOfTruth, options );
    }

    private async extractEntitiesLanguage() {
        const allComponents: UIComponentTypeConstructor[] = [];

        ( UIAdapterManager.$.getAll() ).forEach( ( adapter ) => {
            const AdapterType = adapter as typeof UIAdapterBase;

            // TODO Temporary - Skip feedback adapter by name.
            if ( AdapterType.getName() === "Vertix/UI-V2/FeedbackAdapter" ) {
                return;
            }

            // Check if component is already exist.
            if ( allComponents.find( ( c ) => c.getName() === AdapterType.getComponent().getName() ) ) {
                this.logger.warn( this.ensureInitialLanguage,
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
            markdowns: markdownsLanguage.sort( ( a, b ) => a.name.localeCompare( b.name )),
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

                case ComponentType.SelectMenu:
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

    private validateElementsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        for ( const button of initialLanguage.elements.buttons ) {
            const currentTestedButton = currentLanguage.elements.buttons.find( ( e: any ) => e.name === button.name );

            if ( ! currentTestedButton ) {
                throw new Error( `Language code: '${ currentLanguage.code }' does not have button with name: '${ button.name }', if its changed you have to update language in files and db` );
            }

            const validLabel = this.validateString( button.content.label, currentTestedButton.content.label, options );

            if ( validLabel !== "valid" ) {
                throw new Error( `Language code: '${ currentLanguage.code }' button with name: '${ button.name }' has invalid attribute: 'label' code: '${ validLabel }'.` );
            }

            // Check options length.
            if ( Object.keys( button.content.options || {} ).length !== Object.keys( currentTestedButton.content.options || {} ).length ) {
                throw new Error( `Language code: '${ currentLanguage.code }' button with name: '${ button.name }' has different options count - '${ JSON.stringify( button.content.options ) }' !== '${ JSON.stringify( currentTestedButton.content.options ) }'.` );
            }
        }

        for ( const textInput of initialLanguage.elements.textInputs ) {
            const currentTestedTextInput = currentLanguage.elements.textInputs.find( ( e: any ) => e.name === textInput.name );

            if ( ! currentTestedTextInput ) {
                throw new Error( `Language code: '${ currentLanguage.code }' does not have text input with name: '${ textInput.name }', if its changed you have to update language in files and db` );
            }

            const validLabel = this.validateString( textInput.content.label, currentTestedTextInput.content.label, options ),
                validPlaceHolder = this.validateString( textInput.content.placeholder, currentTestedTextInput.content.placeholder, {
                    ... options,
                    // Avoid checking same values for placeholder.
                    skipSameValues: true,
                } );

            if ( validLabel !== "valid" ) {
                throw new Error( `Language code: '${ currentLanguage.code }' text input with name: '${ textInput.name }' has invalid attribute: 'label' code: '${ validLabel }'.` );
            }

            if ( validPlaceHolder !== "valid" ) {
                throw new Error( `Language code: '${ currentLanguage.code }' text input with name: '${ textInput.name }' has invalid attribute: 'placeholder' code: '${ validPlaceHolder }'.` );
            }
        }

        for ( const selectMenu of initialLanguage.elements.selectMenus ) {
            const currentTestedSelectMenu = currentLanguage.elements.selectMenus.find( ( e: any ) => e.name === selectMenu.name );

            if ( ! currentTestedSelectMenu ) {
                throw new Error( `Language code: '${ currentLanguage.code }' does not have select menu with name: '${ selectMenu.name }', if its changed you have to update language in files and db` );
            }

            // Validate placeholder.
            const validPlaceHolder = this.validateString( selectMenu.content.placeholder, currentTestedSelectMenu.content.placeholder, options );

            if ( validPlaceHolder !== "valid" ) {
                throw new Error( `Language code: '${ currentLanguage.code }' select menu with name: '${ selectMenu.name }' has invalid attribute: 'placeholder' code: '${ validPlaceHolder }'.` );
            }

            // Validate selectOptions counts.
            const a = Object.keys( selectMenu.content.selectOptions || { a: true } ).length,
                b = Object.keys( currentTestedSelectMenu.content.selectOptions || { b: true } ).length;

            if ( a !== b ) {
                throw new Error( `Language code: '${ currentLanguage.code }' select menu with name: '${ selectMenu.name }' has different options count: '${ a } != ${ b }'` );
            }
        }
    }

    private validateEmbedsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        for ( const embed of initialLanguage.embeds ) {
            const currentTestedEmbed = currentLanguage.embeds.find( ( e: any ) => e.name === embed.name );

            if ( ! currentTestedEmbed ) {
                throw new Error( `Language code: '${ currentLanguage.code }' does not have embed with name: '${ embed.name }', if its changed you have to update language in files and db` );
            }

            const initialContent = embed.content,
                currentContent = currentTestedEmbed.content;

            const validTitle = this.validateString( initialContent.title, currentContent.title, options ),
                validDescription = this.validateString( initialContent.description, currentContent.description, options );

            if ( validTitle !== "valid" ) {
                throw new Error( `Language code: '${ currentLanguage.code }' embed with name: '${ embed.name }' has invalid attribute: 'title' code: '${ validTitle }'.` );
            }

            if ( validDescription !== "valid" ) {
                throw new Error( `Language code: '${ currentLanguage.code }' embed with name: '${ embed.name }' has invalid attribute: 'description' code: '${ validDescription }'.` );
            }

            // Validate selectOptions counts.
            if ( Object.keys( initialContent.options || { a: true } ).length !== Object.keys( currentContent.options || { a: false } ).length ) {
                throw new Error( `Language code: '${ currentLanguage.code }' embed with name: '${ embed.name }' has different options count` );
            }

            // Ensure not the same as initial.
            if ( ! options.skipSameValues && initialContent.options && currentContent.options ) {
                const initialOptions = JSON.stringify( initialContent.options ),
                    options = JSON.stringify( currentContent.options );

                if ( "{}" !== initialOptions && "{}" !== options && initialOptions === options ) {
                    throw new Error( `Language code: '${ currentLanguage.code }' embed with name: '${ embed.name }' has the same options as initial language.` );
                }
            }

            if ( "object" === typeof initialContent.arrayOptions ) {
                const initialKeys = JSON.stringify( this.getKeysRecursive( initialContent.arrayOptions ) ),
                    keys = JSON.stringify( this.getKeysRecursive( currentContent.arrayOptions ) );

                // Validate array selectOptions keys.
                if ( initialKeys !== keys ) {
                    throw new Error( `Language code: '${ currentLanguage.code }' embed with name: '${ embed.name }' has different array options keys` );
                }
            }
        }
    }

    private validateMarkdownsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        for ( const markdown of initialLanguage.markdowns ) {
            const currentTestedMarkdown = currentLanguage.markdowns.find( ( e: any ) => e.name === markdown.name );

            if ( ! currentTestedMarkdown ) {
                throw new Error( `Language code: '${ currentLanguage.code }' does not have markdown with name: '${ markdown.name }', if its changed you have to update language in files and db` );
            }

            const initialContent = markdown.content,
                currentContent = currentTestedMarkdown.content,
                validContent = this.validateString( initialContent.content, currentContent.content, options );

            if ( validContent !== "valid" ) {
                throw new Error( `Language code: '${ currentLanguage.code }' markdown with name: '${ markdown.name }' has invalid content, code: '${ validContent }'.` );
            }

            // Validate selectOptions counts.
            if ( Object.keys( initialContent.options || { a: true } ).length !== Object.keys( currentContent.options || { a: false } ).length ) {
                throw new Error( `Language code: '${ currentLanguage.code }' markdown with name: '${ markdown.name }' has different options count - '${ Object.keys( initialContent.options || { a: true } ).length }' !== '${ Object.keys( currentContent.options || { a: false } ).length }'` );
            }

            // Ensure not the same as initial.
            if ( initialContent.options && currentContent.options ) {
                const initialOptions = JSON.stringify( initialContent.options ),
                    options = JSON.stringify( currentContent.options );

                if ( "{}" !== initialOptions && "{}" !== options && initialOptions === options ) {
                    throw new Error( `Language code: '${ currentLanguage.code }' markdown with name: '${ markdown.name }' has same options.` );
                }
            }
        }
    }

    private validateModalsLanguage( currentLanguage: UILanguageJSON, initialLanguage: UILanguageJSON, options: UILanguageManagerValidateOptions ) {
        for ( const modal of initialLanguage.modals ) {
            const currentTestedModal = currentLanguage.modals.find( ( e: any ) => e.name === modal.name );

            if ( ! currentTestedModal ) {
                throw new Error( `Language code: '${ currentLanguage.code }' does not have modal with name: '${ modal.name }', if its changed you have to update language in files and db` );
            }

            this.validateString( modal.content.title, currentTestedModal.content.title, options );
        }
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
