import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui/general/language/language-select-menu";
import { WelcomeSupportButton } from "@vertix.gg/bot/src/ui/general/welcome/welcome-support-button";
import { WelcomeInviteButton } from "@vertix.gg/bot/src/ui/general/welcome/welcome-invite-button";
import { WelcomeSetupButton } from "@vertix.gg/bot/src/ui/general/welcome/welcome-setup-button";

export class WelcomeElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-General/WelcomeElementsGroup";
    }

    public static getItems() {
        return [
            [ WelcomeSupportButton, WelcomeInviteButton, WelcomeSetupButton ],
            [ LanguageSelectMenu ]
        ];
    }
}
