import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
} from "@vertix.gg/bot/src/definitions/master-channel";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { UIAdapterReplyContext } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";
import type { UIAdapterService } from "@vertix.gg/bot/src/ui-v2/ui-adapter-service";

export const dynamicChannelRequirements = async ( interaction: UIAdapterReplyContext ) => {
    if ( ! interaction.channel )  {
        return false;
    }

    const dynamicChannelDB = await ChannelModel.$.getByChannelId(
        interaction.channel.id
    );

    if ( ! dynamicChannelDB ) {
        return false;
    }

    const uiAdapterService = ServiceLocator.$.get<UIAdapterService>( "VertixBot/UI-V2/UIAdapterService" );

    if ( interaction.user.id !== dynamicChannelDB.userOwnerId ) {
        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( dynamicChannelDB.channelId );

        if ( ! masterChannelDB ) {
            return false;
        }

        await uiAdapterService.get( "VertixBot/UI-V2/NotYourChannelAdapter" )?.ephemeral( interaction, {
            masterChannelId: masterChannelDB.channelId,
        } );

        return false;
    }

    if ( PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
        return true;
    }

    const requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
        missingPermissions = [
            ... PermissionsManager.$.getMissingPermissions( requiredRolePermissions, interaction.guild ),
        ];

    const result = ! missingPermissions.length;

    if ( missingPermissions.length ) {
        GlobalLogger.$.admin( dynamicChannelRequirements,
            `🔐 Dynamic Channel missing permissions - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild.memberCount })`
        );

        GlobalLogger.$.log( dynamicChannelRequirements, `Guild id: '${ interaction.guildId }' - Required permissions:`, missingPermissions );

        await uiAdapterService.get( "VertixBot/UI-V2/MissingPermissionsAdapter" )?.ephemeral( interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username,
        } );
    }

    return result;
};
