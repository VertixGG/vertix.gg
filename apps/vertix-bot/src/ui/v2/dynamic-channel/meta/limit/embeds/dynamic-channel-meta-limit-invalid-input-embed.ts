import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    minValue: uiUtilsWrapAsTemplate( "minValue" ),
    maxValue: uiUtilsWrapAsTemplate( "maxValue" )
};

const DynamicChannelMetaLimitInvalidInputEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInputEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( () => `🙅  User limit must be between ${ vars.minValue } and ${ vars.maxValue }` )
    .setLogic( ( args: UIArgs ) => ( {
        minValue: args.minValue,
        maxValue: args.maxValue
    } ) )
    .setDefaultVars( () => ( {
        minValue: "0",
        maxValue: "99"
    } ) )
    .build();

export { DynamicChannelMetaLimitInvalidInputEmbed };
