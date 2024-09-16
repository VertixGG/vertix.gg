import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";

import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";

import { SetupStep3Embed } from "@vertix.gg/bot/src/ui/v2/setup-new/step-3/setup-step-3-embed";

export class SetupStep3Component extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/SetupStep3Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ VerifiedRolesMenu ],
            [ VerifiedRolesEveryoneSelectMenu ],
        ];
    }

    public static getEmbeds() {
        return [
            SetupStep3Embed,
        ];
    }

}
