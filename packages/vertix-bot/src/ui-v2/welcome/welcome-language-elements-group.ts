import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui-v2/language/language-select-menu";
import { DoneButton } from "@vertix.gg/bot/src/ui-v2/_general/done-button";

export class WelcomeLanguageElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/WelcomeLanguageElementsGroup";
    }

    public static getItems() {
        return [
            [ LanguageSelectMenu ],
            [ DoneButton ],
        ];
    }
}
