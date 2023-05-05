import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import EditUsersPermissionsEmbed from "@dynamico/ui/edit-users-permissions/edit-users-permissions-embed";
import EditPermissionsUsersMenuMenus from "@dynamico/ui/edit-users-permissions/edit-permissions-users-menus";

import { UIBaseInteractionTypes, E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { guiManager } from "@dynamico/managers";

export class EditUsersPermissions extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public constructor() {
        super();

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "./edit-users-channel-public-embed" ).default );
        } );
    }

    protected async getEmbedTemplates( interaction?: UIBaseInteractionTypes ) {
        return [ new EditUsersPermissionsEmbed ];
    }

    public getInternalElements() {
        return [
            EditPermissionsUsersMenuMenus,
        ];
    }
}

export default EditUsersPermissions;
