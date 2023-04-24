import { ChannelType, Interaction, VoiceChannel } from "discord.js";

import { guiManager } from "@dynamico/managers";

import { UIInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

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

    if ( ! interaction.guild ) {
        globalLogger.error( permissionsMiddleware,
            `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - Guild is not available`
        );
        return false;
    }

    const isChannelTypeSupported = ChannelType.GuildVoice === ( interaction.channel as VoiceChannel ).type;

    if ( isChannelTypeSupported ) {
        if ( permissionManager.isSelfAdministratorRole( interaction.guild ) ) {
            return true;
        }

        const requiredUserPermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow,
            requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
            missingPermissions = [
                ... permissionManager.getMissingPermissions( requiredUserPermissions, interaction.channel as VoiceChannel ),
                ... permissionManager.getMissingPermissions( requiredRolePermissions, interaction.guild ),
            ];

        result = ! missingPermissions.length;

        if ( missingPermissions.length ) {
            globalLogger.admin( permissionsMiddleware,
                `🔒 Dynamic Channel missing permissions - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name })`
            );

            globalLogger.log( permissionsMiddleware, `Guild id: '${ interaction.guildId }' - Required permissions:`, missingPermissions );

            await guiManager.get( "Dynamico/UI/NotifyPermissions" ).sendContinues( interaction, {
                botName: interaction.client.user.username,
                permissions: missingPermissions,
            } );
        }
    } else if ( interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu() ) {
        return permissionManager.validateAdminPermission( interaction, permissionsMiddleware );
    } else {
        const type = ( interaction as Interaction ).type || "unknown";
        globalLogger.warn( permissionsMiddleware,
            `Unsupported interaction type: '{ ${ type } }'`
        );
    }

    return result;
};
