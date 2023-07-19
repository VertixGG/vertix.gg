import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class DynamicChannelMetaRenameSuccessEmbed extends UIEmbedBase {
    private static vars = {
        channelName: uiUtilsWrapAsTemplate( "channelName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaRenameSuccessEmbed";
    }

    protected getColor(): number {
        return 0xE8AE08; // Pencil like.
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle(): string {
        return `✏️  Your channel's name has changed to '${ DynamicChannelMetaRenameSuccessEmbed.vars.channelName }'`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            channelName: args.channelName,
        };
    }
}
