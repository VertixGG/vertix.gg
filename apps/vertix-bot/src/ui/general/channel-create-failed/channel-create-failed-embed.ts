import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CHANNEL_CREATE_FAILED_EMBED_VARS = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    reason: uiUtilsWrapAsTemplate( "reason" ),
    reasonCategoryFull: uiUtilsWrapAsTemplate( "reasonCategoryFull" ),
    reasonUnknown: uiUtilsWrapAsTemplate( "reasonUnknown" )
};

const ChannelCreateFailedEmbed = new EmbedBuilder<UIArgs, typeof CHANNEL_CREATE_FAILED_EMBED_VARS>(
    "VertixBot/UI-General/ChannelCreateFailedEmbed",
    CHANNEL_CREATE_FAILED_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "⚠️  Your channel could not be created" )
    .setDescription( () => (
        `Joining <#${ CHANNEL_CREATE_FAILED_EMBED_VARS.masterChannelId }> did not create a channel for you.\n\n` +
        CHANNEL_CREATE_FAILED_EMBED_VARS.reason
    ) )
    .setColor( 0xe2ad2d )
    .setOptions( () => ( {
        reason: {
            [ CHANNEL_CREATE_FAILED_EMBED_VARS.reasonCategoryFull ]:
                "The category this channel lives in is full. Discord allows 50 channels per category, " +
                "and it has reached that.\n\n" +
                "Please let a server admin know - they can free a channel or move the generator to " +
                "another category.",
            [ CHANNEL_CREATE_FAILED_EMBED_VARS.reasonUnknown ]:
                "This usually means the server reached one of Discord's limits, or that a permission " +
                "the bot needs was removed.\n\n" +
                "Please let a server admin know. The reason is written to the bot logs."
        }
    } ) )
    .setLogic( ( args: UIArgs ) => ( {
        masterChannelId: args.masterChannelId,
        reason: args.isCategoryFull
            ? CHANNEL_CREATE_FAILED_EMBED_VARS.reasonCategoryFull
            : CHANNEL_CREATE_FAILED_EMBED_VARS.reasonUnknown
    } ) )
    .setDefaultVars( () => ( {
        masterChannelId: "123456789"
    } ) )
    .build();

export { ChannelCreateFailedEmbed };
