import UsersMenus from "./menus/users-menus";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import Primary from "@dynamico/ui/edit-users-permissions/embed/primary";

import { BaseInteractionTypes, E_UI_TYPES } from "@dynamico/interfaces/ui";

export class EditUsersPermissions extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getDynamicEmbeds( interaction?: BaseInteractionTypes ) {
        return [ new Primary ];
    }

    public getInternalComponents() {
        return [
            UsersMenus,
        ];
    }
}

export default EditUsersPermissions;
