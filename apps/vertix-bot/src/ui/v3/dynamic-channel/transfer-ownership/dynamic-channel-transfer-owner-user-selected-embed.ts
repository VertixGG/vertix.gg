import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_TRANSFER_OWNER_USER_SELECTED_VARS = {
    userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" )
};

const DynamicChannelTransferOwnerUserSelectedEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_TRANSFER_OWNER_USER_SELECTED_VARS>(
    "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelectedEmbed",
    DYNAMIC_CHANNEL_TRANSFER_OWNER_USER_SELECTED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( "🔀  Transfer channel ownership" )
    .setDescription( () => (
        `Transfer channel ownership to ${ DYNAMIC_CHANNEL_TRANSFER_OWNER_USER_SELECTED_VARS.userDisplayName }.\n\n` +
        "⚠️ By transferring the channel ownership to another user, you will lose your ownership privileges.\n\n" +
        `Are you sure you want to transfer the channel ownership to **${ DYNAMIC_CHANNEL_TRANSFER_OWNER_USER_SELECTED_VARS.userDisplayName }?**`
    ) )
    .setLogic( ( args: UIArgs ) => ( {
        userDisplayName: args.userDisplayName
    } ) )
    .build();

export { DynamicChannelTransferOwnerUserSelectedEmbed };
