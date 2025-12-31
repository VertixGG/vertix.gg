import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    index: uiUtilsWrapAsTemplate( "index" )
};

const SetupEditButtonsEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/SetupEditButtonsEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🎚  Edit Buttons Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        "Select which buttons you wish to be visible for your members.\n\n" +
        "Only selected buttons will be enabled/visible at\n" +
        "_Dynamic Channels_ that created by this master channel.\n\n"
    ) )
    .setFooterText( () => "Current enabled buttons at the menu below" )
    .setLogic( ( args: UIArgs ) => ( {
        index: args.index + 1
    } ) )
    .setDefaultVars( () => ( {
        index: "1"
    } ) )
    .build();

export { SetupEditButtonsEmbed };
