import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
        userLimit: uiUtilsWrapAsTemplate( "userLimit" ),
        userLimitValue: uiUtilsWrapAsTemplate( "userLimitValue" ),
        userLimitUnlimited: uiUtilsWrapAsTemplate( "userLimitUnlimited" )
    };

const DynamicChannelMetaLimitSuccessEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelMetaLimitSuccessEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xf5cf4d )
    .setTitle( () => `✋  Your channel's user limit has changed to ${ vars.userLimit }` )
    .setOptions( () => ( {
            userLimit: {
            [ vars.userLimitValue ]: vars.userLimitValue,
            [ vars.userLimitUnlimited ]: "Unlimited"
            }
    } ) )
    .setLogic( ( args: UIArgs ) => ( {
        userLimit: args.userLimit === 0 ? vars.userLimitUnlimited : vars.userLimitValue,
            userLimitValue: args.userLimit
    } ) )
    .setDefaultVars( () => ( {
        userLimit: "Unlimited"
    } ) )
    .build();

export { DynamicChannelMetaLimitSuccessEmbed };
