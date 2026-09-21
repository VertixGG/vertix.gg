import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { HelpGuideButton } from "@vertix.gg/bot/src/ui/general/help/help-guide-button";
import { HelpSupportButton } from "@vertix.gg/bot/src/ui/general/help/help-support-button";

export class HelpElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-General/HelpElementsGroup";
    }

    // Both are links. A link button is drawn by discord and pressed without ever reaching the bot,
    // so the screen keeps working whatever the bot was or was not granted.
    public static getItems() {
        return [
            [ HelpGuideButton, HelpSupportButton ]
        ];
    }
}
