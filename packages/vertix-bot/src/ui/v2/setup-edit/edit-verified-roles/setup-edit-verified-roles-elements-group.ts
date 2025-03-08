import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";
import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

export class SetupEditVerifiedRolesElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/SetupEditVerifiedRolesElementsGroup";
    }

    public static getItems() {
        const uiService = ServiceLocator.$.get<UIService>("VertixGUI/UIService");

        const { WizardBackButton, WizardFinishButton } = uiService.$$.getSystemElements();

        return [[VerifiedRolesMenu], [VerifiedRolesEveryoneSelectMenu], [WizardBackButton!, WizardFinishButton!]];
    }
}
