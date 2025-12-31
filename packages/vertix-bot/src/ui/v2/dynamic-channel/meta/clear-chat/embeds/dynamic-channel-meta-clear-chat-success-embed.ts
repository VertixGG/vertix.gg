import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    ownerDisplayName: uiUtilsWrapAsTemplate( "ownerDisplayName" ),
    totalMessages: uiUtilsWrapAsTemplate( "totalMessages" )
};

const DynamicChannelMetaClearChatSuccessEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelMetaClearChatSuccessEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xc5ac63 )
    .setTitle( () => `🧹  Chat was cleared the by ${ vars.ownerDisplayName }!` )
    .setDescription( () => `Total of ${ vars.totalMessages } messages.` )
    .setLogic( ( args: UIArgs ) => ( {
        ownerDisplayName: args.ownerDisplayName,
        totalMessages: args.totalMessages
    } ) )
    .setDefaultVars( () => ( {
        ownerDisplayName: "User",
        totalMessages: "0"
    } ) )
    .build();

export { DynamicChannelMetaClearChatSuccessEmbed };
