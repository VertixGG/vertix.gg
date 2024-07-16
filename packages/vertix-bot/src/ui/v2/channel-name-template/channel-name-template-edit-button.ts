import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

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
