import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelMetaClearChatSuccessEmbed extends UIEmbedBase {
    private static vars = {
        ownerDisplayName: uiUtilsWrapAsTemplate( "ownerDisplayName" ),
        totalMessages: uiUtilsWrapAsTemplate( "totalMessages" ),
    };

    public static getName(): string {
        return "Vertix/UI-V2/DynamicChannelMetaClearChatSuccessEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: change to static.
    }

    protected getColor(): number {
        return 0xC5AC63; // Broom like.
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
            totalMessages: args.totalMessages,
        };
    }
}
