import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import EditBadwordsButton from "@dynamico/ui/set-badwords-config/edit-badwords-button";

import { BadwordsConfigEmbed } from "@dynamico/ui/set-badwords-config/badwords-config-embed";

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
            new BadwordsConfigEmbed(),
        ];
    }

    protected getInternalElements() {
        return [
            EditBadwordsButton
        ];
    }
}

export default SetBadwordsConfig;
