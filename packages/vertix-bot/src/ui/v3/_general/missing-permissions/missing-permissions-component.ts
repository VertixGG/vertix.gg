import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { MissingPermissionsEmbed } from "@vertix.gg/bot/src/ui/v3/_general/missing-permissions/missing-permissions-embed";

export class MissingPermissionsComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V3/MissingPermissionsComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [
            MissingPermissionsEmbed,
        ];
    }
}
