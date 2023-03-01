import chalk from "chalk";

import ObjectBase from "../bases/object-base";

const DEFAULT_LOG_PREFIX = chalk.blackBright( "[LOG]" ),
    DEFAULT_INFO_PREFIX = chalk.blue( "[INFO]"),
    DEFAULT_DEBUG_PREFIX = chalk.grey( "[DEBUG]" ),
    DEFAULT_WARN_PREFIX = chalk.yellow( "[WARN]" ),
    DEFAULT_ERROR_PREFIX = chalk.red( "[ERROR]" );

export type ICaller = Function | String;

const registeredNames:any = {};

export default class Logger extends ObjectBase {
    private owner: ObjectBase;

    private messagePrefixes: string[] = [];

    public static getName(): string {
        return "Modules/Logger";
    }

    public constructor( owner: ObjectBase ) {
        super();

        if ( registeredNames[ owner.getName() ] ) {
            throw new Error( `Logger for '${ owner.getName() }' already exists` );
        }

        this.owner = owner;
    }

    public addMessagePrefix( prefix: string) {
        this.messagePrefixes.push( prefix );
    }

    public log( caller: ICaller, message: string, ... params: any[] ): void {
        this.output( DEFAULT_LOG_PREFIX, caller, message, ... params );
    }

    public info( caller: ICaller, message: string, ... params: any[] ): void {
        this.output( DEFAULT_INFO_PREFIX, caller, message, ... params );
    }

    public debug( caller: ICaller, message: string, ... params: any[] ): void {
        this.output( DEFAULT_DEBUG_PREFIX, caller, message, ... params );
    }

    public warn( caller: ICaller, message: string, ... params: any[] ): void {
        this.output( DEFAULT_WARN_PREFIX, caller, message, ... params );
    }

    public error( caller: ICaller, message: string, ... params: any[] ): void {
        this.output( DEFAULT_ERROR_PREFIX, caller, message, ... params );
    }

    private getTime(): string {
        const iso = new Date().toISOString().match( /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/ );

        if ( ! iso ) {
            throw new Error( "Invalid date" );
        }

        return iso[ 1 ] + " " + iso[ 2 ];
    }

    private getCallerName( caller: ICaller ): string {
        if ( typeof caller === "string" ) {
            return caller;
        } else if ( typeof caller === "function" ) {
            return caller.name;
        }

        throw new Error( "Invalid caller" );
    }

    private output( prefix: string, caller: ICaller, message: string, ... params: any[] ): void {
        const source = this.owner.getName() + "::" + this.getCallerName( caller );

        let messagePrefix = "";

        if ( this.messagePrefixes.length ) {
            messagePrefix = `[${ this.messagePrefixes.join( "][" ) }]`;
        }

        const output = `${ prefix }[${ this.getTime() }][${ source }]${ messagePrefix + ": " + message }`;

        console.log( output, params?.length ? params : "" );
    }
}
