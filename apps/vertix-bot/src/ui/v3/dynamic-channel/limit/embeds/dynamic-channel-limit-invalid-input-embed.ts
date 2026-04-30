import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_LIMIT_INVALID_VARS = {
    minValue: uiUtilsWrapAsTemplate( "minValue" ),
    maxValue: uiUtilsWrapAsTemplate( "maxValue" )
};

const DynamicChannelLimitInvalidInputEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_LIMIT_INVALID_VARS>(
    "VertixBot/UI-V3/DynamicChannelLimitInvalidInputEmbed",
    DYNAMIC_CHANNEL_LIMIT_INVALID_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle(
        () =>
            `🙅  User limit must be between ${ DYNAMIC_CHANNEL_LIMIT_INVALID_VARS.minValue } and ${ DYNAMIC_CHANNEL_LIMIT_INVALID_VARS.maxValue }`
    )
    .setLogic( ( args: UIArgs ) => ( {
        minValue: args.minValue,
        maxValue: args.maxValue
    } ) )
    .build();

export { DynamicChannelLimitInvalidInputEmbed };
