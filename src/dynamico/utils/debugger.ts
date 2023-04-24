import chalk from "chalk";

import { PermissionOverwriteManager, PermissionOverwrites } from "discord.js";

import { ObjectBase } from "@internal/bases";

import Logger from "@internal/modules/logger";

export class Debugger extends ObjectBase {
    private shouldDebug = true;

    private logger: Logger;

    public static getName() {
        return "Dynamico/Utils/Debugger";
    }

    public constructor( owner: ObjectBase | typeof ObjectBase, prefix?: string, shouldDebug = true ) {
        super();

        this.shouldDebug = shouldDebug;

        this.logger = new Logger( owner );

        if ( prefix ) {
            this.logger.addMessagePrefix( prefix );
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

        this.log( source, `${ objectName ? objectName + ":" : "" } ` + "🔽", object );
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

}

export default Debugger;
