import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { LanguageSelectMenu } from "@vertix/ui-v2/language/language-select-menu";
import { LanguageEmbed } from "@vertix/ui-v2/language/language-embed";

import { DoneButton } from "@vertix/ui-v2/_general/done-button";

export class LanguageComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/LanguageComponent";
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
