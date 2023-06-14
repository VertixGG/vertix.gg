import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { ButtonsSelectMenu } from "@vertix/ui-v2/buttons/buttons-select-menu";
import { SetupStep2Embed } from "@vertix/ui-v2/setup-new/step-2/setup-step-2-embed";
import { ConfigExtrasSelectMenu } from "@vertix/ui-v2/config-extras/config-extras-select-menu";

export class SetupStep2Component extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/SetupStep2Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ ButtonsSelectMenu ],
            [ ConfigExtrasSelectMenu ],
        ];
    }

    public static getEmbeds() {
        return [
            SetupStep2Embed,
        ];
    }

    public static getModals() {
        return [];
    }
}
