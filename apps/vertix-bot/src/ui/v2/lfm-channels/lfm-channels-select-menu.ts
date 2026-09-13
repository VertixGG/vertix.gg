import { ChannelType } from "discord.js";

import { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DYNAMIC_CHANNEL_LFM_LIMITS } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

export class LfmChannelsSelectMenu extends UIElementChannelSelectMenu {
    public static getName() {
        return "VertixBot/UI-V2/LfmChannelsSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🔎 ∙ LFM-Channels";
    }

    protected async getMinValues(): Promise<number | undefined> {
        return 0;
    }

    protected async getMaxValues(): Promise<number | undefined> {
        return DYNAMIC_CHANNEL_LFM_LIMITS.MAX_CHANNELS;
    }

    protected async getChannelTypes(): Promise<ChannelType[]> {
        return [ ChannelType.GuildText ];
    }

    /**
     * What this generator already has saved, so the menu opens showing it rather than empty -
     * an empty menu beside an embed listing the current picks reads as though nothing is set.
     */
    protected async getDefaultValues() {
        const ids = this.uiArgs?.dynamicChannelLfmChannelIds;

        return Array.isArray( ids ) ? ids as string[] : [];
    }
}
