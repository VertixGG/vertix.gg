import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui/general/language/language-select-menu";
import { LanguageEmbed } from "@vertix.gg/bot/src/ui/general/language/language-embed";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

export class LanguageComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/LanguageComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [[LanguageSelectMenu], [DoneButton]];
    }

    public static getEmbeds() {
        return [LanguageEmbed];
    }
}
