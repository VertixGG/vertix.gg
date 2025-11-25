import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS = {
    userLimit: uiUtilsWrapAsTemplate( "userLimit" ),
    userLimitValue: uiUtilsWrapAsTemplate( "userLimitValue" ),
    userLimitUnlimited: uiUtilsWrapAsTemplate( "userLimitUnlimited" )
};

const DynamicChannelLimitSuccessEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS>(
    "VertixBot/UI-V3/DynamicChannelLimitSuccessEmbed",
    DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xf5cf4d )
    .setTitle(
        () => `✋  Your channel's user limit has changed to ${ DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS.userLimit }`
    )
    .setOptions( () => ( {
        userLimit: {
            [ DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS.userLimitValue ]: DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS.userLimitValue,
            [ DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS.userLimitUnlimited ]: "Unlimited"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => ( {
        userLimit: args.userLimit === 0
            ? DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS.userLimitUnlimited
            : DYNAMIC_CHANNEL_LIMIT_SUCCESS_VARS.userLimitValue,
        userLimitValue: args.userLimit
    } ) )
    .build();

export { DynamicChannelLimitSuccessEmbed };
