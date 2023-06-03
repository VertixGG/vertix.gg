import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { MissingPermissionsEmbed } from "@vertix/ui-v2/_general/missing-permissions/missing-permissions-embed";

export class MissingPermissionsComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/MissingPermissionsComponent";
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
