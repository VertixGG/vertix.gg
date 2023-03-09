import { ButtonInteraction, ChannelType, EmbedBuilder, Interaction, } from "discord.js";

import { guiManager } from "@dynamico/managers";

import GlobalLogger from "@dynamico/global-logger";

export async function sendManageUsersComponent( interaction: Interaction, title: string ) {
    if ( ! interaction.channel || interaction.channel.type !== ChannelType.GuildVoice ) {
        return GlobalLogger.getInstance().error( sendManageUsersComponent,
            `Interaction channel is not a voice channel. Channel type: '${ interaction.channel?.type }'`
        );
    }

    const component = guiManager
        .get( "Dynamico/UI/EditUserPermissions" );

    const message = await component.getMessage( interaction ),

        embed = message.embeds?.at( 0 );

    if ( embed && embed instanceof EmbedBuilder ) {
        embed.setTitle( title );

        await guiManager.continuesMessage(
            interaction as ButtonInteraction,
            false,
            [ embed ],
            message.components
        );
    }
}
