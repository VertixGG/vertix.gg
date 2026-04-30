import { Colors } from "discord.js";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const DisabledWhileClaimEmbed = new EmbedBuilder(
    "VertixBot/UI-General/DisabledWhileClaimEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "😈 The action is disabled" )
    .setDescription(
        "The action is disabled while the claim is in progress.\n\nPlease wait until the claim is completed."
    )
    .setColor( Colors.Red )
    .build();

export { DisabledWhileClaimEmbed };
