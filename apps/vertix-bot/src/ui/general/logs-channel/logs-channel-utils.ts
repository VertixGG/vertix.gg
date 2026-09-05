import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType } from "discord.js";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { DEFAULT_LOGS_CHANNEL_BOT_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { UIDefaultStringSelectMenuChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Function warnOnMissingLogsChannelPermissions() :: Tells the admin when the bot cannot post to the
 * logs channel they just picked.
 *
 * That channel belongs to them, not to the bot, so nothing grants the bot anything there and
 * writing overwrites into it would be intrusive. Saying so at the moment of the pick beats letting
 * logging fail in silence from then on.
 */
export async function warnOnMissingLogsChannelPermissions(
    interaction: UIDefaultStringSelectMenuChannelTextInteraction,
    channelId: string | null
) {
    if ( ! channelId ) {
        return;
    }

    const logsChannel = interaction.guild.channels.cache.get( channelId );

    // Threads carry no overwrites of their own; only a real guild channel can be checked.
    if ( ! logsChannel || logsChannel.type !== ChannelType.GuildText ) {
        return;
    }

    const missingPermissions = PermissionsManager.$.getMissingChannelPermissionsForBot(
        logsChannel,
        DEFAULT_LOGS_CHANNEL_BOT_PERMISSIONS
    );

    if ( ! missingPermissions.length ) {
        return;
    }

    GlobalLogger.$.admin(
        warnOnMissingLogsChannelPermissions,
        `🔐 Logs channel missing permissions - "${ missingPermissions.join( ", " ) }" ` +
            `(${ interaction.guild.name }) (${ interaction.guild.memberCount })`
    );

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )
        ?.ephemeral( interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username
        } );
}
