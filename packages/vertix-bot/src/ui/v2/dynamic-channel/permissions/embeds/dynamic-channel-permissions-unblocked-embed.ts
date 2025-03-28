import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPermissionsAccessEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsUnblockedEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userUnBlockedDisplayName: uiUtilsWrapAsTemplate( "userUnBlockedDisplayName" )
    };

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsUnblockedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return Colors.Yellow;
    }

    protected getTitle() {
        return "🤙  User unblocked";
    }

    protected getDescription(): string {
        return (
            `**${ DynamicChannelPermissionsUnblockedEmbed.vars.userUnBlockedDisplayName }** successfully un-blocked!\n` +
            super.getDescription()
        );
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userUnBlockedDisplayName = args.userUnBlockedDisplayName;

        return result;
    }
}
