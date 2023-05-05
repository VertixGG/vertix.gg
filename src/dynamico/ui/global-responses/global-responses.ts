import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import GlobalResponsesEmbed from "@dynamico/ui/global-responses/global-responses-embed";

import {
    E_UI_TYPES,
} from "@dynamico/ui/_base/ui-interfaces";

export class GlobalResponse extends UIComponentBase {
    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public static getName() {
        return "Dynamico/UI/GlobalResponse";
    }

    protected async getEmbedTemplates() {
        return [ new GlobalResponsesEmbed ];
    }
}

export default GlobalResponse;
