import { guiManager } from "@dynamico/managers";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import EditMeta from "@dynamico/ui/edit-dynamic-channel/buttons/edit-meta";
import EditPermissions from "@dynamico/ui/edit-dynamic-channel/buttons/edit-permissions";

import Primary from "@dynamico/ui/edit-dynamic-channel/embeds/primary";

import { BaseInteractionTypes } from "@dynamico/interfaces/ui";

export class EditDynamicChannel extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/EditDynamicChannel";
    }

    public constructor() {
        super();

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "./modals/rename" ).default );
            guiManager.register( require( "./modals/userlimit" ).default );
        } );
    }

    protected getDynamicEmbeds( interaction?: BaseInteractionTypes ) {
        return [ new Primary ];
    }

    protected getInternalComponents() {
        return [
            EditMeta,
            EditPermissions,
        ];
    }
}

export default EditDynamicChannel;
