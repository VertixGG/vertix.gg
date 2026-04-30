import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    channelName: uiUtilsWrapAsTemplate( "channelName" )
};

const DynamicChannelMetaRenameSuccessEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelMetaRenameSuccessEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xe8ae08 )
    .setTitle( () => `✏️  Your channel's name has changed to '${ vars.channelName }'` )
    .setLogic( ( args: UIArgs ) => ( {
        channelName: args.channelName
    } ) )
    .setDefaultVars( () => ( {
        channelName: "New Channel Name"
    } ) )
    .build();

export { DynamicChannelMetaRenameSuccessEmbed };
