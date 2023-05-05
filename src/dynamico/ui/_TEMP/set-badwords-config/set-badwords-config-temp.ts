import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import EditBadwordsButton from "@dynamico/ui/_TEMP/set-badwords-config/edit-badwords-button";

import { BadwordsConfigEmbed } from "@dynamico/ui/_TEMP/set-badwords-config/badwords-config-embed";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";
import { guiManager } from "@dynamico/managers";

export class SetBadwordsConfigTemp extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/Temp/SetBadwordsConfig";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public constructor( interaction: any, args: any ) {
        super( interaction, args );

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "./edit-badwords-modal" ).default );
        } );
    }

    protected async getEmbedTemplates() {
        return [
            new BadwordsConfigEmbed(),
        ];
    }

    protected getInternalElements() {
        return [
            EditBadwordsButton
        ];
    }
}

export default SetBadwordsConfigTemp;
