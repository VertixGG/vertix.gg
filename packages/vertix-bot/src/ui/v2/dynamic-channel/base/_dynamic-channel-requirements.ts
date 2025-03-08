import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS } from "@vertix.gg/bot/src/definitions/master-channel";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

export const dynamicChannelRequirements = async (interaction: UIAdapterReplyContext) => {
    if (!interaction.channel) {
        return false;
    }

    const dynamicChannelDB = await ChannelModel.$.getByChannelId(interaction.channel.id);

    if (!dynamicChannelDB) {
        return false;
    }

    const uiService = ServiceLocator.$.get<UIService>("VertixGUI/UIService");

    if (interaction.user.id !== dynamicChannelDB.userOwnerId) {
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId(dynamicChannelDB.channelId);

        if (!masterChannelDB) {
            return false;
        }

        await uiService.get("Vertix/UI-V2/NotYourChannelAdapter")?.ephemeral(interaction, {
            masterChannelId: masterChannelDB.channelId
        });

        return false;
    }

    if (PermissionsManager.$.isSelfAdministratorRole(interaction.guild)) {
        return true;
    }

    const requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
        missingPermissions = [
            ...PermissionsManager.$.getMissingPermissions(requiredRolePermissions, interaction.guild)
        ];

    const result = !missingPermissions.length;

    if (missingPermissions.length) {
        GlobalLogger.$.admin(
            dynamicChannelRequirements,
            `🔐 Dynamic Channel missing permissions - "${missingPermissions.join(", ")}" (${interaction.guild.name}) (${interaction.guild.memberCount})`
        );

        GlobalLogger.$.log(
            dynamicChannelRequirements,
            `Guild id: '${interaction.guildId}' - Required permissions:`,
            missingPermissions
        );

        await uiService.get("VertixGUI/InternalAdapters/MissingPermissionsAdapter")?.ephemeral(interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username
        });
    }

    return result;
};
