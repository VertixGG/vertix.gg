import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    badword: uiUtilsWrapAsTemplate( "badword" )
};

const DynamicChannelMetaRenameBadwordEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelMetaRenameBadwordEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( () => "🙅  Failed to rename your channel" )
    .setDescription( () => `The word \`${ vars.badword }\` has been classified as inappropriate by the server administrator.` )
    .setLogic( ( args: UIArgs ) => ( {
        badword: args.badword
    } ) )
    .setDefaultVars( () => ( {
        badword: "word"
    } ) )
    .build();

export { DynamicChannelMetaRenameBadwordEmbed };
