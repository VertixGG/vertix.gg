import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

export interface IClaimableChannelOption {
    id: string;
    name: string;
    memberCount: number;
}

export class ClaimCommandChannelMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/ClaimCommandChannelMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId() {
        return "claim-channel";
    }

    protected async getPlaceholder() {
        return "👑 ∙ Select a channel";
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const channels = ( this.uiArgs?.claimableChannels ?? [] ) as IClaimableChannelOption[];

        return channels.map( ( channel ) => ( {
            label: channel.name,
            value: channel.id,
            description: 1 === channel.memberCount
                ? "1 member inside"
                : `${ channel.memberCount } members inside`
        } ) );
    }
}
