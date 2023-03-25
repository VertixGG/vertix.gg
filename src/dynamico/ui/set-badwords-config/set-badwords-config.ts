import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import { BadwordsConfig } from "@dynamico/ui/set-badwords-config/embed/badwords-config";
import EditBadwords from "@dynamico/ui/set-badwords-config/buttons/edit-badwords";
import { E_UI_TYPES } from "@dynamico/interfaces/ui";

export class SetBadwordsConfig extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/SetBadwordsConfig";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getEmbedTemplates() {
        return [
            new BadwordsConfig(),
        ];
    }

    protected getInternalElements() {
        return [
            EditBadwords
        ];
    }
}

export default SetBadwordsConfig;
