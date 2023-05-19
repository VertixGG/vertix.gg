import { ChannelType, EmbedBuilder, MessageComponentInteraction } from "discord.js";

import { UIInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

import { PermissionsManager } from "@dynamico/managers/permissions";
import { ChannelManager } from "@dynamico/managers/channel";
import { GUIManager } from "@dynamico/managers/gui";

import { ChannelModel } from "@dynamico/models";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

import GlobalLogger from "@dynamico/global-logger";

const globalLogger = GlobalLogger.$;

export default async function authMiddleware( interaction: UIInteractionTypes ) {
    if ( ( ! interaction.channel?.type && ChannelType.GuildText !== interaction.channel?.type ) || ! interaction.guildId || ! interaction.guild  ) {
        globalLogger.error( authMiddleware,
            `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - Unexpected behavior`
        );
        return false;
    }

    // Only the channel owner can pass the middleware
    if ( ChannelType.GuildVoice === interaction.channel.type ) {
        const master = await ChannelManager.$
            .getMasterChannelByDynamicChannelId( interaction.channelId as string );

        if ( ! master ) {
            await GUIManager.$.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                .sendReply( interaction as MessageComponentInteraction, {} );

            return false;
        }

        const dynamicChannelDB = await ChannelModel.$.getByChannelId( interaction.channel.id );
        if ( dynamicChannelDB?.userOwnerId === interaction.user.id ) {
            return true;
        }

        const embed = new EmbedBuilder();

        let message = "You should open your own dynamic channel and try again\n" +
            `<#${ master.id }>`;

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
        const result = PermissionsManager.$.hasMemberAdminPermission( interaction, authMiddleware );

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
