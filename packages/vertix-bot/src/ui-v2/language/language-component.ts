import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui-v2/language/language-select-menu";
import { LanguageEmbed } from "@vertix.gg/bot/src/ui-v2/language/language-embed";

import { DoneButton } from "@vertix.gg/bot/src/ui-v2/_general/done-button";

export class LanguageComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/LanguageComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ LanguageSelectMenu ],
            [ DoneButton ],
        ];
    }

    public static getEmbeds() {
        return [ LanguageEmbed ];
    }
}
