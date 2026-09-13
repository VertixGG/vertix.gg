import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelLfmSelectChannelEmbed = new EmbedBuilder<UIArgs>(
    "VertixBot/UI-V2/DynamicChannelLfmSelectChannelEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "🔎  Where should it go?" )
    .setDescription( () =>
        "Pick the channel your call for members is posted to.\n\n" +
        "It shows who is hosting, what they are playing and how many are in, and it is taken down " +
        "when your channel fills up or empties."
    )
    .build();

export { DynamicChannelLfmSelectChannelEmbed };
