import { ChannelType } from "discord.js";

import { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class AIAgentChannelSelectMenu extends UIElementChannelSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/AIAgentChannelSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "Select a channel";
    }

    protected async getMinValues(): Promise<number | undefined> {
        return 1;
    }

    protected async getChannelTypes(): Promise<ChannelType[]> {
        return [ ChannelType.GuildText ];
    }
}

