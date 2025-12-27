import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_RENAME_SUCCESS_VARS = {
    channelName: uiUtilsWrapAsTemplate( "channelName" )
};

const DynamicChannelRenameSuccessEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_RENAME_SUCCESS_VARS>(
    "VertixBot/UI-V3/DynamicChannelRenameSuccessEmbed",
    DYNAMIC_CHANNEL_RENAME_SUCCESS_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xe8ae08 )
    .setTitle(
        () => `✏️  Your channel's name has changed to '${ DYNAMIC_CHANNEL_RENAME_SUCCESS_VARS.channelName }'`
    )
    .setLogic( ( args: UIArgs ) => ( {
        channelName: args.channelName
    } ) )
    .build();

export { DynamicChannelRenameSuccessEmbed };
