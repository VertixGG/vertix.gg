import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const ClaimResultStepInEmbed = new EmbedBuilder(
    "VertixBot/UI-V2/ClaimResultStepInEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => "😈  Channel might be yours" )
    .setDescription( () => "You've put yourself forward as a potential owner of this channel.\nGood luck!\n" )
    .build();

export { ClaimResultStepInEmbed };
