import UsersMenus from "./menus/users-menus";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import MangeUsers from "@dynamico/ui/edit-users-permissions/embed/mange-users";

import { BaseInteractionTypes, E_UI_TYPES } from "@dynamico/interfaces/ui";

export class EditUsersPermissions extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getEmbedTemplates( interaction?: BaseInteractionTypes ) {
        return [ new MangeUsers ];
    }

    public getInternalElements() {
        return [
            UsersMenus,
        ];
    }
}

export default EditUsersPermissions;
