import { ChannelType, EmbedBuilder, PermissionsBitField } from "discord.js";

import { channelManager, masterChannelManager } from "@dynamico/managers";

import { UIInteractionTypes } from "@dynamico/interfaces/ui";

import GlobalLogger from "@dynamico/global-logger";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

const globalLogger = GlobalLogger.getInstance();

export default async function authMiddleware( interaction: UIInteractionTypes ) {
    if ( ( ! interaction.channel?.type && 0 !== interaction.channel?.type ) || ! interaction.guildId || ! interaction.guild  ) {
        globalLogger.error( authMiddleware,
            `guildId: '${ interaction.guildId }' interaction id: '${ interaction.id }', is not unexpected`
        );
        return false;
    }

    // Only the channel owner can pass the middleware
    if ( ChannelType.GuildVoice === interaction.channel.type ) {
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
        embed.setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

        await interaction.reply( {
            embeds: [ embed ],
            ephemeral: true,
        } ).catch( ( e ) => {
            globalLogger.warn( authMiddleware, "", e );
        } );
    } else if ( ChannelType.GuildText === interaction.channel.type ) {
        // TODO: Repeater logic.
        // Get guild owner from cache.
        const hasPermission = interaction.guild.ownerId === interaction.user.id ||
            interaction.memberPermissions?.has( PermissionsBitField.Flags.Administrator ) || false;

        if ( ! hasPermission ) {
            globalLogger.error( authMiddleware,
                `guildId: '${ interaction.guildId }' interaction id: '${ interaction.id }', user: '${ interaction.user.id }' is not the guild owner`
            );
        }

        return hasPermission;
    } else {
        globalLogger.error( authMiddleware,
            `guildId: '${ interaction.guildId }' interaction channel type is not supported: '${ interaction.channel?.type.toString() }'`
        );
    }

    return false;
}
