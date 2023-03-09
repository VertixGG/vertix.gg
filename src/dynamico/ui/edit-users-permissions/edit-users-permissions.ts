import { Interaction, NonThreadGuildBasedChannel } from "discord.js";

import UsersMenus from "./menus/users-menus";

import ComponentUIBase from "@dynamico/ui/base/component-ui-base";

import Primary from "@dynamico/ui/edit-users-permissions/embed/primary";

import { E_UI_TYPES, EmbedsType } from "@dynamico/interfaces/ui";

export class EditUsersPermissions extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel ): EmbedsType {
        return [ new Primary ];
    }

    public getInternalComponents() {
        return [
            UsersMenus,
        ];
    }
}

export default EditUsersPermissions;
