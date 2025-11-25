import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const SETUP_MAX_MASTER_CHANNELS_VARS = {
    maxMasterChannels: uiUtilsWrapAsTemplate( "maxMasterChannels" )
};

const SetupMaxMasterChannelsEmbed = new EmbedBuilder<UIArgs, typeof SETUP_MAX_MASTER_CHANNELS_VARS>(
    "VertixBot/UI-General/SetupMaxMasterChannelsEmbed",
    SETUP_MAX_MASTER_CHANNELS_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🤷  You have reached your master channels limit" )
    .setDescription(
        () => `You can create up to **${ SETUP_MAX_MASTER_CHANNELS_VARS.maxMasterChannels }** Master Channels in total.`
    )
    .setLogic( ( args: UIArgs ) => ( {
        maxMasterChannels: args.maxMasterChannels
    } ) )
    .build();

export { SetupMaxMasterChannelsEmbed };
