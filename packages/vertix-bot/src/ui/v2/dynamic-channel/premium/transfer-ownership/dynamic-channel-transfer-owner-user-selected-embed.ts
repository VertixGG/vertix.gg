import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" )
    };

const DynamicChannelTransferOwnerUserSelectedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelectedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "🔀  Transfer channel ownership" )
    .setDescription( () => (
        `Transfer channel ownership to ${ vars.userDisplayName }.\n\n` +
            "⚠️ By transferring the channel ownership to another user, you will lose your ownership privileges.\n\n" +
        `Are you sure you want to transfer the channel ownership to **${ vars.userDisplayName }?**`
    ) )
    .setLogic( ( args: UIArgs ) => ( {
            userDisplayName: args.userDisplayName
    } ) )
    .setDefaultVars( () => ( {
        userDisplayName: "User"
    } ) )
    .build();

export { DynamicChannelTransferOwnerUserSelectedEmbed };
