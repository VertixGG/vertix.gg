import process from "process";

import pc from "picocolors";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

const DEFAULT_LOG_PREFIX = pc.white( "⚪  - [LOG]" ),
    DEFAULT_INFO_PREFIX = pc.blue( "🔵 - [INFO]" ),
    DEFAULT_DEBUG_PREFIX = pc.gray( "🟤 - [DEBUG]" ),
    DEFAULT_WARN_PREFIX = pc.yellow( "🟡 - [WARN]" ),
    DEFAULT_ERROR_PREFIX = pc.red( "🔴 - [ERROR]" ),
    DEFAULT_ADMIN_PREFIX = pc.bold( "🟣 - [ADMIN]" );

const DEFAULT_LOG_LEVEL = "5";

export type ICaller = string | Function;

/**
 * One line of a parsed stack, as this file reads them.
 *
 * `object` and `isNew` are absent on a line that named neither - a bare function rather than a
 * method or a constructor - which is why the caller reaches them optionally.
 */
interface IStackLine {
    context: string;
    file: string;
    object?: string;
    isNew?: boolean;
}

/**
 * Names that have been taken, guarding against two loggers answering to one.
 *
 * **Nothing ever puts anything in it**, so the check below cannot fire - the guard has never run.
 * Left inert rather than wired up: it throws from a constructor, so turning it on would take the
 * bot down at boot the first time two loggers were found sharing a name, and whether any do is not
 * something this file can answer.
 */
const registeredNames: Record<string, boolean> = {};

interface LoggerOptions {
    skipEventBusHook?: boolean;
}

export class Logger extends ObjectBase {
    private static lastLogTime: number = new Date().getTime();

    private readonly ownerName: string;

    private messagePrefixes: string[] = [];

    private config: LoggerOptions = {};

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

    public constructor(
        owner: ObjectBase | typeof ObjectBase | string,
        options?: LoggerOptions
    ) {
        super();

        if ( options ) {
            this.config = options;
        }

        if ( "string" === typeof owner ) {
            this.ownerName = owner;
        } else {
            this.ownerName = owner.getName();
        }

        if ( registeredNames[ this.ownerName ] ) {
            throw new Error( `Logger for '${ this.ownerName }' already exists` );
        }

        if ( process.env.LOGGER_DISABLED && "true" === process.env.LOGGER_DISABLED ) {
            this.error = () => {};
            this.warn = () => {};
            this.admin = () => {};
            this.info = () => {};
            this.log = () => {};
            this.debug = () => {};

            return;
        }

        if (
            process.env.LOGGER_LOG_PREVIOUS_CALLER_SOURCE_DISABLED &&
            "true" === process.env.LOGGER_LOG_PREVIOUS_CALLER_SOURCE_DISABLED
        ) {
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

        if ( !this.config.skipEventBusHook ) {
            EventBus.$.registerMultiInstances( this, [ this.outputEvent ] );
        }
    }

    public addMessagePrefix( prefix: string ) {
        this.messagePrefixes.push( prefix );
    }

    /**
     * The `any` on `params` is deliberate, and the project's rule is knowingly set aside for these.
     *
     * Almost every call logging something logs a caught error, and typescript types a `catch`
     * binding as `unknown` - so the parameter has to accept it. A union that admits `unknown` *is*
     * `unknown`, which is no narrower and equally forbidden, and narrowing at the call sites means
     * a guard in front of two hundred and forty log lines whose only job is to satisfy the
     * signature. Tightened to a printable union, this package still compiles while the bot, the api
     * and the gui report two hundred and forty errors between them, all of them `unknown`.
     */
    public log( caller: ICaller, message: string, ...params: any[] ): void {
        this.output( DEFAULT_LOG_PREFIX, caller, message, ...params );
    }

    public info( caller: ICaller, message: string, ...params: any[] ): void {
        this.output( DEFAULT_INFO_PREFIX, caller, message, ...params );
    }

    public debug( caller: ICaller, message: string, ...params: any[] ): void {
        this.output( DEFAULT_DEBUG_PREFIX, caller, message, ...params );
    }

    public warn( caller: ICaller, message: string, ...params: any[] ): void {
        this.output( DEFAULT_WARN_PREFIX, caller, message, ...params );
    }

    public error( caller: ICaller, message: string, ...params: any[] ): void {
        this.output( DEFAULT_ERROR_PREFIX, caller, message, ...params );
    }

    public admin( caller: ICaller, message: string, ...params: any[] ): void {
        this.output( DEFAULT_ADMIN_PREFIX, caller, message, ...params );
    }

    public beep() {
        console.log( "\x07" );
    }

    private getTime(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours().toString().padStart( 2, "0" );
        const minute = now.getMinutes().toString().padStart( 2, "0" );

        return `${ year }-${ month }-${ day } ${ hour }:${ minute }`;
    }

    private getCallerName( caller: ICaller ) {
        let result: string = "";

        if ( typeof caller === "string" ) {
            result = caller;
        } else if ( typeof caller === "function" ) {
            result = caller.name;
        }

        if ( !result || !result.length ) {
            console.error( "Invalid Caller", new Error().stack );
            result = "_CALLER_UNKNOWN_";
        }

        return result;
    }

    private getStackTrace(): IStackLine[] {
        const stackTrace = ( new Error().stack || "" ).split( "\n" );
        const stackLines = stackTrace.slice( 1 ); // Skip the first line containing "Error"

        const stackRegex = / at (.+?) \((.+?)\)/;
        const result = [];

        for ( let i = 0; i < stackLines.length; i++ ) {
            const line = stackLines[ i ];
            const match = line.match( stackRegex );

            if ( match ) {
                const [ , context, file ] = match;
                const parsedLine: IStackLine = { context, file };

                if ( line.startsWith( "new" ) ) {
                    parsedLine.isNew = true;
                    parsedLine.object = context.split( " " )[ 1 ];
                } else if ( context !== "Object.<anonymous>" ) {
                    parsedLine.object = context;
                }

                result.push( parsedLine );
            }
        }

        return result;
    }

    public getPreviousSource(): string {
        // TODO: Take those from env.
        const stack = this.getStackTrace()
            .filter( ( line ) => line.file.includes( "/src/" ) )
            .filter( ( line ) => !line.file.includes( "logger.ts" ) )
            .filter( ( line ) => !line.file.includes( "debugger.ts" ) )
            .filter( ( line ) => !line.file.includes( "/node_modules/" ) );

        let previousSource = "";

        const previousCaller = stack[ 1 ]?.object?.split( "." );

        if ( previousCaller && previousCaller.length > 1 ) {
            const previousCallerName = previousCaller[ 0 ],
                previousCallerMethod = previousCaller[ 1 ];

            // Extract file name from file path.
            // const previousCallerFileName = stack[ 1 ].file.split( "/" ).pop();

            previousSource = `${ previousCallerName }::${ previousCallerMethod }]` + "[";
        }

        return previousSource;
    }

    private output( prefix: string, caller: ICaller, message: string, ...params: any[] ): void {
        const source = this.getPreviousSource() + pc.white( this.ownerName + "::" + this.getCallerName( caller ) );

        let messagePrefix = "";

        if ( this.messagePrefixes.length ) {
            messagePrefix = `[${ this.messagePrefixes.join( "][" ) }]`;
        }

        const timestamp = this.getTime();
        const timeDiff = ( new Date().getTime() - Logger.lastLogTime ).toString().padStart( 4, "0" );

        this.outputEvent( prefix, timeDiff, source, messagePrefix, message, params );

        const output = `${ prefix }[${ timestamp }][+${ timeDiff }ms][${ source }]${ messagePrefix }: ${ message }`;

        console.log( output, ...params );

        Logger.lastLogTime = new Date().getTime();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public outputEvent( prefix: string, timeDiff: string, source: string, messagePrefix: string, message: string, params: any[] ): void {
    }
}
