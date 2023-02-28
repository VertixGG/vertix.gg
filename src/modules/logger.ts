import chalk from "chalk";

import InitializeBase from "../bases/initialize-base";
import ObjectBase from "../bases/object-base";

const DEFAULT_LOG_PREFIX = chalk.blackBright( "[LOG]" ),
    DEFAULT_INFO_PREFIX = chalk.blue( "[INFO]"),
    DEFAULT_WARN_PREFIX = chalk.yellow( "[WARN]" ),
    DEFAULT_ERROR_PREFIX = chalk.red( "[ERROR]" );

export type ICalleer = Function | String;

export default class Logger extends InitializeBase {
    private owner: ObjectBase;

    public static getName(): string {
        return "Modules/Logger";
    }

    public constructor( owner: ObjectBase ) {
        super();

        this.owner = owner;
    }

    public log( caller: ICalleer, message: string, ... params: [] ): void {
        this.output( DEFAULT_LOG_PREFIX, caller, message, ... params );
    }

    public info( caller: ICalleer, message: string, ... params: [] ): void {
        this.output( DEFAULT_INFO_PREFIX, caller, message, ... params );
    }

    public warn( caller: ICalleer, message: string, ... params: [] ): void {
        this.output( DEFAULT_WARN_PREFIX, caller, message, ... params );
    }

    public error( caller: ICalleer, message: string, ... params: [] ): void {
        this.output( DEFAULT_ERROR_PREFIX, caller, message, ... params );
    }

    private getTime(): string {
        const iso = new Date().toISOString().match( /(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/ );

        if ( ! iso ) {
            throw new Error( "Invalid date" );
        }

        return iso[ 1 ] + " " + iso[ 2 ];
    }

    private getCallerName( caller: ICalleer ): string {
        if ( typeof caller === "string" ) {
            return caller;
        } else if ( typeof caller === "function" ) {
            return caller.name;
        } else {
            throw new Error( "Invalid caller" );
        }
    }

    private output( prefix: string, caller: ICalleer, message: string, ... params: [] ): void {
        const source = this.owner.getName() + "::" + this.getCallerName( caller );

        console.log( `${ prefix }[${ this.getTime() }][${ source }()]: ${ message }`, params?.length || "" );
    }
}
