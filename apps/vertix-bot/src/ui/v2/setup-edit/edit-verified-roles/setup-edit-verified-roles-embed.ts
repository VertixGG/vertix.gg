import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
    verifiedRolesDisplay: uiUtilsWrapAsTemplate( "verifiedRolesDisplay" ),
    verifiedRolesDefault: uiUtilsWrapAsTemplate( "verifiedRolesDefault" ),
    index: uiUtilsWrapAsTemplate( "index" )
};

const SetupEditVerifiedRolesEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditVerifiedRolesEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🛡️  Edit Verified Roles Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        `Editing verified roles will impact the dynamic channels created by Master Channel #${ vars.index }.\n\n` +
        "**_Current Verified Roles_**\n\n" +
        "> " +
        vars.verifiedRolesDisplay
    ) )
    .setFooterText( () =>
        "Note: The changes will only affect dynamic channels that change their state after the editing, the old roles in the channel will be be unchanged."
    )
    .setOptions( () => ( {
        verifiedRolesDisplay: {
            [ vars.verifiedRoles ]: vars.verifiedRoles,
            [ vars.verifiedRolesDefault ]: "**None**"
        }
    } ) )
    .setArrayOptions( () => ( {
        verifiedRoles: {
            format: `<@&${ vars.value }>${ vars.separator }`,
            separator: ", "
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string | number | string[]> = {
            index: args.index + 1
        };

        const verifiedRoles = Array.isArray( args.dynamicChannelVerifiedRoles )
            ? args.dynamicChannelVerifiedRoles
            : [];

        if ( verifiedRoles.length ) {
            result.verifiedRoles = verifiedRoles;
            result.verifiedRolesDisplay = vars.verifiedRoles;
        } else {
            result.verifiedRolesDisplay = vars.verifiedRolesDefault;
        }

        return result;
    } )
    .build();

export { SetupEditVerifiedRolesEmbed };
