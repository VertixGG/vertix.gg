import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelClearChatButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-button";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend(
    DynamicChannelEmbedBase,
    new UIEmbedVars(
        "ownerDisplayName",
        "totalMessages",

        "clearEmoji"
    )
);

export class DynamicChannelClearChatSuccessEmbed extends DynamicChannelEmbedBaseWithVars {
    public static getName(): string {
        return "Vertix/UI-V3/DynamicChannelClearChatSuccessEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: change to static.
    }

    protected getTitle(): string {
        return `${this.vars.get("clearEmoji")}  Chat was cleared the by ${this.vars.get("ownerDisplayName")}!`;
    }

    protected getDescription(): string {
        return `Total of ${this.vars.get("totalMessages")} messages.`;
    }

    protected getLogic(args: UIArgs) {
        return {
            clearEmoji: DynamicChannelClearChatButton.getEmoji(),
            ownerDisplayName: args.ownerDisplayName,
            totalMessages: args.totalMessages
        };
    }
}
