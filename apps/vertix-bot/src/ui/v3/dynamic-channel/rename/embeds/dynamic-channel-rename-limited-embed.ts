import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_RENAME_LIMITED_VARS = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    masterChannelMessage: uiUtilsWrapAsTemplate( "masterChannelMessage" ),
    masterChannelMessageDefault: uiUtilsWrapAsTemplate( "masterChannelMessageDefault" ),
    elapsedTimeFormatFraction: uiUtilsWrapAsTemplate( "elapsedTimeFormatFraction" )
};

const DynamicChannelRenameLimitedEmbed = new ElapsedEmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_RENAME_LIMITED_VARS>(
    "VertixBot/UI-V3/DynamicChannelRenameLimitedEmbed",
    DYNAMIC_CHANNEL_RENAME_LIMITED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( Date.now() + args.retryAfter * 1000 ) )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( "🙅 You renamed your channel too fast!" )
    .setDescription( () => (
        `Please wait \`${ DYNAMIC_CHANNEL_RENAME_LIMITED_VARS.elapsedTimeFormatFraction }\` until the next rename` +
        DYNAMIC_CHANNEL_RENAME_LIMITED_VARS.masterChannelMessage
    ) )
    .setOptions( () => ( {
        masterChannelMessage: {
            [ DYNAMIC_CHANNEL_RENAME_LIMITED_VARS.masterChannelId ]: ` or open a new channel: <#${ DYNAMIC_CHANNEL_RENAME_LIMITED_VARS.masterChannelId }>`,
            [ DYNAMIC_CHANNEL_RENAME_LIMITED_VARS.masterChannelMessageDefault ]: ""
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: any = {};

        if ( args.masterChannelId ) {
            result.masterChannelId = args.masterChannelId;
            result.masterChannelMessage = DYNAMIC_CHANNEL_RENAME_LIMITED_VARS.masterChannelId;
        } else {
            result.masterChannelMessage = DYNAMIC_CHANNEL_RENAME_LIMITED_VARS.masterChannelMessageDefault;
        }

        return result;
    } )
    .build();

export { DynamicChannelRenameLimitedEmbed };
