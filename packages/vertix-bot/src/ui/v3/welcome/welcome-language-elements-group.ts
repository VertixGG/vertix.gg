import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui/v3/language/language-select-menu";
import { DoneButton } from "@vertix.gg/bot/src/ui/v3/_general/done-button";

export class WelcomeLanguageElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V3/WelcomeLanguageElementsGroup";
    }

    public static getItems() {
        return [
            [ LanguageSelectMenu ],
            [ DoneButton ],
        ];
    }
}
