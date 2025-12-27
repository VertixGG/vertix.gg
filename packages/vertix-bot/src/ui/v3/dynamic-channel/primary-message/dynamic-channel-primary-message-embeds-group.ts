import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelPrimaryMessageEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-embed";

class DynamicChannelPrimaryMessageEmbedsGroup extends UIEmbedsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannel/EmbedsGroup";
    }

    public static getItems() {
        return [ DynamicChannelPrimaryMessageEmbed ];
    }
}

export { DynamicChannelPrimaryMessageEmbedsGroup };

