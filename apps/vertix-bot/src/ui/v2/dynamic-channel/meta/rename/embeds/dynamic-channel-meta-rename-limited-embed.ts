import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    masterChannelMessage: uiUtilsWrapAsTemplate( "masterChannelMessage" ),
    masterChannelMessageDefault: uiUtilsWrapAsTemplate( "masterChannelMessageDefault" ),
    elapsedTimeFormatFraction: uiUtilsWrapAsTemplate( "elapsedTimeFormatFraction" )
};

const DynamicChannelMetaRenameLimitedEmbed = new ElapsedEmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelMetaRenameLimitedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( Date.now() + args.retryAfter * 1000 ) )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( "🙅 You renamed your channel too fast!" )
    .setDescription( () => (
        `Please wait \`${ vars.elapsedTimeFormatFraction }\` until the next rename` +
        vars.masterChannelMessage
    ) )
    .setOptions( () => ( {
        masterChannelMessage: {
            [ vars.masterChannelId ]: ` or open a new channel: <#${ vars.masterChannelId }>`,
            [ vars.masterChannelMessageDefault ]: ""
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string> = {};
        const masterChannelId = typeof args.masterChannelId === "string" ? args.masterChannelId : "";

        if ( masterChannelId ) {
            result.masterChannelId = masterChannelId;
            result.masterChannelMessage = vars.masterChannelId;
        } else {
            result.masterChannelMessage = vars.masterChannelMessageDefault;
        }

        return result;
    } )
    .build();

export { DynamicChannelMetaRenameLimitedEmbed };
