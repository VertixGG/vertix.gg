import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { ButtonsSelectMenu } from "@vertix/ui-v2/buttons/buttons-select-menu";
import { DoneButton } from "@vertix/ui-v2/_general/done-button";

export default class ConfigModifyButtonsElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/ConfigModifyButtonsElementsGroup";
    }

    public static getItems() {
        return [
            [ ButtonsSelectMenu ],
            [ DoneButton ],
        ];
    }
}
