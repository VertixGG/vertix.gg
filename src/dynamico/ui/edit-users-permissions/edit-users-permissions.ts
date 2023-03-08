import UsersMenus from "./menus/users-menus";

import ComponentUIBase from "@dynamico/ui/base/component-ui-base";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

export class EditUsersPermissions extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public getInternalComponents() {
        return [
            UsersMenus,
        ];
    }
}

export default EditUsersPermissions;
