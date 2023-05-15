import {
    ChannelType,
    EmbedBuilder,
    Interaction,
    VoiceChannel
} from "discord.js";

import { PermissionsManager } from "@dynamico/managers/permissions";
import { GUIManager } from "@dynamico/managers/gui";

import { UIInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

import GlobalLogger from "@dynamico/global-logger";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS
} from "@dynamico/constants/master-channel";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

const globalLogger = GlobalLogger.$;

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
        if ( PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
            return true;
        }

        const requiredUserPermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow,
            requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
            missingPermissions = [
                ... PermissionsManager.$.getMissingPermissions( requiredUserPermissions, interaction.channel as VoiceChannel ),
                ... PermissionsManager.$.getMissingPermissions( requiredRolePermissions, interaction.guild ),
            ];

        result = ! missingPermissions.length;

        if ( missingPermissions.length ) {
            globalLogger.admin( permissionsMiddleware,
                `🔐 Dynamic Channel missing permissions - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild?.memberCount })`
            );

            globalLogger.log( permissionsMiddleware, `Guild id: '${ interaction.guildId }' - Required permissions:`, missingPermissions );

            await GUIManager.$.get( "Dynamico/UI/NotifyPermissions" ).sendContinues( interaction, {
                botName: interaction.client.user.username,
                permissions: missingPermissions,
            } );
        }
    } else if ( interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu() ) {
        const result = PermissionsManager.$.hasMemberAdminPermission( interaction, permissionsMiddleware );

        if ( ! result ) {
            const embed = new EmbedBuilder();

            embed.setTitle( "🤷 Oops, something wrong" );
            embed.setDescription( "You don't have the permissions to perform this action." );
            embed.setColor( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );

            await interaction.reply( {
                embeds: [ embed ],
                ephemeral: true,
            } ).catch( ( e ) => {
                globalLogger.warn( permissionsMiddleware, "", e );
            } );
        }

        return result;
    } else {
        const type = ( interaction as Interaction ).type || "unknown";
        globalLogger.warn( permissionsMiddleware,
            `Unsupported interaction type: '{ ${ type } }'`
        );
    }

    return result;
};
