import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { TemplateEmbed } from "@vertix/ui-v2/template/template-embed";
import { TemplateModifyButton } from "@vertix/ui-v2/template/template-modify-button";
import { TemplateNameModal } from "@vertix/ui-v2/template/template-name-modal";

export class TemplateComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/TemplateComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            TemplateModifyButton,
        ];
    }

    public static getEmbeds() {
        return [
            TemplateEmbed,
        ];
    }

    public static getModals() {
        return [
            TemplateNameModal,
        ];
    }
}
