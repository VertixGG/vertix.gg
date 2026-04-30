import { Colors } from "discord.js";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const NothingChangedEmbed = new EmbedBuilder(
    "VertixBot/UI-General/NothingChangedEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🤷  Nothing changed" )
    .setDescription(
        "This is may occur when you try to change something that is not changeable or is the same as before."
    )
    .setColor( Colors.Red )
    .build();

export { NothingChangedEmbed };
