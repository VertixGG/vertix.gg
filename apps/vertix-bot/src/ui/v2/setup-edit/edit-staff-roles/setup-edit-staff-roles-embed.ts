import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    staffRoles: uiUtilsWrapAsTemplate( "staffRoles" ),
    staffRolesDisplay: uiUtilsWrapAsTemplate( "staffRolesDisplay" ),
    staffRolesNone: uiUtilsWrapAsTemplate( "staffRolesNone" ),

    index: uiUtilsWrapAsTemplate( "index" )
};

const SetupEditStaffRolesEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditStaffRolesEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🔑  Edit Staff Roles Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        "Staff roles are the mirror of the verified roles: the verified roles are the audience a channel can shut out, the staff roles are the ones it never can.\n\n" +
        `A role selected here keeps access to every dynamic channel of Master Channel #${ vars.index }, whatever privacy state its owner picks - so a moderator can reach a private or hidden channel without being let in one at a time.\n\n` +
        "Leave it empty if nobody should bypass the owner.\n\n" +
        "**_Current Staff Roles_**\n\n" +
        "> " +
        vars.staffRolesDisplay
    ) )
    .setFooterText( () =>
        "Note: The changes are applied immediately to the existing dynamic channels."
    )
    .setOptions( () => ( {
        staffRolesDisplay: {
            [ vars.staffRoles ]: vars.staffRoles,
            [ vars.staffRolesNone ]: "**None**"
        }
    } ) )
    .setArrayOptions( () => ( {
        staffRoles: {
            format: `<@&${ vars.value }>${ vars.separator }`,
            separator: ", "
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string | number | string[]> = {
            index: args.index + 1
        };

        const staffRoles = Array.isArray( args.dynamicChannelStaffRoles )
            ? args.dynamicChannelStaffRoles
            : [];

        if ( staffRoles.length ) {
            result.staffRoles = staffRoles;
            result.staffRolesDisplay = vars.staffRoles;
        } else {
            result.staffRolesDisplay = vars.staffRolesNone;
        }

        return result;
    } )
    .build();

export { SetupEditStaffRolesEmbed };
