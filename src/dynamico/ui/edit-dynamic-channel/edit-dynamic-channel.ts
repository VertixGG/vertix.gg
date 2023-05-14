import { GUIManager } from "@dynamico/managers/gui";

import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import EditMeta from "@dynamico/ui/edit-dynamic-channel/buttons/edit-meta";
import EditPermissions from "@dynamico/ui/edit-dynamic-channel/buttons/edit-permissions";

import { UIBaseInteractionTypes, E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import EditDynamicChannelEmbed from "@dynamico/ui/edit-dynamic-channel/edit-dynamic-channel-embed";

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
            GUIManager.$.register( require( "./modals/rename" ).default );
            GUIManager.$.register( require( "./modals/userlimit" ).default );
        } );
    }

    protected async getEmbedTemplates( interaction?: UIBaseInteractionTypes ) {
        return [ new EditDynamicChannelEmbed ];
    }

    protected getInternalElements() {
        return [
            EditMeta,
            EditPermissions,
        ];
    }
}

export default EditDynamicChannel;
