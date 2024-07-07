import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelMetaRenameSuccessEmbed extends UIEmbedBase {
    private static vars = {
        channelName: uiUtilsWrapAsTemplate( "channelName" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaRenameSuccessEmbed";
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
