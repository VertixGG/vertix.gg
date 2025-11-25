import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const NOT_YOUR_CHANNEL_VARS = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" )
};

const NotYourChannelEmbed = new EmbedBuilder<UIArgs, typeof NOT_YOUR_CHANNEL_VARS>(
    "VertixBot/UI-General/NotYourChannelEmbed",
    NOT_YOUR_CHANNEL_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "⛔  This is not your channel!" )
    .setDescription( () => (
        "But you can open your own channel :)\n" +
        `\n Just click here: <#${ NOT_YOUR_CHANNEL_VARS.masterChannelId }>`
    ) )
    .setColor( 0xff5202 )
    .setLogic( ( args?: UIArgs ) => ( {
        masterChannelId: args?.masterChannelId
    } ) )
    .build();

export { NotYourChannelEmbed };
