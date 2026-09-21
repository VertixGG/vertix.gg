import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { HelpElementsGroup } from "@vertix.gg/bot/src/ui/general/help/help-elements-group";
import { HelpEmbed } from "@vertix.gg/bot/src/ui/general/help/help-embed";

export class HelpComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/HelpComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getElementsGroups() {
        return [ HelpElementsGroup ];
    }

    public static getEmbeds() {
        return [ HelpEmbed ];
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-General/HelpElementsGroup";
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-General/HelpEmbed";
    }
}
