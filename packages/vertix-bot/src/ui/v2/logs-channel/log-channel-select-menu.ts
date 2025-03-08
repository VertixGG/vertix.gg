import { ChannelType } from "discord.js";

import { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class LogChannelSelectMenu extends UIElementChannelSelectMenu {
    public static getName() {
        return "Vertix/UI-V2/LogChannelSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "❯❯ ∙ Logs-Channel";
    }

    protected async getMinValues(): Promise<number | undefined> {
        return 0;
    }

    protected async getChannelTypes(): Promise<ChannelType[]> {
        return [ChannelType.GuildText];
    }
}
