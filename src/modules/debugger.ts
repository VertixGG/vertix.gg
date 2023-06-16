import * as util from "util";

import { PermissionOverwriteManager, PermissionOverwrites } from "discord.js";

import chalk from "chalk";

import { ObjectBase } from "@internal/bases";

import Logger from "@internal/modules/logger";

export class Debugger extends ObjectBase {
    private readonly shouldDebug: boolean;

    private logger!: Logger;

    declare private finalizationRegistry;

    public static getName() {
        return "internal/modules/debugger";
    }

    public constructor( owner: ObjectBase | typeof ObjectBase, prefix?: string, shouldDebug = true ) {
        super();

        this.shouldDebug = shouldDebug;

        if ( shouldDebug ) {
            this.logger = new Logger( owner );

            if ( prefix ) {
                this.logger.addMessagePrefix( prefix );
            }
        }
    }

    public enableCleanupDebug( handle: ObjectBase, id: string = "" ) {
        if ( this.isDebugging() ) {
            if ( ! this.finalizationRegistry ) {
                this.finalizationRegistry = new FinalizationRegistry( ( id: string ) => {
                    this.log( this.constructor, `FinalizationRegistry: ${ id }` );
                } );
            }

            if ( ! id ) {
                id = handle.getName() + ":" + handle.getUniqueId();
            }

            this.log( this.enableCleanupDebug, `Initialized: '${ id }'` );

            this.finalizationRegistry.register( handle, id );
        }
    }

    public log( source: Function, message: string, ... args: any[] ) {
        if ( ! this.shouldDebug ) {
            return;
        }

        if ( args && args.length > 0 ) {
            return this.logger.debug( source, message, ... args );
        }

        this.logger.debug( source, message );
    }

    public dumpDown( source: Function, object: any, objectName: string = "" ) {
        if ( ! this.shouldDebug ) {
            return;
        }

        this.log( source, `${ objectName ? objectName + ":" : "" } ` + "🔽" + "\n" +
            chalk.hex( "FFA500" )( util.inspect( object, false, null, true ) )
        );
    }

    public debugPermission( source: Function, overwrite: PermissionOverwrites ) {
        if ( ! this.shouldDebug ) {
            return;
        }

        let { id, allow, deny, type } = overwrite;

        this.log( source, JSON.stringify( {
            id,
            allow: allow.toArray(),
            deny: deny.toArray(),
            type,
        } ) );
    }

    public debugPermissions( source: Function, permissionOverwrites: PermissionOverwriteManager ) {
        if ( ! this.shouldDebug ) {
            return;
        }

        for ( const overwrite of permissionOverwrites.cache.values() ) {
            this.debugPermission( source, overwrite );
        }
    }

    public isDebugging() {
        return this.shouldDebug;
    }
}

