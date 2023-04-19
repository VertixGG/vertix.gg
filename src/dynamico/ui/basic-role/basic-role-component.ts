import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { BasicRoleSelectMenu } from "@dynamico/ui/basic-role/basic-role-select-menu";
import { BasicRoleClearButton } from "@dynamico/ui/basic-role/basic-role-clear-button";
import { BasicRoleEmbed } from "@dynamico/ui/basic-role/basic-role-embed";

export class BasicRoleComponent extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/BasicRoleComponent";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getInternalElements() {
        return [
            BasicRoleSelectMenu,
            BasicRoleClearButton,
        ];
    }

    protected getInternalEmbeds() {
        return [
            BasicRoleEmbed,
        ];
    }
}

export default BasicRoleComponent;
