import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { NoButton } from "@vertix.gg/bot/src/ui/general/decision/no-button";
import { YesButton } from "@vertix.gg/bot/src/ui/general/decision/yes-button";

export class YesNoElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-General/YesNoElementsGroup";
    }

    public static getItems() {
        return [
            [ YesButton, NoButton ],
        ];
    }
}
