import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsStateButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsStateButton";
    }

    public getId() {
        return "state";
    }

    public static getSortId() {
        return 4;
    }

    public getLabelForEmbed() {
        return "🚫 ∙ **Private** / 🌐 ∙ **Public**";
    }

    public async getLabelForMenu() {
        return "Public/Private";
    }

    public async getLabel() {
        return uiUtilsWrapAsTemplate("displayText");
    }

    public async getEmoji() {
        return this.uiArgs?.isPrivate ? "🌐" : "🚫";
    }

    public getEmojiForEmbed(): string {
        return "(🚫 / 🌐)";
    }

    protected getOptions() {
        return {
            publicText: "Public",
            privateText: "Private"
        };
    }

    protected async getLogic() {
        const result: any = {};

        if (this.uiArgs?.isPrivate) {
            result.displayText = uiUtilsWrapAsTemplate("publicText");
        } else {
            result.displayText = uiUtilsWrapAsTemplate("privateText");
        }

        return result;
    }
}
