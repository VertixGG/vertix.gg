import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import {
    DynamicChannelPermissionsAccessEmbed
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class DynamicChannelPermissionsDeniedEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userDeniedDisplayName: uiUtilsWrapAsTemplate( "userDeniedDisplayName" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsDeniedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return Colors.Red;
    }

    protected getTitle() {
        return "👎  Access canceled";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsDeniedEmbed.vars.userDeniedDisplayName }** successfully revoked and no longer has access to this channel!\n` +
        super.getDescription();
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userDeniedDisplayName = args.userDeniedDisplayName;

        return result;
    }
}
