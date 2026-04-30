import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-component";

import { DynamicChannelPanelEmbedsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel-panel/dynamic-channel-panel-embeds-group";

export class DynamicChannelPanelComponent extends DynamicChannelComponent {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPanel";
    }

    public static getEmbedsGroups() {
        return [ DynamicChannelPanelEmbedsGroup ];
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-V3/DynamicChannelPanel/EmbedsGroup";
    }
}
