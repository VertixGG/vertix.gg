import * as util from "util";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import pc from "picocolors";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

import type { PermissionOverwriteManager, PermissionOverwrites } from "discord.js";

export class Debugger extends ObjectBase {
    private logger!: Logger;

    declare private finalizationRegistry;

    public static getName() {
        return "VertixBase/Modules/Debugger";
    }

    public constructor(
        owner: ObjectBase | typeof ObjectBase | string,
        prefix?: string,
        private shouldDebug = Logger.isDebugEnabled()
    ) {
        super();

        if ( shouldDebug ) {
            this.logger = new Logger( owner );

            if ( prefix ) {
                this.logger.addMessagePrefix( prefix );
            }
        } else {
            // Bypass all the methods
            this.log = () => {};
            this.dumpDown = () => {};
            this.debugPermission = () => {};
            this.debugPermissions = () => {};
            this.enableCleanupDebug = () => {};
        }
    }

    public enableCleanupDebug( handle: ObjectBase, id: string = "" ) {
        if ( !this.finalizationRegistry ) {
            this.finalizationRegistry = new FinalizationRegistry( ( id: string ) => {
                this.log( this.constructor, `FinalizationRegistry: ${ id }` );
            } );
        }

        if ( !id ) {
            id = handle.getName() + ":" + handle.getUniqueId();
        }

        this.log( this.enableCleanupDebug, `Initialized: '${ id }'` );

        this.finalizationRegistry.register( handle, id );
    }

    public log( source: Function, message: string, ...args: any[] ) {
        if ( args && args.length > 0 ) {
            return this.logger.debug( source, message, ...args );
        }

        this.logger.debug( source, message );
    }

    public dumpDown( source: Function, object: any, objectName: string = "" ) {
        this.log(
            source,
            `${ objectName ? objectName + ":" : "" } ` + "🔽" + "\n" + pc.green( util.inspect( object, false, null, true ) )
        );
    }

    public debugPermission( source: Function, overwrite: PermissionOverwrites ) {
        let { id, allow, deny, type } = overwrite;

        this.log(
            source,
            JSON.stringify( {
                id,
                allow: allow.toArray(),
                deny: deny.toArray(),
                type
            } )
        );
    }

    public debugPermissions( source: Function, permissionOverwrites: PermissionOverwriteManager ) {
        for ( const overwrite of permissionOverwrites.cache.values() ) {
            this.debugPermission( source, overwrite );
        }
    }

    public isEnabled() {
        return this.shouldDebug;
    }
}

export function createDebugger( owner: ObjectBase | typeof ObjectBase | string, ownerType: string, prefix?: string ) {
    const ownerName = typeof owner === "string" ? owner : owner.getName();

    return new Debugger( owner, prefix, isDebugEnabled( ownerType, ownerName ) );
}
