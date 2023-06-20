import process from "process";

import chalk from "chalk";

import { ObjectBase } from "../bases/object-base";

const DEFAULT_LOG_PREFIX = chalk.blackBright( "⚪ - [LOG]" ),
    DEFAULT_INFO_PREFIX = chalk.blue( "🔵 - [INFO]" ),
    DEFAULT_DEBUG_PREFIX = chalk.grey( "🟤 - [DEBUG]" ),
    DEFAULT_WARN_PREFIX = chalk.yellow( "🟡 - [WARN]" ),
    DEFAULT_ERROR_PREFIX = chalk.red( "🔴 - [ERROR]" ),
    DEFAULT_ADMIN_PREFIX = chalk.yellowBright( "🟣 - [ADMIN]" );

export type ICaller = Function | String;

const registeredNames: any = {};

export class Logger extends ObjectBase {
    private owner: ObjectBase | typeof ObjectBase;

    private messagePrefixes: string[] = [];

    private cachedDate: string;

    public static getName(): string {
        return "Modules/Logger";
    }

    public constructor( owner: ObjectBase | typeof ObjectBase ) {
        super();

        if ( registeredNames[ owner.getName() ] ) {
            throw new Error( `Logger for '${ owner.getName() }' already exists` );
        }

        const iso = new Date().toISOString().match( /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}\.\d{3})/ );

        if ( ! iso ) {
            throw new Error( "Invalid date" );
        }

        this.cachedDate = iso[ 1 ] + " " + iso[ 2 ];

        this.owner = owner;

        if ( process.env.DISABLE_LOGGER_PREVIOUS_SOURCE && "true" === process.env.DISABLE_LOGGER_PREVIOUS_SOURCE ) {
            this.getPreviousSource = () => "";
        }

        if ( process.env.DISABLE_LOGGER && "true" === process.env.DISABLE_LOGGER ) {
            this.log = () => {};
            this.info = () => {};
            this.debug = () => {};
            this.warn = () => {};
            this.error = () => {};
            this.admin = () => {};
        }
    }

    public addMessagePrefix( prefix: string ) {
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

    public admin( caller: ICaller, message: string, ... params: any[] ): void {
        this.output( DEFAULT_ADMIN_PREFIX, caller, message, ... params );
    }

    public beep() {
        console.log( "\x07" );
    }

    private getTime(): string {
        return this.cachedDate;
    }

    private getCallerName( caller: ICaller ): string {
        if ( typeof caller === "string" ) {
            return caller;
        } else if ( typeof caller === "function" ) {
            return caller.name;
        }

        console.error( "Invalid Caller", new Error().stack );

        return "_CALLER_UNKNOWN_";
    }

    private getStackTrace(): any[] {
        const stackTrace = (new Error().stack || "").split("\n");
        const stackLines = stackTrace.slice(1); // Skip the first line containing "Error"

        const stackRegex = / at (.+?) \((.+?)\)/;
        const result = [];

        for (let i = 0; i < stackLines.length; i++) {
            const line = stackLines[i];
            const match = line.match(stackRegex);

            if (match) {
                const [, context, file] = match;
                const parsedLine: any = { context, file };

                if (line.startsWith("new")) {
                    parsedLine.isNew = true;
                    parsedLine.object = context.split(" ")[1];
                } else if (context !== "Object.<anonymous>") {
                    parsedLine.object = context;
                }

                result.push(parsedLine);
            }
        }

        return result;
    }

    public getPreviousSource(): string {
        // TODO: Take those from env.
        const stack = this.getStackTrace()
            .filter( ( line: any ) => line.file.includes( "/src/" ) )
            .filter( ( line: any ) => ! line.file.includes( "logger.ts" ) )
            .filter( ( line: any ) => ! line.file.includes( "debugger.ts" ) )
            .filter( ( line: any ) => ! line.file.includes( "/node_modules/" ) );

        let previousSource = "";

        const previousCaller = stack[ 1 ]?.object?.split( "." );

        if ( previousCaller?.length > 1 ) {
            const previousCallerName = previousCaller[ 0 ],
                previousCallerMethod = previousCaller[ 1 ];

            // Extract file name from file path.
            // const previousCallerFileName = stack[ 1 ].file.split( "/" ).pop();

            previousSource = ( `${ previousCallerName }::${ previousCallerMethod }]` ) + "[";
        }

        return previousSource;
    }

    private output( prefix: string, caller: ICaller, message: string, ... params: any[] ): void {
        const source = this.getPreviousSource() + chalk.whiteBright( this.owner.getName() + "::" + this.getCallerName( caller ) );

        let messagePrefix = "";

        if ( this.messagePrefixes.length ) {
            messagePrefix = `[${ this.messagePrefixes.join( "][" ) }]`;
        }

        const output = `${ prefix }[${ this.getTime() }][${ source }]${ messagePrefix + ": " + message }`;

        console.log( output, params?.length ? params : "" );
    }

}

export default Logger;
