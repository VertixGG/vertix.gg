import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { WelcomeElementsGroup } from "@vertix.gg/bot/src/ui/v3/welcome/welcome-elements-group";
import { WelcomeEmbed } from "@vertix.gg/bot/src/ui/v3/welcome/welcome-embed";

export class WelcomeComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V3/WelcomeComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getElementsGroups() {
        return [
            WelcomeElementsGroup,
            // WelcomeLanguageElementsGroup
        ];
    }

    public static getEmbeds() {
        return [
            WelcomeEmbed,
            // LanguageEmbed,
        ];
    }

    protected static getDefaultElementsGroup() {
        return "Vertix/UI-V3/WelcomeElementsGroup";
    }

    protected static getDefaultEmbedsGroup() {
        return "Vertix/UI-V3/WelcomeEmbed";
    }
}
