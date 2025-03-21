import { PermissionsBitField } from "discord.js";

import type { PermissionOverwriteOptions } from "discord.js";

export const permissionsConvertBitfieldToOverwriteOptions = (
    allowPermissions: bigint[],
    denyPermissions?: bigint[]
) => {
    const result: PermissionOverwriteOptions = {},
        permissionsFieldAllow = new PermissionsBitField( allowPermissions );

    permissionsFieldAllow.toArray().forEach( ( permission ) => {
        result[ permission ] = true;
    } );

    if ( denyPermissions ) {
        const permissionsFieldDeny = new PermissionsBitField( denyPermissions );
        permissionsFieldDeny.toArray().forEach( ( permission ) => {
            result[ permission ] = false;
        } );
    }

    return result;
};
