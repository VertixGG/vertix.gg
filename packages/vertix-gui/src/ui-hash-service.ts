import fs from "fs";
import crypto from "node:crypto";

import process from "process";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { createDebugger } from "@vertix.gg/base/src/modules/debugger";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UI_MAX_CUSTOM_ID_LENGTH } from "@vertix.gg/gui/src/ui-constants";

import type { Debugger } from "@vertix.gg/base/src/modules/debugger";

const DEFAULT_SAVE_HASHES_DEBOUNCE_DELAY = 10000;

export class UIHashService extends ServiceBase {
    public static HASH_SIGNATURE = "ff9";

    private debugger: Debugger;

    private hashTable: Map<number, Map<string, string>> = new Map();
    private hashTableReverse: Map<number, Map<string, string>> = new Map();

    private hashTablesSaveLength: number = 0;

    private hashSaveTimeout: NodeJS.Timeout | null = null;

    public static getName() {
        return "VertixGUI/UIHashService";
    }

    public static generateHash( input: string, maxLength = UI_MAX_CUSTOM_ID_LENGTH, shouldSign = false ): string {
        const base = crypto
            .createHash( "md5" )
            .update( input )
            .digest( "hex" );

        // 32 * length
        const hash = base.repeat( Math.ceil( maxLength / 32 ) ).slice( 0, maxLength );

        return ( ( shouldSign ? UIHashService.HASH_SIGNATURE : "" ) + hash ).slice( 0, maxLength );
    }

    public constructor() {
        super();

        this.debugger = createDebugger( this, "UI" );

        this.loadTablesFromFile();
    }

    public get $$() {
        return this.constructor as typeof UIHashService;
    }

    public generateId( id: string, separator = UI_CUSTOM_ID_SEPARATOR, maxLength = UI_MAX_CUSTOM_ID_LENGTH, shouldSign = true ): string {
        if ( this.hashTable.has( maxLength ) && this.hashTable.get( maxLength )!.has( id ) ) {
            return this.hashTable.get( maxLength )!.get( id )!;
        }

        this.handleSaveHash();

        const parted = id.split( separator );

        if ( parted.length > 1 ) {
            this.debugger.log(
                this.generateId, "Generating custom id for parted id:", {
                    id,
                    parted,
                    separator,
                    maxLength,
                }
            );

            const totalSeparatorLength = ( parted.length - 1 ) * separator.length;
            const maxLenForPart = Math.floor( ( maxLength - totalSeparatorLength ) / parted.length ),
                hashedParts = parted.map( /* no signature for parts */
                    ( part ) => this.generateId( part, separator, maxLenForPart, false )
                ),
                result = hashedParts.join( separator );

            this.debugger.log(
                this.generateId, "Generated id:", {
                    hashedParts,
                    maxLenForPart,
                    result,
                    resultLen: result.length
                }
            );

            if ( result.length > maxLength ) {
                throw new Error( `Generated id is ${ result.length } characters long, max length: ${ maxLength }` );
            }

            this.setHashTableEntry( id, result, maxLength );
            this.setHashTableReverseEntry( result, id, result.length );

            return result;
        }

        const hash = this.$$.generateHash( id, maxLength, shouldSign );

        if ( this.hashTable.has( maxLength ) && this.hashTable.get( maxLength )!.has( id ) ) {
            return this.hashTable.get( maxLength )!.get( id )!;
        }

        this.setHashTableEntry( id, hash, maxLength );
        this.setHashTableReverseEntry( hash, id, hash.length );

        this.debugger.log(
            this.generateId, `Generated hash id: '${ hash.slice( 0, 32 ) + "..." + hash.slice( hash.length - 4 ) }' for id: '${ id }'`
        );

        return hash;
    }

    public getId( hash: string, separator: string | null = UI_CUSTOM_ID_SEPARATOR, options = {
        silent: false
    } ): string {
        // If hash is not signed, then it's not a hash.
        if ( ! hash.startsWith( UIHashService.HASH_SIGNATURE ) ) {
            if ( ! options.silent ) {
                if ( this.debugger.isEnabled() ) {
                    throw new Error( `Hash: '${ hash }' is not signed` );
                } else {
                    this.logger.error( this.getId, `Hash: '${ hash }' is not signed` );
                }
            }

            return hash;
        }

        const hashedParts = separator ? hash.split( separator ) : [];

        if ( hashedParts.length > 1 ) {
            this.debugger.log(
                this.getId, "Getting id from hashed parts:", hashedParts
            );

            const result = hashedParts.map( ( part ) => this.getId( part, separator ) )
                .join( separator! );

            this.debugger.log(
                this.getId, "Got id:", { hashedParts, result, resultLen: result.length }
            );

            return result;
        }

        const id = this.hashTableReverse.get( hash.length )?.get( hash );

        if ( ! id ) {
            if ( ! options.silent ) {
                if ( this.debugger.isEnabled() ) {
                    throw new Error( `Can't find id for hash: '${ hash }'` );
                } else {
                    this.logger.error( this.getId, `Can't find id for hash: '${ hash }'` );
                }
            }

            return hash;
        }

        return id;
    }

    public getIdSilent( hash: string ) {
        return this.getId( hash, UI_CUSTOM_ID_SEPARATOR, { silent: true } );
    }

    public loadTablesFromFile( filePath = process.cwd() + "/ui-hash-tables.json" ) {
        if ( ! this.isSaveHashEnabled() ) {
            return;
        }

        if ( ! fs.existsSync( filePath ) ) {
            return this.debugger.log( this.loadTablesFromFile, "File not found:", filePath );
        }

        this.debugger.log( this.loadTablesFromFile, "Loading hash tables from file:", filePath );

        const data = JSON.parse( fs.readFileSync( filePath, "utf-8" ) );

        this.hashTable = new Map( data.hashTable.map(
            ( [ length, entries ]: [ number, [ string, string ][] ] ) => [ length, new Map( entries ) ] ) )
        ;
        this.hashTableReverse = new Map( data.hashTableReverse.map( (
            [ length, entries ]: [ number, [ string, string ][] ] ) => [ length, new Map( entries ) ] )
        );

        // Set total size
        this.hashTablesSaveLength = this.getCurrenHashTablesLength();
    }

    public maybeSaveTablesToFile() {
        this.debugger.log( this.maybeSaveTablesToFile, "Checking if hash tables need to be saved to file", {
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
        this.debugger.log( this.saveTablesToFile, "Saving hash tables to file:", filePath );

        const data = {
            hashTable: Array.from(
                this.hashTable.entries() )
                .map(
                    ( [ length, map ] ) => [ length, Array.from( map.entries() ) ]
                ),
            hashTableReverse: Array.from(
                this.hashTableReverse.entries() )
                .map(
                    ( [ length, map ] ) => [ length, Array.from( map.entries() ) ]
                )
        };

        await fs.promises.writeFile( filePath, JSON.stringify( data, null, 2 ) );
    }

    private setHashTableEntry( id: string, hash: string, length: number ) {
        if ( ! this.hashTable.has( length ) ) {
            this.hashTable.set( length, new Map() );
        }
        this.hashTable.get( length )!.set( id, hash );
    }

    private handleSaveHash() {
        if ( this.isSaveHashEnabled() ) {
            if ( this.hashSaveTimeout ) {
                clearTimeout( this.hashSaveTimeout );
            }

            this.hashSaveTimeout = setTimeout( () => {
                this.maybeSaveTablesToFile();
            }, DEFAULT_SAVE_HASHES_DEBOUNCE_DELAY );
        }
    }

    private setHashTableReverseEntry( hash: string, id: string, length: number ) {
        if ( ! this.hashTableReverse.has( length ) ) {
            this.hashTableReverse.set( length, new Map() );
        }
        this.hashTableReverse.get( length )!.set( hash, id );
    }

    private getCurrenHashTablesLength() {
        // For each object in the hash table, get the size of the map and sum them up.
        return Array.from( this.hashTable.values() ).reduce( ( acc, map ) => acc + map.size, 0 ) +
            Array.from( this.hashTableReverse.values() ).reduce( ( acc, map ) => acc + map.size, 0 );
    }

    protected isSaveHashEnabled() {
        return true;
    }
}

export default UIHashService;
