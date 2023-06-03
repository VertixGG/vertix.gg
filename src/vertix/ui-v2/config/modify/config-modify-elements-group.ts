import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

import { TemplateModifyButton } from "@vertix/ui-v2/template/template-modify-button";
import { ConfigModifyButtonsButton } from "@vertix/ui-v2/config/modify/config-modify-buttons-button";
import { DoneButton } from "@vertix/ui-v2/_general/done-button";

export class ConfigModifyElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/ConfigModifyElementsGroup";
    }

    public static getItems() {
        return [
            [ TemplateModifyButton, ConfigModifyButtonsButton ],
            [ DoneButton ],
        ];
    }
}
