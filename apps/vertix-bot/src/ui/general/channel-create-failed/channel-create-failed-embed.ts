import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { DISCORD_CATEGORY_CHANNELS_LIMIT } from "@vertix.gg/definitions/src/discord-limits-definitions";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CHANNEL_CREATE_FAILED_EMBED_VARS = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    reason: uiUtilsWrapAsTemplate( "reason" ),
    reasonCategoryFull: uiUtilsWrapAsTemplate( "reasonCategoryFull" ),
    reasonGeneratorFull: uiUtilsWrapAsTemplate( "reasonGeneratorFull" ),
    reasonNotCovered: uiUtilsWrapAsTemplate( "reasonNotCovered" ),
    maxActiveDynamicChannels: uiUtilsWrapAsTemplate( "maxActiveDynamicChannels" ),
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
                "The category this channel lives in is full. Discord allows " +
                `${ DISCORD_CATEGORY_CHANNELS_LIMIT } channels per category, and it has reached that.\n\n` +
                "Please let a server admin know - they can free a channel or move the generator to " +
                "another category.",
            [ CHANNEL_CREATE_FAILED_EMBED_VARS.reasonGeneratorFull ]:
                "This generator already has " +
                `${ CHANNEL_CREATE_FAILED_EMBED_VARS.maxActiveDynamicChannels } channels open, which is ` +
                "as many as it may have at once.\n\n" +
                "One will free up when a channel empties out. If they are all in use, a server admin " +
                "can set up another generator.",
            [ CHANNEL_CREATE_FAILED_EMBED_VARS.reasonNotCovered ]:
                "This server has more generators than its plan allows, and this is one of the extra " +
                "ones - so it is not making channels at the moment.\n\n" +
                "The generators it set up first are still working. A server admin can upgrade the " +
                "plan to switch this one back on, or delete a generator it no longer uses.",
            [ CHANNEL_CREATE_FAILED_EMBED_VARS.reasonUnknown ]:
                "This usually means the server reached one of Discord's limits, or that a permission " +
                "the bot needs was removed.\n\n" +
                "Please let a server admin know. The reason is written to the bot logs."
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        // Ordered by who can do something about it: a generator switched off for the plan is the
        // server's to settle, a generator at its cap is the member's to wait out, a full category is
        // an admin's to clear, and the rest is a line in the log.
        const reason = args.isNotCovered
            ? CHANNEL_CREATE_FAILED_EMBED_VARS.reasonNotCovered
            : args.isGeneratorFull
                ? CHANNEL_CREATE_FAILED_EMBED_VARS.reasonGeneratorFull
                : args.isCategoryFull
                    ? CHANNEL_CREATE_FAILED_EMBED_VARS.reasonCategoryFull
                    : CHANNEL_CREATE_FAILED_EMBED_VARS.reasonUnknown;

        return {
            masterChannelId: args.masterChannelId,
            maxActiveDynamicChannels: args.maxActiveDynamicChannels,
            reason
        };
    } )
    .setDefaultVars( () => ( {
        masterChannelId: "123456789",
        maxActiveDynamicChannels: "20"
    } ) )
    .build();

export { ChannelCreateFailedEmbed };
