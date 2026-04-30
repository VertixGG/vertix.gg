import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" )
};

const NoActiveDynamicChannelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/NoActiveDynamicChannelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "⛔  No active dynamic channel" )
    .setDescription( () => (
        "You don't own an active dynamic channel.\n\n" +
        `Join <#${ vars.masterChannelId }> to create your own channel first.`
    ) )
    .setColor( 0xff5202 )
    .setLogic( ( args?: UIArgs ) => ( {
        masterChannelId: args?.masterChannelId
    } ) )
    .build();

export { NoActiveDynamicChannelEmbed };
