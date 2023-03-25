import { guiManager } from "@dynamico/managers";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import EditMeta from "@dynamico/ui/edit-dynamic-channel/buttons/edit-meta";
import EditPermissions from "@dynamico/ui/edit-dynamic-channel/buttons/edit-permissions";

import MangeChannel from "@dynamico/ui/edit-dynamic-channel/embeds/mange-channel";

import { BaseInteractionTypes, E_UI_TYPES } from "@dynamico/interfaces/ui";

export class EditDynamicChannel extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/EditDynamicChannel";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public constructor() {
        super();

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "./modals/rename" ).default );
            guiManager.register( require( "./modals/userlimit" ).default );
        } );
    }

    protected async getEmbedTemplates( interaction?: BaseInteractionTypes ) {
        return [ new MangeChannel ];
    }

    protected getInternalElements() {
        return [
            EditMeta,
            EditPermissions,
        ];
    }
}

export default EditDynamicChannel;
