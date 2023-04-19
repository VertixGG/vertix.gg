import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { ConfigEmbed } from "@dynamico/ui/config/config-embed";
import { ConfigButtons } from "@dynamico/ui/config/config-buttons";

export class ConfigComponent extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/ConfigComponent";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public static groups() {
        return [
            this.getName(),
        ];
    }

    protected getInternalEmbeds() {
        return [
            ConfigEmbed
        ];
    }

    public getInternalElements() {
        return [
            ConfigButtons,
        ];
    }
}
