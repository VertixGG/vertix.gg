import process from "process";

import pc from "picocolors";

import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

const DEFAULT_LOG_PREFIX = pc.white( "⚪ - [LOG]" ),
    DEFAULT_INFO_PREFIX = pc.blue( "🔵 - [INFO]" ),
    DEFAULT_DEBUG_PREFIX = pc.gray( "🟤 - [DEBUG]" ),
    DEFAULT_WARN_PREFIX = pc.yellow( "🟡 - [WARN]" ),
    DEFAULT_ERROR_PREFIX = pc.red( "🔴 - [ERROR]" ),
    DEFAULT_ADMIN_PREFIX = pc.bold( "🟣 - [ADMIN]" );

const DEFAULT_LOG_LEVEL = "5";

export type ICaller = Function | String;

const registeredNames: any = {};

export class Logger extends ObjectBase {
    private static lastLogTime: number = new Date().getTime();

    private readonly ownerName: string;

    private messagePrefixes: string[] = [];

    public static getName(): string {
        return "VertixBase/Modules/Logger";
    }

    public static getLogLevelString(): string {
        switch ( parseInt( process.env.LOGGER_LOG_LEVEL || DEFAULT_LOG_LEVEL ) ) {
            case 0:
                return "NONE";
            case 1:
                return "ERROR";
            case 2:
                return "WARN";
            case 3:
                return "ADMIN";
            case 4:
                return "INFO";
            case 5:
                return "LOG";
            case 6:
                return "DEBUG";
            default:
                return "UNKNOWN";
        }
    }

    public static getLogLevel(): number {
        return parseInt( process.env.LOGGER_LOG_LEVEL || DEFAULT_LOG_LEVEL );
    }

    public static isDebugEnabled() {
        return this.getLogLevel() >= 6;
    }

    public constructor( owner: ObjectBase | typeof ObjectBase | string ) {
        super();

        if ( "string" === typeof owner ) {
            this.ownerName = owner;
        } else {
            this.ownerName = owner.getName();
        }

        if ( registeredNames[ this.ownerName ] ) {
            throw new Error( `Logger for '${ this.ownerName }' already exists` );
        }

        if ( process.env.LOGGER_DISABLED && "true" === process.env.DISABLE_LOGGER ) {
            this.error = () => {};
            this.warn = () => {};
            this.admin = () => {};
            this.info = () => {};
            this.log = () => {};
            this.debug = () => {};

            return;
        }

        if ( process.env.LOGGER_LOG_PREVIOUS_CALLER_SOURCE_DISABLED && "true" === process.env.LOGGER_LOG_PREVIOUS_CALLER_SOURCE_DISABLED ) {
            this.getPreviousSource = () => "";
        }

        // noinspection FallThroughInSwitchStatementJS
        switch ( Logger.getLogLevel() ) {
            case 0:
                this.error = () => {};
            case 1:
                this.warn = () => {};
            case 2:
                this.admin = () => {};
            case 3:
                this.info = () => {};
            case 4:
                this.log = () => {};
            case 5:
                this.debug = () => {};
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
        const iso = new Date().toISOString().match( /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}\.\d{3})/ );

        if ( ! iso ) {
            return "Invalid Time";
        }

        return iso[ 1 ] + " " + iso[ 2 ];
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
        const source = this.getPreviousSource() + pc.white( this.ownerName + "::" + this.getCallerName( caller ) );

        let messagePrefix = "";

        if ( this.messagePrefixes.length ) {
            messagePrefix = `[${ this.messagePrefixes.join( "][" ) }]`;
        }

        const timeDiff = ( new Date().getTime() - Logger.lastLogTime ).toString().padStart( 4, "0" );

        const output = `${ prefix }[${ this.getTime() }+${ timeDiff }ms][${ source }]${ messagePrefix + ": " + message }`;

        console.log( output, params?.length ? params : "" );

        Logger.lastLogTime = new Date().getTime();
    }

}
