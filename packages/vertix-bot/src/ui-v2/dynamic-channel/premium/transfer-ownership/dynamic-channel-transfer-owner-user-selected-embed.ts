import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class DynamicChannelTransferOwnerUserSelectedEmbed extends UIEmbedBase {
    private static vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" )
    };

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelectedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "🔀  Transfer channel ownership";
    }

    protected getDescription() {
        const { userDisplayName } = DynamicChannelTransferOwnerUserSelectedEmbed.vars;

        return `Transfer channel ownership to ${ userDisplayName }.\n\n` +
            "⚠️ By transferring the channel ownership to another user, you will lose your ownership privileges.\n\n" +
            `Are you sure you want to transfer the channel ownership to **${ userDisplayName }?**`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            userDisplayName: args.userDisplayName,
        };
    }
}
