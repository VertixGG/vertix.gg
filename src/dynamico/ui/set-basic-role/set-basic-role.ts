import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import SelectBasicRoleMenu from "@dynamico/ui/set-basic-role/select-basic-role-menu";

import SetBasicRoleEmbed from "@dynamico/ui/set-basic-role/set-basic-role-embed";
import ClearBasicRolesButton from "@dynamico/ui/set-basic-role/clear-basic-roles-button";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

export class SetBasicRole extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/SetBasicRole";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getInternalElements() {
        return [
            SelectBasicRoleMenu,
            ClearBasicRolesButton,
        ];
    }

    protected getInternalEmbeds() {
        return [
            SetBasicRoleEmbed,
        ];
    }
}

export default SetBasicRole;
