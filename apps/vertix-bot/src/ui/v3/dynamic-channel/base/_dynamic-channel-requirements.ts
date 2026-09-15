import { ChannelModel, MASTER_INTERNAL_TYPES } from "@vertix.gg/data/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType } from "discord.js";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS } from "@vertix.gg/bot/src/definitions/master-channel";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import { resolveMasterChannelId } from "@vertix.gg/bot/src/utils/master-channel";

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
        await uiService.get( "VertixBot/UI-General/NoActiveDynamicChannelAdapter" )?.ephemeral( interaction, {
            masterChannelId: await resolveMasterChannelId( interaction )
        } );

        return false;
    }

    const dynamicChannelDB = await ChannelModel.$.getByChannelId( resolvedChannel.id );

    // A generator is a voice channel too, and carries a row of its own - so standing in its chat
    // and asking for something looked, to a check that only asked whether a row existed, exactly
    // like standing in a channel it had made. Whoever created the generator even passed the owner
    // check below it, because a master's row names them.
    //
    // Asked as "is this a generator" rather than "is this a dynamic channel", deliberately. The
    // column defaults to `DEFAULT_CHANNEL`, so a row written before it meant anything says nothing
    // about what it is - and demanding it say `DYNAMIC_CHANNEL` would have turned every button on
    // every such channel into "no active dynamic channel". Only what is provably a generator is
    // refused.
    const isMasterChannel = dynamicChannelDB
        ? MASTER_INTERNAL_TYPES.includes( dynamicChannelDB.internalType )
        : false;

    if ( !dynamicChannelDB || isMasterChannel ) {
        await uiService.get( "VertixBot/UI-General/NoActiveDynamicChannelAdapter" )?.ephemeral( interaction, {
            masterChannelId: await resolveMasterChannelId( interaction )
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

    return dynamicChannelBotPermissionsRequirements( interaction );
};

/**
 * Function dynamicChannelBotPermissionsRequirements() :: Whether the bot itself can act in the
 * guild at all.
 *
 * Split out of `dynamicChannelRequirements()` because an entity that gates itself still has to
 * clear this - what such an entity does not want is the channel resolution and the owner check
 * above it, which assume the presser is standing in a channel they own. `Knock` is pressed by
 * someone who owns nothing, and `Invite` from a panel is pressed by an owner standing nowhere.
 */
export const dynamicChannelBotPermissionsRequirements = async( interaction: UIAdapterReplyContext ) => {
    if ( PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
        return true;
    }

    const requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
        missingPermissions = [
            ...PermissionsManager.$.getMissingPermissions( requiredRolePermissions, interaction.guild )
        ];

    if ( ! missingPermissions.length ) {
        return true;
    }

    GlobalLogger.$.admin(
        dynamicChannelBotPermissionsRequirements,
        `🔐 Dynamic Channel missing permissions - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild.memberCount })`
    );

    GlobalLogger.$.log(
        dynamicChannelBotPermissionsRequirements,
        `Guild id: '${ interaction.guildId }' - Required permissions:`,
        missingPermissions
    );

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )
        ?.ephemeral( interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username
        } );

    return false;
};
