import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UnassignableRoleEmbed } from "@vertix.gg/bot/src/ui/general/server-options/unassignable-role-embed";

export class UnassignableRoleComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/UnassignableRoleComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [ UnassignableRoleEmbed ];
    }
}
