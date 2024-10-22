import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

import { NoButton } from "@vertix.gg/bot/src/ui-v2/_general/no-button";
import { YesButton } from "@vertix.gg/bot/src/ui-v2/_general/yes-button";

export class YesNoElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V2/YesNoElementsGroup";
    }

    public static getItems() {
        return [
            [ YesButton, NoButton ],
        ];
    }
}
