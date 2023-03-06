import ComponentUIBase from "@dynamico/ui/base/component-ui-base";
import ManageUsersMenus from "@dynamico/ui/edit-channel/mange-users-menus";
import { E_UI_TYPES } from "@dynamico/interfaces/ui";

export default class MangeUsersComponent extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/ManageUsers";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    getInternalComponents() {
        return [
            ManageUsersMenus,
        ];
    }
}
