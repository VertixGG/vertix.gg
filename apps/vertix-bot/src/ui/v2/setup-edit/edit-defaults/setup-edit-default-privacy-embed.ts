import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    index: uiUtilsWrapAsTemplate( "index" ),
    privacyState: uiUtilsWrapAsTemplate( "privacyState" ),
    privacyPublic: uiUtilsWrapAsTemplate( "privacyPublic" ),
    privacyPrivate: uiUtilsWrapAsTemplate( "privacyPrivate" ),
    privacyHidden: uiUtilsWrapAsTemplate( "privacyHidden" )
};

const SetupEditDefaultPrivacyEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditDefaultPrivacyEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🛡️  Edit Default Privacy Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        "This is the state a **newly created** dynamic channel starts in. It does not touch channels " +
        "that already exist, and the owner can still change their own channel afterwards.\n\n" +
        "**Public** - anyone in the audience can see and join.\n" +
        "**Private** - visible, but only the owner lets people in.\n" +
        "**Hidden** - not visible at all until the owner shows it.\n\n" +
        "With auto save on, a returning owner gets their own last state instead of this.\n\n" +
        "**_Current Default_**\n\n> " +
        vars.privacyState
    ) )
    .setOptions( () => ( {
        privacyState: {
            [ vars.privacyPublic ]: "🌐 **Public**",
            [ vars.privacyPrivate ]: "🚫 **Private**",
            [ vars.privacyHidden ]: "🙈 **Hidden**"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const state = args.dynamicChannelDefaultPrivacyState as string;

        return {
            index: args.index + 1,
            privacyState: "private" === state
                ? vars.privacyPrivate
                : ( "hidden" === state ? vars.privacyHidden : vars.privacyPublic )
        };
    } )
    .build();

export { SetupEditDefaultPrivacyEmbed };
