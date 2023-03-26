import UsersMenus from "./menus/users-menus";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import MangeUsersEmbed from "@dynamico/ui/edit-users-permissions/mange-users-embed";

import { BaseInteractionTypes, E_UI_TYPES } from "@dynamico/interfaces/ui";

export class EditUsersPermissions extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getEmbedTemplates( interaction?: BaseInteractionTypes ) {
        return [ new MangeUsersEmbed ];
    }

    public getInternalElements() {
        return [
            UsersMenus,
        ];
    }
}

export default EditUsersPermissions;
