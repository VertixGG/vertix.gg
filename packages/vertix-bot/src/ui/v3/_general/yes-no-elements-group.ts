import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { NoButton } from "@vertix.gg/bot/src/ui/v3/_general/no-button";
import { YesButton } from "@vertix.gg/bot/src/ui/v3/_general/yes-button";

export class YesNoElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V3/YesNoElementsGroup";
    }

    public static getItems() {
        return [
            [ YesButton, NoButton ],
        ];
    }
}
