import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS } from "@vertix.gg/bot/src/definitions/master-channel";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import { ChannelType } from "discord.js";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { VoiceChannel } from "discord.js";

export const dynamicChannelRequirements = async(
    interaction: UIAdapterReplyContext,
    channel?: VoiceChannel | null
) => {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    let resolvedChannel = channel ??
        ( interaction.channel?.type === ChannelType.GuildVoice ? interaction.channel : null );

    if ( !resolvedChannel ) {
        const member = interaction.guild.members.cache.get( interaction.user.id ) ??
            await interaction.guild.members.fetch( interaction.user.id ).catch( () => null );

        const userVoiceChannel = member?.voice.channel;

        if ( userVoiceChannel?.type === ChannelType.GuildVoice ) {
            resolvedChannel = userVoiceChannel;
        }
    }

    if ( !resolvedChannel ) {
        const panelChannelDB = await ChannelModel.$.getByChannelId( interaction.channelId );
        const masterChannelId = panelChannelDB?.ownerChannelId;

        await uiService.get( "VertixBot/UI-General/NoActiveDynamicChannelAdapter" )?.ephemeral( interaction, {
            masterChannelId
        } );

        return false;
    }

    const dynamicChannelDB = await ChannelModel.$.getByChannelId( resolvedChannel.id );

    if ( !dynamicChannelDB ) {
        const panelChannelDB = await ChannelModel.$.getByChannelId( interaction.channelId );
        const masterChannelId = panelChannelDB?.ownerChannelId;

        await uiService.get( "VertixBot/UI-General/NoActiveDynamicChannelAdapter" )?.ephemeral( interaction, {
            masterChannelId
        } );

        return false;
    }

    if ( interaction.user.id !== dynamicChannelDB.userOwnerId ) {
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( dynamicChannelDB.channelId );

        if ( !masterChannelDB ) {
            return false;
        }

        await uiService.get( "VertixBot/UI-General/NotYourChannelAdapter" )?.ephemeral( interaction, {
            masterChannelId: masterChannelDB.channelId
        } );

        return false;
    }

    if ( PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
        return true;
    }

    const requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
        missingPermissions = [
            ...PermissionsManager.$.getMissingPermissions( requiredRolePermissions, interaction.guild )
        ];

    const result = !missingPermissions.length;

    if ( missingPermissions.length ) {
        GlobalLogger.$.admin(
            dynamicChannelRequirements,
            `🔐 Dynamic Channel missing permissions - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild.memberCount })`
        );

        GlobalLogger.$.log(
            dynamicChannelRequirements,
            `Guild id: '${ interaction.guildId }' - Required permissions:`,
            missingPermissions
        );

        await uiService.get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )?.ephemeral( interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username
        } );
    }

    return result;
};
