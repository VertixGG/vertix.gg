import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

import { UIWizardBackButton } from "@vertix.gg/bot/src/ui-v2/_base/wizard/ui-wizard-back-button";
import { UIWizardFinishButton } from "@vertix.gg/bot/src/ui-v2/_base/wizard/ui-wizard-finish-button";

import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui-v2/verified-roles/verified-roles-menu";
import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui-v2/verified-roles/verified-roles-everyone-select-menu";

export class SetupEditVerifiedRolesElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditVerifiedRolesElementsGroup";
    }

    public static getItems() {
        return [
            [ VerifiedRolesMenu ],
            [ VerifiedRolesEveryoneSelectMenu ],
            [ UIWizardBackButton, UIWizardFinishButton ],
        ];
    }
}
