import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/dynamic-channel-component";

import { DynamicChannelPanelEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel-panel/dynamic-channel-panel-embed";

export class DynamicChannelPanelComponent extends DynamicChannelComponent {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPanel";
    }

    protected static getEmbeds() {
        return [ DynamicChannelPanelEmbed ];
    }
}
