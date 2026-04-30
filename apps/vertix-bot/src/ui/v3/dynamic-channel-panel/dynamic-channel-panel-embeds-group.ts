import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelPanelEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel-panel/dynamic-channel-panel-embed";

class DynamicChannelPanelEmbedsGroup extends UIEmbedsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPanel/EmbedsGroup";
    }

    public static getItems() {
        return [ DynamicChannelPanelEmbed ];
    }
}

export { DynamicChannelPanelEmbedsGroup };
