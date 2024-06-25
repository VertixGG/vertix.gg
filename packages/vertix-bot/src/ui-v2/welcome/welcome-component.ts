import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { WelcomeElementsGroup } from "@vertix.gg/bot/src/ui-v2/welcome/welcome-elements-group";
import { WelcomeEmbed } from "@vertix.gg/bot/src/ui-v2/welcome/welcome-embed";

export class WelcomeComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/WelcomeComponent";
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
        return "Vertix/UI-V2/WelcomeElementsGroup";
    }

    protected static getDefaultEmbedsGroup() {
        return "Vertix/UI-V2/WelcomeEmbed";
    }
}
