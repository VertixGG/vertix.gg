import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

export const ClaimResultStepAlreadyInEmbed = new EmbedBuilder(
    "VertixBot/UI-V3/ClaimResultStepAlreadyInEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🤷  You are already in" )
    .setDescription(
        "Your intentions are clear - you've already nominated yourself as a potential owner of this channel."
    )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .build();
