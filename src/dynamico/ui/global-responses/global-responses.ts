import { Interaction, NonThreadGuildBasedChannel } from "discord.js";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import Embed from "@dynamico/ui/global-responses/embed";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

export class GlobalResponse extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/GlobalResponse";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel, args?: any ) {
        return [ new Embed ];
    }

    protected getInternalComponents() {
        return [];
    }
}

export default GlobalResponse;
