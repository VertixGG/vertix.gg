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

    /**
     * Drawn as a container because the setup screen is: this takes over that screen's own reply,
     * which was already sent with a flag no later edit can remove.
     */
    public static shouldRenderAsContainer() {
        return true;
    }

    public static getElements() {
        return [ [ LanguageSelectMenu ], [ DoneButton ] ];
    }

    public static getEmbeds() {
        return [ LanguageEmbed ];
    }
}
