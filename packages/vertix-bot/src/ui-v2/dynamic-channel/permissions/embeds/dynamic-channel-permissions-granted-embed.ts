import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    DynamicChannelPermissionsAccessEmbed
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsGrantedEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        userGrantedDisplayName: uiUtilsWrapAsTemplate( "userGrantedDisplayName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsGrantedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return 0xF5CF4D; // As the emoji.
    }

    protected getTitle() {
        return "👍  Access granted";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsGrantedEmbed.vars.userGrantedDisplayName }** added successfully and now has access to this channel!\n` +
            super.getDescription();
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userGrantedDisplayName = args.userGrantedDisplayName;

        return result;

    }
}
