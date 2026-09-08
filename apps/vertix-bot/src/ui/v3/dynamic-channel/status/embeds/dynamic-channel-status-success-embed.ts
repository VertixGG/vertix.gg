import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_YELLOW } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    channelStatus: uiUtilsWrapAsTemplate( "channelStatus" )
};

const DynamicChannelStatusSuccessEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelStatusSuccessEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_YELLOW )
    .setTitle( () => `Your channel's status is now '${ vars.channelStatus }'` )
    .setDescription( () => "It stays until you clear it, submit an empty status to go back to automatic." )
    .setLogic( ( args: UIArgs ) => ( {
        channelStatus: args.channelStatus
    } ) )
    .setDefaultVars( () => ( {
        channelStatus: "Ranked grind, need two"
    } ) )
    .build();

export { DynamicChannelStatusSuccessEmbed };
