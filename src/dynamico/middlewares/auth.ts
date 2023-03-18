import { ChannelType, EmbedBuilder } from "discord.js";

import { channelManager, masterChannelManager } from "@dynamico/managers";

import { UIInteractionTypes } from "@dynamico/interfaces/ui";
import GlobalLogger from "@dynamico/global-logger";

export default async function authMiddleware( interaction: UIInteractionTypes ) {
    // Only the channel owner can pass the middleware
    if ( interaction.channel?.type && ChannelType.GuildVoice === interaction.channel.type && interaction.guildId ) {
        const channel = await channelManager.getChannel( interaction.guildId, interaction.channel.id, true );

        if ( channel?.userOwnerId === interaction.user.id ) {
            return true;
        }

        const embed = new EmbedBuilder(),
            masterChannel = await masterChannelManager.getByDynamicChannel( interaction, true );

        let message = "You should open your own dynamic channel and try again";

        if ( masterChannel ) {
            message = `${ message }:\n<#${ masterChannel.id }>`;
        }

        embed.setTitle( "🤷 Oops, this is not your channel" );
        embed.setDescription( message );
        embed.setColor( 0xFF8C00 );

        await interaction.reply( {
            embeds: [ embed ],
            ephemeral: true,
        } ).catch( ( e ) => {
            GlobalLogger.getInstance().warn( authMiddleware, "", e );
        } );
    }

    return false;
}
