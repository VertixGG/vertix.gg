import { Interaction, NonThreadGuildBasedChannel } from "discord.js";

import UsersMenus from "./menus/users-menus";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import Primary from "@dynamico/ui/edit-users-permissions/embed/primary";

import { E_UI_TYPES, EmbedsTypes } from "@dynamico/interfaces/ui";

export class EditUsersPermissions extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel ): EmbedsTypes {
        return [ new Primary ];
    }

    public getInternalComponents() {
        return [
            UsersMenus,
        ];
    }
}

export default EditUsersPermissions;
