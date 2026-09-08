import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    channelStatus: uiUtilsWrapAsTemplate( "channelStatus" )
};

const DynamicChannelStatusClearedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelStatusClearedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "Your channel's status is automatic again" )
    .setDescription( () => `It now shows '${ vars.channelStatus }' and updates itself as the channel changes.` )
    .setLogic( ( args: UIArgs ) => ( {
        channelStatus: args.channelStatus
    } ) )
    .setDefaultVars( () => ( {
        channelStatus: "Valorant · 3/5"
    } ) )
    .build();

export { DynamicChannelStatusClearedEmbed };
