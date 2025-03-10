import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPermissionsAccessEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsDeniedEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userDeniedDisplayName: uiUtilsWrapAsTemplate( "userDeniedDisplayName" )
    };

    public static getName () {
        return "Vertix/UI-V3/DynamicChannelPermissionsDeniedEmbed";
    }

    public static getInstanceType (): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle () {
        return "👎  Access canceled";
    }

    protected getDescription (): string {
        return (
            `**${ DynamicChannelPermissionsDeniedEmbed.vars.userDeniedDisplayName }** successfully revoked and no longer has access to this channel!\n` +
            super.getDescription()
        );
    }

    protected getLogic ( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userDeniedDisplayName = args.userDeniedDisplayName;

        return result;
    }
}
