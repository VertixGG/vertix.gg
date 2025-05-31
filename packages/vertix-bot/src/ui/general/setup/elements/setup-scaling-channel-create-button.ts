import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingChannelCreateButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingChannelCreateButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Create Master Scaling Channel" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected isDisabled(): Promise<boolean> {
        return Promise.resolve( true );
    }

    protected async getEmoji(): Promise<string> {
        return "➕";
    }
}
