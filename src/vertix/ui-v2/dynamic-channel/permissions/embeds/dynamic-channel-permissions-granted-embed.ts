import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import {
    DynamicChannelPermissionsAccessEmbed
} from "@vertix/ui-v2/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

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
