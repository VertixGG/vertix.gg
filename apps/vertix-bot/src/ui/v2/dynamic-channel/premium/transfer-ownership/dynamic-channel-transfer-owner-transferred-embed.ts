import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

const DynamicChannelTransferOwnerTransferredEmbed = new EmbedBuilder(
    "VertixBot/UI-V2/DynamicChannelTransferOwnerTransferredEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( "🔀  Transfer channel ownership succeeded!" )
    .setDescription( "You are no longer the owner of this channel." )
    .build();

export { DynamicChannelTransferOwnerTransferredEmbed };
