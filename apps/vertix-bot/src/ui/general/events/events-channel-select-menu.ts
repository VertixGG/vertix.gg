import { ChannelType } from "discord.js";

import { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class EventsChannelSelectMenu extends UIElementChannelSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/EventsChannelSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "📅 ∙ Events-Channel";
    }

    protected async getMinValues(): Promise<number | undefined> {
        return 0;
    }

    protected async getMaxValues(): Promise<number | undefined> {
        return 1;
    }

    protected async getChannelTypes(): Promise<ChannelType[]> {
        return [ ChannelType.GuildText ];
    }

    /**
     * The channel already picked, so the menu opens showing it rather than empty beside a screen
     * that names it.
     */
    protected async getDefaultValues() {
        const channelId = this.uiArgs?.eventsChannelId;

        return "string" === typeof channelId ? [ channelId ] : [];
    }
}
