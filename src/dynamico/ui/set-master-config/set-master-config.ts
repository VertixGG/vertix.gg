import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import EditTemplate from "@dynamico/ui/set-master-config/buttons/edit-template";

import MasterConfigEmbed from "@dynamico/ui/set-master-config/embed/master-config-embed";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

export class SetMasterConfig extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/SetMasterConfig";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getInternalElements() {
        return [
            EditTemplate,
        ];
    }

    protected getInternalEmbeds() {
        return [
            MasterConfigEmbed,
        ];
    }
}

export default SetMasterConfig;
