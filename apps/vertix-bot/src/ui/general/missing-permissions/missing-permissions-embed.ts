import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const MISSING_PERMISSIONS_EMBED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    omitterDisplayName: uiUtilsWrapAsTemplate( "omitterDisplayName" ),
    missingPermissions: uiUtilsWrapAsTemplate( "missingPermissions" )
};

const MissingPermissionsEmbed = new EmbedBuilder<UIArgs, typeof MISSING_PERMISSIONS_EMBED_VARS>(
    "VertixBot/UI-General/MissingPermissionsEmbed",
    MISSING_PERMISSIONS_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🔐  Oops! Certain permissions are required" )
    .setDescription( () => (
        `Some permissions are required to proceed, **${ MISSING_PERMISSIONS_EMBED_VARS.omitterDisplayName }** is missing the following permissions:\n\n` +
        MISSING_PERMISSIONS_EMBED_VARS.missingPermissions
    ) )
    .setColor( 0xe2ad2d )
    .setArrayOptions( () => ( {
        missingPermissions: {
            format: `- ${ MISSING_PERMISSIONS_EMBED_VARS.value }${ MISSING_PERMISSIONS_EMBED_VARS.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => ( {
        omitterDisplayName: args.omitterDisplayName,
        missingPermissions: args.missingPermissions.map( ( permission: string ) =>
            permission.split( /(?=[A-Z])/ ).join( " " )
        )
    } ) )
    .build();

export { MissingPermissionsEmbed };
