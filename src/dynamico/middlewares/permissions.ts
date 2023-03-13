import { ChannelType, CommandInteraction } from "discord.js";

import { guiManager } from "@dynamico/managers";

import { UIInteractionTypes } from "@dynamico/interfaces/ui";

import Permissions from "@dynamico/utils/permissions";

import GlobalLogger from "@dynamico/global-logger";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS } from "@dynamico/constants/master-channel";

export default async function permissionsMiddleware( interaction: UIInteractionTypes|CommandInteraction ) {
    const requiredPermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow;

    if ( interaction.isCommand() && interaction.guild ) {
        const result = ChannelType.GuildVoice === interaction.channel?.type ?
            Permissions.getMissingPermissions( interaction.channel, requiredPermissions, interaction.client.user ) :
            Permissions.getMissingPermissions( interaction.guild, requiredPermissions );

        if ( result.length ) {
            await guiManager.get( "Dynamico/UI/NotifyPermissions" ).sendContinues( interaction, {
                botName: interaction.client.user.username,
                permissions: result,
            } );

            return false;
        }

        return true;
    } else if ( interaction.channel?.type && ChannelType.GuildVoice === interaction.channel.type && interaction.guild ) {
        const result = Permissions.getMissingPermissions( interaction.channel, requiredPermissions, interaction.client.user );

        if ( result.length ) {
            GlobalLogger.getInstance().warn( permissionsMiddleware,
                `Bot role: '${ Permissions.getSelfRoleId( interaction.guild ) }' leaking permissions:`, result
            );

            await guiManager.get( "Dynamico/UI/NotifyPermissions" ).sendContinues( interaction, {
                botName: interaction.client.user.username,
                permissions: result,
            } );

            return false;
        }

        return true;
    }

    return false;
};
