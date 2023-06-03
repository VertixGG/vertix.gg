import { UI_LANGUAGES_INITIAL_ATTRIBUTES, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UILanguageManager } from "@vertix/ui-v2/ui-language-manager";
import { UIElementStringSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-string-select-menu";

export class LanguageSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "Vertix/UI-V2/LanguageSelectMenu";
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

        const languages = UILanguageManager.$.getAdditionalLanguages();

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
