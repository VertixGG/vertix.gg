import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { ButtonsSelectMenu } from "@vertix/ui-v2/buttons/buttons-select-menu";
import ButtonsEmbed from "@vertix/ui-v2/buttons/buttons-embed";

export class ButtonsComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/ButtonsComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            ButtonsSelectMenu,
        ];
    }

    public static getEmbeds() {
        return [
            ButtonsEmbed,
        ];
    }

    public static getModals() {
        return [];
    }
}
