import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsAccessButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsAccessButton";
    }

    public getId() {
        return 5;
    }

    public getSortId() {
        return 5;
    }

    public getLabelForEmbed() {
        return "👥 ∙ **Access**";
    }

    public async getLabelForMenu() {
        return "Access";
    }

    public async getLabel() {
        return this.getLabelForMenu();
    }

    public async getEmoji() {
        return "👥";
    }

    public getEmojiForEmbed() {
        return "👥";
    }
}
