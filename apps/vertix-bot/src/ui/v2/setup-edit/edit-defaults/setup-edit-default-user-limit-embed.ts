import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    index: uiUtilsWrapAsTemplate( "index" ),
    userLimit: uiUtilsWrapAsTemplate( "userLimit" ),
    userLimitDisplay: uiUtilsWrapAsTemplate( "userLimitDisplay" ),
    userLimitInherit: uiUtilsWrapAsTemplate( "userLimitInherit" ),
    userLimitUnlimited: uiUtilsWrapAsTemplate( "userLimitUnlimited" ),
    userLimitValue: uiUtilsWrapAsTemplate( "userLimitValue" )
};

const SetupEditDefaultUserLimitEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditDefaultUserLimitEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `✋  Edit Default User Limit Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        "This is the user limit a **newly created** dynamic channel starts with. It does not touch " +
        "channels that already exist, and the owner can still change their own channel afterwards.\n\n" +
        "Copying the generator channel is the old behaviour. Setting a number here is usually better, " +
        "because the generator's own limit also caps how many people can wait in it at once.\n\n" +
        "With auto save on, a returning owner gets their own last limit instead of this.\n\n" +
        "**_Current Default_**\n\n> " +
        vars.userLimitDisplay
    ) )
    .setOptions( () => ( {
        userLimitDisplay: {
            [ vars.userLimitInherit ]: "**Copied from the generator channel**",
            [ vars.userLimitUnlimited ]: "**No limit**",
            [ vars.userLimitValue ]: `**${ vars.userLimit } users**`
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const limit = args.dynamicChannelDefaultUserLimit as number | null | undefined;

        const result: Record<string, string | number> = {
            index: args.index + 1
        };

        if ( null === limit || undefined === limit ) {
            result.userLimitDisplay = vars.userLimitInherit;
        } else if ( 0 === limit ) {
            result.userLimitDisplay = vars.userLimitUnlimited;
        } else {
            result.userLimit = String( limit );
            result.userLimitDisplay = vars.userLimitValue;
        }

        return result;
    } )
    .build();

export { SetupEditDefaultUserLimitEmbed };
