import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const SETUP_STEP_3_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
    verifiedRolesDisplay: uiUtilsWrapAsTemplate( "verifiedRolesDisplay" ),
    verifiedRolesEmpty: uiUtilsWrapAsTemplate( "verifiedRolesDefault" )
};

const SetupStep3Embed = new EmbedBuilder<UIArgs, typeof SETUP_STEP_3_VARS>(
    "VertixBot/UI-V2/SetupStep3Embed",
    SETUP_STEP_3_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( "Step 3 - Select Verified Roles" )
    .setDescription( () => (
        "Verified roles are the roles that the privacy buttons work on.\n\n" +
        "When a channel owner presses **Private** or **Hidden**, the bot changes the permissions " +
        "of these roles. They decide who can see the channel and who can join it.\n\n" +
        "⚠️ **Not sure what to pick? Keep `@everyone`.** It is the right choice for almost every server.\n\n" +
        "**_When you need a different role_**\n\n" +
        "Only if new members cannot see your channels until somebody gives them a role.\n\n" +
        "_Example_: a new member joins your server and sees nothing until they get the `Member` role. " +
        "If verified roles stay `@everyone`, a public dynamic channel shows up for that new member too. " +
        "Pick `Member` instead, and only members who passed your gate can see and join.\n\n" +
        "**_🛡️ Verified Roles_**\n\n" +
        "> " +
        SETUP_STEP_3_VARS.verifiedRolesDisplay +
        "\n\n" +
        "Still not sure? check out the [explanation](https://voicechannels.online/setup/3).\n\n" +
        "You can keep the default settings by pressing **( `✓ Finish` )** button."
    ) )
    .setOptions( () => ( {
        verifiedRolesDisplay: {
            [ SETUP_STEP_3_VARS.verifiedRoles ]: SETUP_STEP_3_VARS.verifiedRoles,
            [ SETUP_STEP_3_VARS.verifiedRolesEmpty ]: "**None**"
        }
    } ) )
    .setArrayOptions( () => ( {
        verifiedRoles: {
            format: `<@&${ SETUP_STEP_3_VARS.value }>${ SETUP_STEP_3_VARS.separator }`,
            separator: ", "
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string | string[]> = {};
        const verifiedRoles = Array.isArray( args.dynamicChannelVerifiedRoles )
            ? args.dynamicChannelVerifiedRoles
            : [];

        if ( verifiedRoles.length ) {
            result.verifiedRoles = verifiedRoles;
            result.verifiedRolesDisplay = SETUP_STEP_3_VARS.verifiedRoles;
        } else {
            result.verifiedRolesDisplay = SETUP_STEP_3_VARS.verifiedRolesEmpty;
        }

        return result;
    } )
    .build();

export { SetupStep3Embed };
