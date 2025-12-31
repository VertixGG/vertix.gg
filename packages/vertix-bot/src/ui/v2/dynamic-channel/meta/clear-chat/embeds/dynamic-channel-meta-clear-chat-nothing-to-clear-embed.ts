import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelMetaClearChatNothingToClearEmbed = new EmbedBuilder(
    "VertixBot/UI-V2/DynamicChannelMetaClearChatNothingToClearEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xc5ac63 )
    .setTitle( () => "🧹  There are no messages available to clear" )
    .setDescription( () => "Keep in mind, that only non-embeds messages can be deleted." )
    .build();

export { DynamicChannelMetaClearChatNothingToClearEmbed };
