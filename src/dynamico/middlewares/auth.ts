import { ChannelType, EmbedBuilder } from "discord.js";

import { channelManager, masterChannelManager, permissionsManager } from "@dynamico/managers";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

import { UIInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

import GlobalLogger from "@dynamico/global-logger";

const globalLogger = GlobalLogger.getInstance();

export default async function authMiddleware( interaction: UIInteractionTypes ) {
    if ( ( ! interaction.channel?.type && ChannelType.GuildText !== interaction.channel?.type ) || ! interaction.guildId || ! interaction.guild  ) {
        globalLogger.error( authMiddleware,
            `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - Unexpected behavior`
        );
        return false;
    }

    // Only the channel owner can pass the middleware
    if ( ChannelType.GuildVoice === interaction.channel.type ) {
        const masterChannel = await masterChannelManager.getByDynamicChannel( interaction, true );

        if ( ! masterChannel ) {
            return false;
        }

        const channel = await channelManager.getChannel( interaction.guildId, interaction.channel.id, true );

        if ( channel?.userOwnerId === interaction.user.id ) {
            return true;
        }

        const embed = new EmbedBuilder();

        let message = "You should open your own dynamic channel and try again\n" +
            `<#${ masterChannel.id }>`;

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
        const result = permissionsManager.hasMemberAdminPermission( interaction, authMiddleware );

        if ( ! result ) {
            const embed = new EmbedBuilder();

            embed.setTitle( "🤷 Oops, something wrong" );
            embed.setDescription( "You don't have the permissions to perform this action." );
            embed.setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

            await interaction.reply( {
                embeds: [ embed ],
                ephemeral: true,
            } ).catch( ( e ) => {
                globalLogger.warn( authMiddleware, "", e );
            } );
        }

        return result;
    } else {
        globalLogger.error( authMiddleware,
            `Guild id: '${ interaction.guildId }' - Interaction channel type is not supported: '${ interaction.channel?.type.toString() }'`
        );
    }

    return false;
}
