import { ChannelType, VoiceChannel } from "discord.js";

import { guiManager } from "@dynamico/managers";

import { UIInteractionTypes } from "@dynamico/interfaces/ui";

import GlobalLogger from "@dynamico/global-logger";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS
} from "@dynamico/constants/master-channel";

import PermissionsManager from "@dynamico/managers/permissions";

const permissionManager = PermissionsManager.getInstance(),
    globalLogger = GlobalLogger.getInstance();

export default async function permissionsMiddleware( interaction: UIInteractionTypes ) {
    let result = false;

    const isSupportedInteraction = interaction.guild && (
        interaction.isButton() ||
        interaction.isStringSelectMenu() ||
        interaction.isModalSubmit() ||
        interaction.isUserSelectMenu()
    );

    if ( isSupportedInteraction && ChannelType.GuildVoice === ( interaction.channel as VoiceChannel ).type ) {
        const requiredUserPermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow,
            requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
            missingPermissions = [
                ... permissionManager.getMissingPermissions( requiredUserPermissions, interaction.channel as VoiceChannel, interaction.client.user ),
                ... permissionManager.getMissingPermissions( requiredRolePermissions, interaction.guild ),
            ];

        result = ! missingPermissions.length;

        if ( missingPermissions.length ) {
            globalLogger.warn( permissionsMiddleware, "Required permissions:", missingPermissions );

            await guiManager.get( "Dynamico/UI/NotifyPermissions" ).sendContinues( interaction, {
                botName: interaction.client.user.username,
                permissions: missingPermissions,
            } );
        }
    } else {
        globalLogger.warn( permissionsMiddleware,
            `Unsupported interaction type: '{ ${ interaction.type } }'`
        );
    }

    return result;
};
