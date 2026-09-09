import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_KNOCK_REQUEST_VARS = {
    knockEmoji: uiUtilsWrapAsTemplate( "knockEmoji" ),
    knockerId: uiUtilsWrapAsTemplate( "knockerId" ),
    knockerDisplayName: uiUtilsWrapAsTemplate( "knockerDisplayName" )
};

const DynamicChannelKnockRequestEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_KNOCK_REQUEST_VARS>(
    "VertixBot/UI-V3/DynamicChannelKnockRequestEmbed",
    DYNAMIC_CHANNEL_KNOCK_REQUEST_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( vars ) => `${ vars.knockEmoji }  Someone wants to join` )
    .setDescription( ( vars ) => (
        `<@${ vars.knockerId }> is asking to be let into this channel.\n\n` +
        "Letting them in grants them access the way the access menu would. " +
        "Ignoring this is an answer too - the request expires on its own."
    ) )
    .setLogic( ( args?: UIArgs ) => ( {
        knockerId: args?.knockerId,
        knockerDisplayName: args?.knockerDisplayName
    } ) )
    .setDefaultVars( () => ( {
        knockEmoji: EmojiManager.$.getMarkdown( "KnockChannel" ),
        knockerId: "123456789",
        knockerDisplayName: "Example User"
    } ) )
    .build();

export { DynamicChannelKnockRequestEmbed };
