import { Colors } from "discord.js";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const SomethingWentWrongEmbed = new EmbedBuilder(
    "VertixBot/UI-General/SomethingWentWrongEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🤷 Oops, an issue has occurred" )
    .setDescription( "Something went wrong" )
    .setColor( Colors.Red )
    .build();

export { SomethingWentWrongEmbed };
