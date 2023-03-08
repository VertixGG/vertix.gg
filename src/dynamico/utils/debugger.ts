import chalk from "chalk";

import { PermissionOverwriteManager, PermissionOverwrites } from "discord.js";

import { ObjectBase } from "@internal/bases";

import Logger from "@internal/modules/logger";

export class Debugger extends ObjectBase {
    private logger: Logger;

    public static getName() {
        return "Dynamico/Utils/Debugger";
    }

    public constructor( owner: ObjectBase, prefix?: string ) {
        super();

        this.logger = new Logger( owner );
        this.logger.addMessagePrefix( chalk.magenta( "DBG" ) );

        if ( prefix ) {
            this.logger.addMessagePrefix( prefix );
        }
    }

    public log( source: Function, message: string, ... args: any[] ) {
        if ( args && args.length > 0 ) {
            return this.logger.debug( source, message, args );
        }

        this.logger.debug( source, message );
    }

    public dumpDown( source: Function, object: any ) {
        this.log( source, "🔽", object );
    }

    public debugPermission( source: Function, overwrite: PermissionOverwrites ) {
        let { id, allow, deny, type } = overwrite;

        this.log( source, JSON.stringify( {
            id,
            allow: allow.toArray(),
            deny: deny.toArray(),
            type,
        } ) );
    }

    public debugPermissions( source: Function, permissionOverwrites: PermissionOverwriteManager ) {
        for ( const overwrite of permissionOverwrites.cache.values() ) {
            this.debugPermission( source, overwrite );
        }
    }

}

export default Debugger;
