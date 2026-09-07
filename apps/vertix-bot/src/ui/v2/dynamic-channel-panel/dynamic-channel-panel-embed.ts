
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
};

const DynamicChannelPanelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelPanelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "༄ Manage your Dynamic Channel" )
    .setDescription( () =>
        "Embrace the responsibility of overseeing your dynamic channel, " +
        "diligently customizing it according to your discerning preferences.\n\n"
    )
    .build();

export { DynamicChannelPanelEmbed };
