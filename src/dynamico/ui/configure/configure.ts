import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import ConfigureEmbed from "@dynamico/ui/configure/configure-embed";
import ConfigureButtons from "@dynamico/ui/configure/configure-buttons";

export class Configure extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/Configure";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public static groups() {
        return [
            this.getName(), // TODO: Do the same for all UI components.
        ];
    }

    public constructor() {
        super();

        // TODO: This is probably not the best way to do this.
        // setTimeout( () => {
        //     guiManager.register( require( "./edit-users-channel-public-embed" ).default );
        // } );
    }

    protected getInternalEmbeds() {
        return [
            ConfigureEmbed
        ];
    }

    public getInternalElements() {
        return [
            ConfigureButtons,
        ];
    }
}

export default Configure;
