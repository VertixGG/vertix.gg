import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { WelcomeSupportButton } from "@vertix.gg/bot/src/ui/v3/welcome/welcome-support-button";
import { WelcomeInviteButton } from "@vertix.gg/bot/src/ui/v3/welcome/welcome-invite-button";
import { WelcomeSetupButton } from "@vertix.gg/bot/src/ui/v3/welcome/welcome-setup-button";

export class WelcomeElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V3/WelcomeElementsGroup";
    }

    public static getItems() {
        return [
            [ WelcomeSupportButton, WelcomeInviteButton, WelcomeSetupButton ],
            // [ WelcomeSetupButton, LanguageChooseButton ]
        ];
    }
}
