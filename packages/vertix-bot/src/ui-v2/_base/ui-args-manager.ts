import { GuildChannel, Message } from "discord.js";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-base";

import { ArgsNotFoundError } from "@vertix.gg/bot/src/ui-v2/_base/errors/args-not-found-error";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";

export class UIArgsManager extends UIBase {
    private prefixName: string;
    private debugger: Debugger;
    private logger: Logger;

    private data: {
        [ ownerName: string ]: {
            [ argsId: string ]: {
                args: UIArgs,
                createdAt: Date,
                updatedAt: Date,
                accessedAt: Date,
            };
        }
    } = {};

    public static getName() {
        return "VertixBot/UI-V2/UIArgsManager";
    }

    public constructor( prefixName: string, shouldDebug = true ) {
        super();

        this.prefixName = prefixName;

        this.debugger = new Debugger( this, prefixName, shouldDebug );
        this.logger = new Logger( this );
    }

    // TODO: Remove this method, it should be handled by initiator
    public getArgsId( context: UIAdapterStartContext | UIAdapterReplyContext | Message<true> ): string {
        let id;

        if ( context instanceof GuildChannel ) {
            id = context.id;
        } else if ( context instanceof Message ) {
            id = context.id;
        } else if ( context.isCommand() ) {
            id = context.id;
        } else if ( context.message?.interaction ) {
            id = context.message.interaction.id;
        } else {
            id = context.message?.id;
        }

        this.debugger.log( this.getArgsId, "", id );

        if ( ! id ) {
            throw new Error( "Invalid interaction id" );
        }

        return id;
    }

    public getArgsById( self: UIBase, id: string ): UIArgs {
        return this.data[ self.getName() ]?.[ id ]?.args;
    }

    public getArgs( self: UIBase, context: UIAdapterStartContext | UIAdapterReplyContext | Message<true> ): UIArgs {
        const argsId = this.getArgsId( context ),
            args = this.getArgsById( self, argsId );

        // Update accessedAt.
        if ( args ) {
            this.data[ self.getName() ][ argsId ].accessedAt = new Date( Date.now() );

            // Create proxy to update accessedAt.
            return new Proxy( Object.assign( {}, args ), {
                get: ( target, property: string ) => {
                    // If not exist return undefined
                    if ( "undefined" === typeof this.data[ self.getName() ] || "undefined" === typeof this.data[ self.getName() ][ argsId ] ) {
                        return undefined;
                    }

                    this.data[ self.getName() ][ argsId ].accessedAt = new Date( Date.now() );

                    return target[ property ];
                }
            } );
        }

        return args;
    }

    public setInitialArgs( self: UIBase, id: string, args: UIArgs, internalArgs: {
        silent?: boolean;
        overwrite?: boolean;
    } = {} ) {
        this.debugger.log( this.setInitialArgs, self.getName() + "~" + id, args );

        if ( typeof this.data[ self.getName() ] !== "object" ) {
            this.data[ self.getName() ] = {};
        }

        if ( ! internalArgs.overwrite && typeof this.data[ self.getName() ][ id ] === "object" ) {
            this.debugger.dumpDown( this.setInitialArgs, this.data[ self.getName() ][ id ] );

            if ( ! internalArgs.silent ) {
                throw new Error( `${ this.prefixName }: Args with name: '${ self.getName() }' id: '${ id }' already exists` );
            }

            this.logger.error( this.setInitialArgs, `${ this.prefixName }: Args with id: '${ id }' already exists` );
            this.deleteArgs( self, id );
            return;
        }

        this.data[ self.getName() ][ id ] = {
            args,
            createdAt: new Date( Date.now() ),
            updatedAt: new Date( Date.now() ),
            accessedAt: new Date( Date.now() ),
        };
    }

    public setArgs( self: UIBase, interaction: Message<true> | UIAdapterReplyContext | UIAdapterStartContext, args: UIArgs ) {
        const argsId = this.getArgsId( interaction ),
            appliedArgs = this.getArgsById( self, argsId );

        if ( ! appliedArgs ) {
            // TODO: Good error example.
            const error =  new ArgsNotFoundError( argsId );

            this.logger.error( this.setArgs, error.message, error );

            return;
        }

        const newArgs: any = {};

        Object.entries( args ).forEach( ( [ key, value ] ) => {
            newArgs[ key ] = value;

            appliedArgs[ key ] = value;
        } );

        this.data[ self.getName() ][ argsId ].updatedAt = new Date( Date.now() );
        this.data[ self.getName() ][ argsId ].accessedAt = new Date( Date.now() );

        this.debugger.log( this.setArgs, "", newArgs );

    }

    public deleteArgs( self: UIBase | string, id: string ) {
        if ( typeof self !== "string" ) {
            self = self.getName();
        }

        this.debugger.log( this.deleteArgs,
            `Try delete args with id: '${ self + "~" + id }'`
        );

        const object = this.data[ self ];

        if ( typeof object === "object" ) {
            this.debugger.dumpDown( this.deleteArgs,
                object[ id ],
                `Deleted args with id: '${ self + "~" + id }'`
            );

            delete object[ id ];

            if ( Object.keys( object ).length === 0 ) {
                delete this.data[ self ];
            }
        } else {
            this.logger.warn( this.deleteArgs,
                `Args with id: '${ self + "~" + id }' not found`
            );
        }
    }

    public getData() {
        return this.data;
    }
}
