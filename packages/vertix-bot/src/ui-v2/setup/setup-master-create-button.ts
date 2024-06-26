import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class SetupMasterCreateButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupMasterCreateButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Create Master Channel" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getEmoji(): Promise<string> {
        return "➕";
    }
}
