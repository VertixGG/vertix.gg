import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelMetaClearChatSuccessEmbed extends UIEmbedBase {
    private static vars = {
        ownerDisplayName: uiUtilsWrapAsTemplate( "ownerDisplayName" ),
        totalMessages: uiUtilsWrapAsTemplate( "totalMessages" )
    };

    public static getName(): string {
        return "Vertix/UI-V2/DynamicChannelMetaClearChatSuccessEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: change to static.
    }

    protected getColor(): number {
        return 0xc5ac63; // Broom like.
    }

    protected getTitle(): string {
        return `🧹  Chat was cleared the by ${ DynamicChannelMetaClearChatSuccessEmbed.vars.ownerDisplayName }!`;
    }

    protected getDescription(): string {
        return `Total of ${ DynamicChannelMetaClearChatSuccessEmbed.vars.totalMessages } messages.`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            ownerDisplayName: args.ownerDisplayName,
            totalMessages: args.totalMessages
        };
    }
}
