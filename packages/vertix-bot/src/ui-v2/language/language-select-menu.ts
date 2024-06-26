import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIElementStringSelectMenu } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-string-select-menu"
    ;
import { UILanguageManager } from "@vertix.gg/bot/src/ui-v2/ui-language-manager";

import { UI_LANGUAGES_INITIAL_ATTRIBUTES } from "@vertix.gg/bot/src/ui-v2/_base/ui-language-definitions";

export class LanguageSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V2/LanguageSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🌍 Select Language";
    }

    protected async getSelectOptions() {
        const initialLanguage = UI_LANGUAGES_INITIAL_ATTRIBUTES,
            result = [ {
                label: `${ initialLanguage.flag } ${ initialLanguage.name }`,
                value: initialLanguage.code,
                default: ( this.uiArgs?._language ? this.uiArgs?._language === initialLanguage.code : true ),
            } ];

        const languages = UILanguageManager.$.getAvailableLanguages();

        languages.forEach( ( language ) => {
            result.push( {
                label: `${ language.flag } ${ language.name }`,
                value: language.code,
                default: this.uiArgs?._language === language.code
            } );
        } );

        return result;
    }
}
