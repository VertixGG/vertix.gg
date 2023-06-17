import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

import { DoneButton } from "@vertix/ui-v2/_general/done-button";

import { ConfigExtrasSelectMenu } from "@vertix/ui-v2/config-extras/config-extras-select-menu";

import { SetupEditSelectEditOptionMenu } from "@vertix/ui-v2/setup-edit/setup-edit-select-edit-option-menu";

export class SetupEditElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/SetupEditElementsGroup";
    }

    public static getItems() {
        return [
            [ SetupEditSelectEditOptionMenu ],
            [ ConfigExtrasSelectMenu ],
            [ DoneButton ],
        ];
    }
}
