import { DynamicChannelStringMenuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-string-menu-base";

import type { APISelectMenuOption } from "discord.js";

export interface ILfmDestinationOption {
    id: string;
    name: string;
    isSuggested?: boolean;
}

export class DynamicChannelLfmChannelMenu extends DynamicChannelStringMenuBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelLfmChannelMenu";
    }

    public getId() {
        return 16;
    }

    protected async getPlaceholder() {
        return "🔎 Select Channel";
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const channels = ( this.uiArgs?.lfmDestinations ?? [] ) as ILfmDestinationOption[];

        return channels.map( ( channel ) => ( {
            label: channel.name,
            value: channel.id,
            default: Boolean( channel.isSuggested )
        } ) );
    }
}
