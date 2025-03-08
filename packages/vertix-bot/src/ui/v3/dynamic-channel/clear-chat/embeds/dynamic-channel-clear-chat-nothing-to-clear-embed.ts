import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { DynamicChannelClearChatButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-button";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend(DynamicChannelEmbedBase, new UIEmbedVars("clearEmoji"));

export class DynamicChannelClearChatNothingToClearEmbed extends DynamicChannelEmbedBaseWithVars {
    public static getName(): string {
        return "Vertix/UI-V3/DynamicChannelClearChatNothingToClearEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle(): string {
        return `${this.vars.get("clearEmoji")}  There are no messages available to clear`;
    }

    protected getDescription(): string {
        return "Keep in mind, that only non-embeds messages can be deleted.";
    }

    protected getLogic(args: UIArgs) {
        const result = super.getLogic(args);

        result.clearEmoji = DynamicChannelClearChatButton.getEmoji();

        return result;
    }
}
