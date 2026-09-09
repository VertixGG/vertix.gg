import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

import type { IRequireId } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/require-id";

export interface IOwnedChannelOption {
    id: string;
    name: string;
}

export class DynamicChannelInviteChannelMenu extends UIElementStringSelectMenu implements IRequireId {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelInviteChannelMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId() {
        return "invite-channel";
    }

    protected async getPlaceholder() {
        return "📨 Select Channel";
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const channels = ( this.uiArgs?.ownedChannels ?? [] ) as IOwnedChannelOption[];

        return channels.map( ( channel ) => ( {
            label: channel.name,
            value: channel.id
        } ) );
    }
}
