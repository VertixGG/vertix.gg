import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const SETUP_MAX_MASTER_CHANNELS_VARS = {
    maxMasterChannels: uiUtilsWrapAsTemplate( "maxMasterChannels" )
};

const SetupMaxMasterChannelsEmbed = new EmbedBuilder<UIArgs, typeof SETUP_MAX_MASTER_CHANNELS_VARS>(
    "VertixBot/UI-General/SetupMaxMasterChannelsEmbed",
    SETUP_MAX_MASTER_CHANNELS_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "🤷  You have reached your master channels limit" )
    .setDescription(
        () => `You can create up to **${ SETUP_MAX_MASTER_CHANNELS_VARS.maxMasterChannels }** Master Channels in total.`
    )
    .setLogic( ( args: UIArgs ) => ( {
        maxMasterChannels: args.maxMasterChannels
    } ) )
    .build();

export { SetupMaxMasterChannelsEmbed };
