import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    index: uiUtilsWrapAsTemplate( "index" )
};

const SetupEditButtonsEffectEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/SetupEditButtonsEffectEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🎚  Edit Buttons Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        `Editing buttons will impact the dynamic channels created by __Master Channel #${ vars.index }__.\n\n` +
        "There are have two options:\n\n" +
        "- Affect changes immediately to all channels\n" +
        "- Apply changes only to newly created _Dynamic Channels_."
    ) )
    .setFooterText( () => "Current enabled buttons at the menu below" )
    .setLogic( ( args: UIArgs ) => ( {
        index: args.index + 1
    } ) )
    .setDefaultVars( () => ( {
        index: "1"
    } ) )
    .build();

export { SetupEditButtonsEffectEmbed };
