import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class ServerOptionsEditButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/SetupServerOptionsEditButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Edit Server Options" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected async getEmoji(): Promise<string> {
        return "⚙️";
    }
}
