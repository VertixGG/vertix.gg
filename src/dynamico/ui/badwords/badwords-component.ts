import UIComponentBase from "@dynamico/ui/_base/ui-component-base";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { BadwordsButton } from "@dynamico/ui/badwords/badwords-button";
import { BadwordsEmbed } from "@dynamico/ui/badwords/badwords-embed";

export class BadwordsComponent extends UIComponentBase {
    public static getName() {
        return "Dynamico/UI/BadwordsComponent";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getEmbedTemplates() {
        return [
            new BadwordsEmbed(),
        ];
    }

    protected getInternalElements() {
        return [
            BadwordsButton
        ];
    }
}
