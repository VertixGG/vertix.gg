import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const ClaimInChannelOnlyEmbed = new EmbedBuilder(
    "VertixBot/UI-General/ClaimInChannelOnlyEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "😈  Claim works inside the channel" )
    .setDescription(
        "This panel sits beside the generator rather than in any one channel, so there is nothing " +
        "here to claim.\n\n" +
        "Join the voice channel you want to take over, open its chat, and press **Claim** on the " +
        "message waiting there."
    )
    .setColor( 0xff5202 )
    .build();

export { ClaimInChannelOnlyEmbed };
