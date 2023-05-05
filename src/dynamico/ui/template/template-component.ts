import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { TemplateButton } from "@dynamico/ui/template/template-button";
import { TemplateEmbed } from "@dynamico/ui/template/template-embed";

export class TemplateComponent extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/TemplateComponent";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getInternalElements() {
        return [
            TemplateButton,
        ];
    }

    protected getInternalEmbeds() {
        return [
            TemplateEmbed,
        ];
    }
}
