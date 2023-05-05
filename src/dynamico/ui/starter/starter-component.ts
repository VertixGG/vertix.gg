import UIComponentBase from "@dynamico/ui/_base/ui-component-base";
import { StarterEmbed } from "@dynamico/ui/starter/starter-embed";
import { StarterElement } from "@dynamico/ui/starter/starter-element";
import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

export class StarterComponent extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/StarterComponent";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getInternalEmbeds() {
        return [
            StarterEmbed,
        ];
    }

    protected getInternalElements() {
        return [
            StarterElement
        ];
    }
}
