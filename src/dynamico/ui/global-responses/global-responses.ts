import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import Embed from "@dynamico/ui/global-responses/embed";

import {
    E_UI_TYPES,
} from "@dynamico/interfaces/ui";

export class GlobalResponse extends UIComponentBase {
    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public static getName() {
        return "Dynamico/UI/GlobalResponse";
    }

    protected async getEmbedTemplates() {
        return [ new Embed ];
    }
}

export default GlobalResponse;
