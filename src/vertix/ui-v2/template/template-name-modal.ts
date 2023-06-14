import { TemplateNameInput } from "@vertix/ui-v2/template/template-name-input";

import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";

import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class TemplateNameModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/TemplateNameModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ TemplateNameInput ]
        ];
    }

    protected getTitle(): string {
        return "Set dynamic channels name";
    }
}
