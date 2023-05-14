import { GUIManager } from "@dynamico/managers/gui";

import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import EditTemplateButton from "@dynamico/ui/_TEMP/set-master-config/edit-template-button";

import MasterConfigEmbed from "@dynamico/ui/_TEMP/set-master-config/master-config-embed";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

export class SetMasterConfigTemp extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/Temp/SetMasterConfig";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public constructor( interaction: any, args: any ) {
        super( interaction, args );

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            GUIManager.$.register( require( "./edit-template-modal" ).default );
        } );
    }

    protected getInternalElements() {
        return [
            EditTemplateButton,
        ];
    }

    protected getInternalEmbeds() {
        return [
            MasterConfigEmbed,
        ];
    }
}

export default SetMasterConfigTemp;
