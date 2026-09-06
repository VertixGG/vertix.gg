import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    staffMemberDisplayName: uiUtilsWrapAsTemplate( "staffMemberDisplayName" )
};

const StaffMemberEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-General/StaffMemberEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🔑  Staff member" )
    .setDescription( () =>
        `**${ vars.staffMemberDisplayName }** holds a staff role of this server.\n\n` +
        "Staff roles keep access to every dynamic channel whatever state its owner picks, " +
        "so they cannot be blocked or kicked out of your channel."
    )
    .setColor( Colors.Red )
    .setLogic( ( args: UIArgs ) => ( {
        staffMemberDisplayName: args.staffMemberDisplayName ?? "Unknown"
    } ) )
    .setDefaultVars( () => ( {
        staffMemberDisplayName: "Example User"
    } ) )
    .build();

export { StaffMemberEmbed };
