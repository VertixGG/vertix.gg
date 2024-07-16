import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { UIWizardBackButton } from "@vertix.gg/bot/src/ui/v3/_general/wizard/ui-wizard-back-button";
import { UIWizardFinishButton } from "@vertix.gg/bot/src/ui/v3/_general/wizard/ui-wizard-finish-button";

import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/v3/verified-roles/verified-roles-menu";
import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/v3/verified-roles/verified-roles-everyone-select-menu";

export class SetupEditVerifiedRolesElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V3/SetupEditVerifiedRolesElementsGroup";
    }

    public static getItems() {
        return [
            [ VerifiedRolesMenu ],
            [ VerifiedRolesEveryoneSelectMenu ],
            [ UIWizardBackButton, UIWizardFinishButton ],
        ];
    }
}
