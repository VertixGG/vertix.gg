import { ChannelType } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { DEFAULT_EVENTS_CHANNEL_BOT_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type { Guild, MessageComponentInteraction } from "discord.js";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

/**
 * Function getMissingEventsChannelPermissions() :: What the bot lacks to post in a channel Events
 * would use, or null when the channel is not a text channel it could use at all.
 */
export function getMissingEventsChannelPermissions( guild: Guild, channelId: string ) {
    const channel = guild.channels.cache.get( channelId );

    if ( ! channel || ChannelType.GuildText !== channel.type ) {
        return null;
    }

    return PermissionsManager.$.getMissingChannelPermissionsForBot( channel, DEFAULT_EVENTS_CHANNEL_BOT_PERMISSIONS );
}

/**
 * Function refuseUnwritableEventsChannel() :: Tell the admin, and answer true, when the bot could
 * not post in the channel they are about to give Events.
 *
 * The channel is theirs, so nothing grants the bot anything there. Saying so at the pick - and not
 * saving it - beats every board failing in silence from then on.
 */
export async function refuseUnwritableEventsChannel( interaction: MessageComponentInteraction<"cached">, channelId: string ) {
    const missingPermissions = getMissingEventsChannelPermissions( interaction.guild, channelId );

    if ( ! missingPermissions?.length ) {
        return false;
    }

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )
        ?.ephemeral( interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username
        } );

    return true;
}
