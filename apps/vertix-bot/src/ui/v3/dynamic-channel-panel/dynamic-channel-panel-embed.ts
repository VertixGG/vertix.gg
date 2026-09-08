import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" )
};

const DynamicChannelPanelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelPanelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( () => `https://api.voicechannels.online/api/tools/button-sheet.png?cols=4&scale=3&items=${ vars.dynamicChannelButtonsTemplate }` )
    .setTitle( () => "༄ Manage your Dynamic Channel" )
    .setDescription( () =>
        "Embrace the responsibility of overseeing your dynamic channel, " +
        "diligently customizing it according to your discerning preferences.\n\n" +
        "**Available Features:**\n\n"
    )
    .build();

export { DynamicChannelPanelEmbed };
