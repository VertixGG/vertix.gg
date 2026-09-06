import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CHANNEL_CREATE_FAILED_EMBED_VARS = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" )
};

const ChannelCreateFailedEmbed = new EmbedBuilder<UIArgs, typeof CHANNEL_CREATE_FAILED_EMBED_VARS>(
    "VertixBot/UI-General/ChannelCreateFailedEmbed",
    CHANNEL_CREATE_FAILED_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "⚠️  Your channel could not be created" )
    .setDescription( () => (
        `Joining <#${ CHANNEL_CREATE_FAILED_EMBED_VARS.masterChannelId }> did not create a channel for you.\n\n` +
        "This usually means the server reached one of Discord's limits - a category holds 50 channels " +
        "and a server holds 500 - or that a permission the bot needs was removed.\n\n" +
        "Please let a server admin know. The reason is written to the bot logs."
    ) )
    .setColor( 0xe2ad2d )
    .setLogic( ( args: UIArgs ) => ( {
        masterChannelId: args.masterChannelId
    } ) )
    .setDefaultVars( () => ( {
        masterChannelId: "123456789"
    } ) )
    .build();

export { ChannelCreateFailedEmbed };
