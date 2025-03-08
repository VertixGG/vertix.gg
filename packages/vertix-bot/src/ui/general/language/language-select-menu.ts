import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UI_LANGUAGES_INITIAL_ATTRIBUTES } from "@vertix.gg/gui/src/bases/ui-language-definitions";

import { UILanguageManager } from "@vertix.gg/bot/src/ui/ui-language-manager";

export class LanguageSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/LanguageSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🌍 Select Language";
    }

    protected async getSelectOptions() {
        const initialLanguage = UI_LANGUAGES_INITIAL_ATTRIBUTES,
            result = [
                {
                    label: `${initialLanguage.flag} ${initialLanguage.name}`,
                    value: initialLanguage.code,
                    default: this.uiArgs?._language ? this.uiArgs?._language === initialLanguage.code : true
                }
            ];

        const languages = UILanguageManager.$.getAvailableLanguages();

        languages.forEach((language) => {
            result.push({
                label: `${language.flag} ${language.name}`,
                value: language.code,
                default: this.uiArgs?._language === language.code
            });
        });

        return result;
    }
}
