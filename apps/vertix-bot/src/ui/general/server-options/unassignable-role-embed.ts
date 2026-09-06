import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    roleId: uiUtilsWrapAsTemplate( "roleId" ),
    reason: uiUtilsWrapAsTemplate( "reason" )
};

const UnassignableRoleEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/UnassignableRoleEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => "🎙️  That role cannot be used" )
    .setDescription( () => (
        `The role <@&${ vars.roleId }> was saved, but the bot cannot hand it out - ${ vars.reason }.\n\n` +
        "Move the bot's own role above it in **Server Settings → Roles**, or pick a different role."
    ) )
    .setColor( Colors.Red )
    .setLogic( ( args: UIArgs ) => ( {
        roleId: args.roleId,
        reason: args.reason
    } ) )
    .setDefaultVars( () => ( {
        roleId: "123456789",
        reason: "the role is above the bot in the role list"
    } ) )
    .build();

export { UnassignableRoleEmbed };
