import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_RENAME_BADWORD_VARS = {
    badword: uiUtilsWrapAsTemplate( "badword" )
};

const DynamicChannelRenameBadwordEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_RENAME_BADWORD_VARS>(
    "VertixBot/UI-V3/DynamicChannelRenameBadwordEmbed",
    DYNAMIC_CHANNEL_RENAME_BADWORD_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( "🙅  Failed to rename your channel" )
    .setDescription(
        () =>
            `The word \`${ DYNAMIC_CHANNEL_RENAME_BADWORD_VARS.badword }\` has been classified as inappropriate by the server administrator.`
    )
    .setLogic( ( args: UIArgs ) => ( {
        badword: args.badword
    } ) )
    .build();

export { DynamicChannelRenameBadwordEmbed };
