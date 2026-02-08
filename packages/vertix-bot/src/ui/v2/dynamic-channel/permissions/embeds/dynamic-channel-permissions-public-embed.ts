import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelPermissionsPublicEmbed = new EmbedBuilder(
    "VertixBot/UI-V2/DynamicChannelPermissionsPublicEmbed"
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x75c8e1 )
    .setImage( "https://i.imgur.com/NthLO3W.png" )
    .setTitle( () => "🌐  The channel is public now" )
    .setDescription( () => (
        "Please be aware that your room is currently accessible to anyone.\n\n" +
            "Members **without** access will be able to enter the room unless it is hidden or set to private."
    ) )
    .build();

export { DynamicChannelPermissionsPublicEmbed };
