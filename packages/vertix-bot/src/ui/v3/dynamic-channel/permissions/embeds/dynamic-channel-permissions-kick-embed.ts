import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    DynamicChannelPermissionsAccessEmbed
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsKickEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userKickedDisplayName: uiUtilsWrapAsTemplate( "userKickedDisplayName" ),
    };

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsKickEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "👢  User kicked";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsKickEmbed.vars.userKickedDisplayName }** successfully kicked!\n` +
            super.getDescription();
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userKickedDisplayName = args.userKickedDisplayName;

        return result;
    }
}
