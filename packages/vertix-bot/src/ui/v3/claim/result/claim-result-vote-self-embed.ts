import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

export const ClaimResultVoteSelfEmbed = new EmbedBuilder(
    "VertixBot/UI-V3/ClaimResultVoteSelfEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🤷  You cannot vote for yourself" )
    .setDescription( "It's great that you believe in yourself, but voting for yourself is not allowed in this election." )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .build();
