import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { ConfigSelectMasterMenu } from "@vertix/ui-v2/config/select/config-select-master-menu";

export class ConfigSelectElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/ConfigElementsSelectGroup";
    }

    public static getItems() {
        return [
            [ ConfigSelectMasterMenu ],
        ];
    }
}
