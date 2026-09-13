import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelLfmPostEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/embeds/dynamic-channel-lfm-post-embed";

export class DynamicChannelLfmPostComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelLfmPostComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected static getElements() {
        return [];
    }

    protected static getEmbeds() {
        return [ DynamicChannelLfmPostEmbed ];
    }
}
