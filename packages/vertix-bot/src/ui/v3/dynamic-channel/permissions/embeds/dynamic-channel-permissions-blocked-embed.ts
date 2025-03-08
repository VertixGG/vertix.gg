import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPermissionsAccessEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsBlockedEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userBlockedDisplayName: uiUtilsWrapAsTemplate("userBlockedDisplayName")
    };

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsBlockedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "🫵  User blocked";
    }

    protected getDescription(): string {
        return (
            `**${DynamicChannelPermissionsBlockedEmbed.vars.userBlockedDisplayName}** successfully blocked and no longer has access to this channel!\n` +
            super.getDescription()
        );
    }

    protected getLogic(args: UIArgs) {
        const result = super.getLogic(args);

        result.userBlockedDisplayName = args.userBlockedDisplayName;

        return result;
    }
}
