import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import {
    DynamicChannelPermissionsAccessEmbed
} from "@vertix/ui-v2/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class DynamicChannelPermissionsBlockedEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userBlockedDisplayName: uiUtilsWrapAsTemplate( "userBlockedDisplayName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsBlockedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return Colors.DarkRed;
    }

    protected getTitle() {
        return "🫵  User blocked";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsBlockedEmbed.vars.userBlockedDisplayName }** successfully blocked and no longer has access to this channel!\n` +
            super.getDescription();
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userBlockedDisplayName = args.userBlockedDisplayName;

        return result;
    }
}
