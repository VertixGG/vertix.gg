import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType } from "discord.js";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { DEFAULT_LFM_CHANNEL_BOT_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { UIDefaultStringSelectMenuChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

export async function warnOnMissingLfmChannelsPermissions(
    interaction: UIDefaultStringSelectMenuChannelTextInteraction,
    channelIds: string[]
) {
    if ( ! channelIds.length ) {
        return;
    }

    const missingPermissions = new Set<string>();

    channelIds.forEach( ( channelId ) => {
        const lfmChannel = interaction.guild.channels.cache.get( channelId );

        if ( ! lfmChannel || lfmChannel.type !== ChannelType.GuildText ) {
            return;
        }

        PermissionsManager.$.getMissingChannelPermissionsForBot(
            lfmChannel,
            DEFAULT_LFM_CHANNEL_BOT_PERMISSIONS
        ).forEach( ( permission ) => missingPermissions.add( permission ) );
    } );

    if ( ! missingPermissions.size ) {
        return;
    }

    const missing = [ ...missingPermissions ];

    GlobalLogger.$.admin(
        warnOnMissingLfmChannelsPermissions,
        `🔐 LFM channels missing permissions - "${ missing.join( ", " ) }" ` +
            `(${ interaction.guild.name }) (${ interaction.guild.memberCount })`
    );

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )
        ?.ephemeral( interaction, {
            missingPermissions: missing,
            omitterDisplayName: interaction.guild.client.user.username
        } );
}
