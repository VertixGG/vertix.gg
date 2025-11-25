import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelPermissionsShownEmbed = new EmbedBuilder(
    "VertixBot/UI-V3/DynamicChannelPermissionsShownEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xc79d5f )
    .setTitle( "🐵  The channel is visible now" )
    .build();

export { DynamicChannelPermissionsShownEmbed };
