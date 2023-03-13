import { ChannelType, CommandInteraction } from "discord.js";

import { guiManager } from "@dynamico/managers";

import { UIInteractionTypes } from "@dynamico/interfaces/ui";

import Permissions from "@dynamico/utils/permissions";

import GlobalLogger from "@dynamico/global-logger";

export default async function permissionsMiddleware( interaction: UIInteractionTypes|CommandInteraction ) {
    if ( interaction.isCommand() && interaction.guild ) {
        const result = Permissions.getMissingPermissions( interaction.guild );

        if ( result.length ) {
            await guiManager.get( "Dynamico/UI/NotifyPermissions" ).sendContinues( interaction, {
                botName: interaction.client.user.username,
                permissions: result,
            } );

            return false;
        }

        return true;
    } else if (  interaction.channel?.type && ChannelType.GuildVoice === interaction.channel.type && interaction.guild ) {
        const result = Permissions.getMissingPermissions( interaction.channel );

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
