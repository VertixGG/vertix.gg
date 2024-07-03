import fs from "fs";

import process from "process";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { UI_GENERIC_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { uiGenerateCustomIdHash } from "@vertix.gg/gui/src/ui-utils";

import { UI_MAX_CUSTOM_ID_LENGTH } from "@vertix.gg/gui/src/ui-constants";

import type { Client } from "discord.js";

import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type {
    UIElementButtonLanguageContent,
    UIElementSelectMenuLanguageContent,
    UIElementTextInputLanguageContent,
    UIEmbedLanguageContent,
    UIMarkdownLanguageContent,
    UIModalLanguageContent
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";
import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import type { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import type { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import type { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";
import type { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import type { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";
import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

const ADAPTER_CLEANUP_TIMER_INTERVAL = Number( process.env.ADAPTER_CLEANUP_TIMER_INTERVAL ) ||
    300000; // 5 minutes.

const ADAPTER_SAVE_HASHES_DEBOUNCE_DELAY = 10000;

export class UIService extends ServiceBase {
    private static instance: UIService;

    private static cleanupTimerInterval: NodeJS.Timeout;

    private uiLanguageManager: UILanguageManagerInterface | null = null;

    private hashTable: Map<number, Map<string, string>> = new Map();
    private hashTableReverse: Map<number, Map<string, string>> = new Map();

    private hashTablesSaveLength: number = 0;

    private hashSaveTimeout: NodeJS.Timeout | null = null;

    public static getName() {
        return "VertixGUI/UIService";
    }

    // TODO: This method should be removed everywhere.
    // public static getInstance() {
    //     return UIService.instance;
    // }

    protected static setupCleanupTimerInterval() {
        if ( ! UIService.cleanupTimerInterval ) {
            UIService.cleanupTimerInterval = setInterval( UIAdapterBase.cleanupTimer, ADAPTER_CLEANUP_TIMER_INTERVAL );
        }
    }

    public static get $() {
        return UIService.instance;
    }

    public constructor(
        // TODO: Why repeating... why not? Debugger( UIManager.getName(), "", /* check env */ "env" );
        private client: Client<true>,
        private uiDebugger = new Debugger( UIService.getName(), "", isDebugEnabled( "SERVICE", UIService.getName() ) )
    ) {
        super();

        // Try load hash tables from file.
        this.isSaveHashEnabled() && this.loadTablesFromFile();

        ( this.constructor as typeof UIService ).setupCleanupTimerInterval();
    }

    public registerUILanguageManager( uiLanguageManager: UILanguageManagerInterface ) {
        if ( this.uiLanguageManager ) {
            throw new Error( "UI Language Manager is already registered" );
        }

        this.uiLanguageManager = uiLanguageManager;
    }

    public generateCustomIdHash( id: string, separator = UI_GENERIC_SEPARATOR, maxLength = UI_MAX_CUSTOM_ID_LENGTH ): string {
        if ( this.hashTable.has( maxLength ) && this.hashTable.get( maxLength )!.has( id ) ) {
            return this.hashTable.get( maxLength )!.get( id )!;
        }

        if ( this.isSaveHashEnabled() ) {
            if ( this.hashSaveTimeout ) {
                clearTimeout( this.hashSaveTimeout );
            }

            this.hashSaveTimeout = setTimeout( () => {
                this.maybeSaveTablesToFile();
            }, ADAPTER_SAVE_HASHES_DEBOUNCE_DELAY );
        }

        const parted = id.split( separator );

        if ( parted.length > 1 ) {
            this.uiDebugger.log(
                this.generateCustomIdHash, "Generating custom id for parted id:", {
                    id,
                    parted,
                    separator,
                    maxLength,
                }
            );

            const totalSeparatorLength = ( parted.length - 1 ) * separator.length;
            const maxLenForPart = Math.floor( ( maxLength - totalSeparatorLength ) / parted.length ),
                hashedParts = parted.map( ( part ) => this.generateCustomIdHash( part, separator, maxLenForPart ) ),
                result = hashedParts.join( separator );

            this.uiDebugger.log(
                this.generateCustomIdHash, "Generated custom id:", {
                    hashedParts,
                    maxLenForPart,
                    result,
                    resultLen: result.length
                }
            );

            if ( result.length > maxLength ) {
                throw new Error( `Generated custom id is ${ result.length } characters long, max length: ${ maxLength }` );
            }

            this.setHashTableEntry( id, result, maxLength );
            this.setHashTableReverseEntry( result, id, result.length );

            return result;
        }

        const hash = uiGenerateCustomIdHash( id, maxLength );

        if ( this.hashTable.has( maxLength ) && this.hashTable.get( maxLength )!.has( id ) ) {
            return this.hashTable.get( maxLength )!.get( id )!;
        }

        this.setHashTableEntry( id, hash, maxLength );
        this.setHashTableReverseEntry( hash, id, hash.length );

        this.uiDebugger.log(
            this.generateCustomIdHash, `Generated hash id: '${ hash.slice( 0, 32 ) + "..." + hash.slice( hash.length - 4 ) }' for id: '${ id }'`
        );

        return hash;
    }

    public getCustomIdFromHash( hash: string, separator: string | null = UI_GENERIC_SEPARATOR ): string {
        const hashedParts = separator ? hash.split( separator ) : [];

        if ( hashedParts.length > 1 ) {
            this.uiDebugger.log(
                this.getCustomIdFromHash, "Getting custom id from hashed parts:", hashedParts
            );

            const result = hashedParts.map( ( part ) => this.getCustomIdFromHash( part, separator ) )
                .join( separator! );

            this.uiDebugger.log(
                this.getCustomIdFromHash, "Got custom id:", { hashedParts, result, resultLen: result.length }
            );

            return result;
        }

        const id = this.hashTableReverse.get( hash.length )?.get( hash );

        if ( ! id ) {
            if ( this.uiDebugger.isEnabled() ) {
                throw new Error( `Can't find id for hash: '${ hash }'` );
            } else {
                this.logger.error( this.getCustomIdFromHash, `Can't find id for hash: '${ hash }'` );
            }

            return hash;
        }

        return id;
    }

    public getUILanguageManager() {
        return this.uiLanguageManager || new class NullLanguageManager extends InitializeBase implements UILanguageManagerInterface {
            public constructor() {
                super();
            }

            public static getName() {
                return "VertixGUI/NullLanguageManager";
            }

            public getButtonTranslatedContent( button: UIElementButtonBase, _languageCode: string | undefined ): Promise<UIElementButtonLanguageContent> {
                return Promise.resolve( button.getTranslatableContent() );
            }

            public getEmbedTranslatedContent( embed: UIEmbedBase, _languageCode: string | undefined ): Promise<UIEmbedLanguageContent> {
                return Promise.resolve( embed.getTranslatableContent() );
            }

            public getMarkdownTranslatedContent( markdown: UIMarkdownBase, _languageCode: string | undefined ): Promise<UIMarkdownLanguageContent> {
                return Promise.resolve( markdown.getTranslatableContent() );
            }

            public getModalTranslatedContent( modal: UIModalBase, _languageCode: string | undefined ): Promise<UIModalLanguageContent> {
                return Promise.resolve( modal.getTranslatableContent() );
            }

            public getSelectMenuTranslatedContent( selectMenu: UIElementStringSelectMenu | UIElementUserSelectMenu | UIElementRoleSelectMenu | UIElementChannelSelectMenu, _languageCode: string | undefined ): Promise<UIElementSelectMenuLanguageContent> {
                return Promise.resolve( selectMenu.getTranslatableContent() );
            }

            public getTextInputTranslatedContent( textInput: UIElementInputBase, _languageCode: string | undefined ): Promise<UIElementTextInputLanguageContent> {
                return Promise.resolve( textInput.getTranslatableContent() );
            }

            public register(): Promise<void> {
                return Promise.resolve( undefined );
            }
        }();
    }

    public isSaveHashEnabled() {
        return true;
    }

    private setHashTableEntry( id: string, hash: string, length: number ) {
        if ( ! this.hashTable.has( length ) ) {
            this.hashTable.set( length, new Map() );
        }
        this.hashTable.get( length )!.set( id, hash );
    }

    private setHashTableReverseEntry( hash: string, id: string, length: number ) {
        if ( ! this.hashTableReverse.has( length ) ) {
            this.hashTableReverse.set( length, new Map() );
        }
        this.hashTableReverse.get( length )!.set( hash, id );
    }

    public maybeSaveTablesToFile() {
        this.uiDebugger.log( this.maybeSaveTablesToFile, "Checking if hash tables need to be saved to file", {
            old: this.hashTablesSaveLength,
            new: this.getCurrenHashTablesLength()
        } );

        if ( ! this.hashTablesSaveLength ) {
            this.hashTablesSaveLength = this.getCurrenHashTablesLength();

            return this.saveTablesToFile( "ui-hash-tables.json" );
        }

        // Check if hash tables have changed since last save.
        if ( this.getCurrenHashTablesLength() === this.hashTablesSaveLength ) {
            return;
        }

        this.saveTablesToFile().catch( ( error ) => {
            this.logger.error( this.maybeSaveTablesToFile, "", error );
        } );
    }

    public async saveTablesToFile( filePath = process.cwd() + "/ui-hash-tables.json" ) {
        this.uiDebugger.log( this.saveTablesToFile, "Saving hash tables to file:", filePath );

        const data = {
            hashTable: Array.from( this.hashTable.entries() ).map( ( [ length, map ] ) => [ length, Array.from( map.entries() ) ] ),
            hashTableReverse: Array.from( this.hashTableReverse.entries() ).map( ( [ length, map ] ) => [ length, Array.from( map.entries() ) ] )
        };

        await fs.promises.writeFile( filePath, JSON.stringify( data, null, 2 ) );
    }

    public loadTablesFromFile( filePath = process.cwd() + "/ui-hash-tables.json" ) {
        if ( ! fs.existsSync( filePath ) ) {
            return this.uiDebugger.log( this.loadTablesFromFile, "File not found:", filePath );
        }

        this.uiDebugger.log( this.loadTablesFromFile, "Loading hash tables from file:", filePath );

        const data = JSON.parse( fs.readFileSync( filePath, "utf-8" ) );

        this.hashTable = new Map( data.hashTable.map( ( [ length, entries ]: [ number, [ string, string ][] ] ) => [ length, new Map( entries ) ] ) );
        this.hashTableReverse = new Map( data.hashTableReverse.map( ( [ length, entries ]: [ number, [ string, string ][] ] ) => [ length, new Map( entries ) ] ) );

        // Set total size
        this.hashTablesSaveLength = this.getCurrenHashTablesLength();
    }

    private getCurrenHashTablesLength() {
        // For each object in the hash table, get the size of the map and sum them up.
        return Array.from( this.hashTable.values() ).reduce( ( acc, map ) => acc + map.size, 0 ) +
            Array.from( this.hashTableReverse.values() ).reduce( ( acc, map ) => acc + map.size, 0 );
    }
}

export default UIService;
