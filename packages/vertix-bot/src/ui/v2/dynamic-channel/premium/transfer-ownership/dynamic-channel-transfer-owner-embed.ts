import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

const DynamicChannelTransferOwnerEmbed = new EmbedBuilder(
    "VertixBot/UI-V2/DynamicChannelTransferOwnerEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "🔀  Transfer channel ownership" )
    .setDescription( () => (
        "Transfer channel ownership to another user.\n\n" +
        "Select the user to whom you want to transfer the channel."
    ) )
    .build();

export { DynamicChannelTransferOwnerEmbed };
