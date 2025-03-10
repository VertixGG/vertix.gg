import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { WelcomeElementsGroup } from "@vertix.gg/bot/src/ui/general/welcome/welcome-elements-group";
import { WelcomeEmbed } from "@vertix.gg/bot/src/ui/general/welcome/welcome-embed";

export class WelcomeComponent extends UIComponentBase {
    public static getName () {
        return "VertixBot/UI-General/WelcomeComponent";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Static;
    }

    public static getElementsGroups () {
        return [
            WelcomeElementsGroup
            // WelcomeLanguageElementsGroup
        ];
    }

    public static getEmbeds () {
        return [
            WelcomeEmbed
            // LanguageEmbed,
        ];
    }

    public static getDefaultElementsGroup () {
        return "VertixBot/UI-General/WelcomeElementsGroup";
    }

    public static getDefaultEmbedsGroup () {
        return "VertixBot/UI-General/WelcomeEmbed";
    }
}
