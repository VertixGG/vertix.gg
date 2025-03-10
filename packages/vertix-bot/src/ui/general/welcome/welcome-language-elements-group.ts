import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui/general/language/language-select-menu";

export class WelcomeLanguageElementsGroup extends UIElementsGroupBase {
    public static getName () {
        return "VertixBot/UI-General/WelcomeLanguageElementsGroup";
    }

    public static getItems () {
        return [ [ LanguageSelectMenu ], [ DoneButton ] ];
    }
}
