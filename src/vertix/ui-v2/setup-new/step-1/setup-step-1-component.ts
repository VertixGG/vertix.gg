import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { SetupStep1Embed } from "@vertix/ui-v2/setup-new/step-1/setup-step-1-embed";

import { TemplateModifyButton } from "@vertix/ui-v2/template/template-modify-button";
import { TemplateNameModal } from "@vertix/ui-v2/template/template-name-modal";

export class SetupStep1Component extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/SetupStep1Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ TemplateModifyButton ],
        ];
    }

    public static getEmbeds() {
        return [
            SetupStep1Embed,
        ];
    }

    public static getModals() {
        return [
            TemplateNameModal,
        ];
    }
}
