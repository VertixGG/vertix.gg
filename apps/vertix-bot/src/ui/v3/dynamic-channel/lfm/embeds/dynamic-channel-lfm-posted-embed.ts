import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_YELLOW } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    lfmChannelId: uiUtilsWrapAsTemplate( "lfmChannelId" )
};

const DynamicChannelLfmPostedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelLfmPostedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_YELLOW )
    .setTitle( () => "🔎  Your channel is on the board" )
    .setDescription( () =>
        `Posted to <#${ vars.lfmChannelId }>.\n\n` +
        "It keeps its member count up to date, and comes down on its own when your channel fills " +
        "up or empties."
    )
    .setLogic( ( args: UIArgs ) => ( {
        lfmChannelId: args.lfmChannelId
    } ) )
    .build();

export { DynamicChannelLfmPostedEmbed };
