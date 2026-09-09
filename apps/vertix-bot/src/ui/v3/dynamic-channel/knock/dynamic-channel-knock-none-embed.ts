import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS = {
    knockEmoji: uiUtilsWrapAsTemplate( "knockEmoji" ),
    openChannels: uiUtilsWrapAsTemplate( "openChannels" ),
    openChannelsDisplay: uiUtilsWrapAsTemplate( "openChannelsDisplay" ),
    openChannelsDefault: uiUtilsWrapAsTemplate( "openChannelsDefault" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    separator: uiUtilsWrapAsTemplate( "separator" )
};

const vars = DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS;

const DynamicChannelKnockNoneEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS>(
    "VertixBot/UI-V3/DynamicChannelKnockNoneEmbed",
    DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setTitle( () => `${ vars.knockEmoji }  Nothing to knock on` )
    .setDescription( () => vars.openChannelsDisplay )
    .setOptions( () => ( {
        openChannelsDisplay: {
            [ vars.openChannelsDefault ]:
                "Every channel here is either open to you already or is one of your own.\n\n"
                + "A channel you cannot see is not listed - if a friend has one, ask them for an invite.",
            [ vars.openChannels ]:
                "Nothing here is closed to you - these are open, walk straight in:\n\n"
                + vars.openChannels
        }
    } ) )
    .setArrayOptions( () => ( {
        openChannels: {
            format: `- <#${ vars.value }>${ vars.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args?: UIArgs ) => {
        const openChannels = Array.isArray( args?.openChannels ) ? args.openChannels : [];

        return {
            openChannels,
            openChannelsDisplay: openChannels.length ? vars.openChannels : vars.openChannelsDefault
        };
    } )
    .setDefaultVars( () => ( {
        knockEmoji: EmojiManager.$.getMarkdown( "KnockChannel" ),
        openChannelsDisplay: vars.openChannelsDefault
    } ) )
    .build();

export { DynamicChannelKnockNoneEmbed };
