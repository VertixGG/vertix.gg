import { ChannelType } from "discord.js";

import { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const MAX_TRIGGER_CHANNELS = 10;

export class TriggerChannelsMenu extends UIElementChannelSelectMenu {
    public static getName() {
        return "VertixAI/UI/TriggerChannelsMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "Channels the AI listens to";
    }

    protected async getMinValues(): Promise<number | undefined> {
        return 0;
    }

    protected async getMaxValues(): Promise<number | undefined> {
        return MAX_TRIGGER_CHANNELS;
    }

    protected async getChannelTypes(): Promise<ChannelType[]> {
        return [ ChannelType.GuildText ];
    }

    /** Only MESSAGE_IN_CHANNEL consults this list, so it is dead weight otherwise. */
    protected async isDisabled(): Promise<boolean> {
        const events = this.uiArgs?.enabledEvents;

        return ! ( Array.isArray( events ) && events.includes( "MESSAGE_IN_CHANNEL" ) );
    }
}
