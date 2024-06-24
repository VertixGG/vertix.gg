import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class ChannelNameTemplateEditButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/ChannelNameTemplateEditButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getLabel() {
        return "Edit Channel Name";
    }

    protected async getEmoji(): Promise<string> {
        return "#️⃣";
    }
}
