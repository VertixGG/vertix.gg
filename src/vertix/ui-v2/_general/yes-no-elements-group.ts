import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

import { NoButton } from "@vertix/ui-v2/_general/no-button";
import { YesButton } from "@vertix/ui-v2/_general/yes-button";

export class YesNoElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/YesNoElementsGroup";
    }

    public static getItems() {
        return [
            [ YesButton, NoButton ],
        ];
    }
}
