import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

import { WelcomeSupportButton } from "@vertix/ui-v2/welcome/welcome-support-button";
import { WelcomeInviteButton } from "@vertix/ui-v2/welcome/welcome-invite-button";
import { WelcomeSetupButton } from "@vertix/ui-v2/welcome/welcome-setup-button";

export class WelcomeElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/WelcomeElementsGroup";
    }

    public static getItems() {
        return [
            [ WelcomeSupportButton, WelcomeInviteButton, WelcomeSetupButton ],
            // [ WelcomeSetupButton, LanguageChooseButton ]
        ];
    }
}
