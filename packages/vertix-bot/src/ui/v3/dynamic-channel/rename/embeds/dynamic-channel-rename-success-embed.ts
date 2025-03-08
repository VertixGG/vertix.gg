import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelRenameSuccessEmbed extends UIEmbedBase {
    private static vars = {
        channelName: uiUtilsWrapAsTemplate("channelName")
    };

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRenameSuccessEmbed";
    }

    protected getColor(): number {
        return 0xe8ae08; // Pencil like.
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle(): string {
        return `✏️  Your channel's name has changed to '${DynamicChannelRenameSuccessEmbed.vars.channelName}'`;
    }

    protected getLogic(args: UIArgs) {
        return {
            channelName: args.channelName
        };
    }
}
