import type {
    UIElementButtonLanguageContent,
    UIElementSelectMenuLanguageContent,
    UIElementTextInputLanguageContent,
    UIEmbedLanguageContent,
    UIMarkdownLanguageContent,
    UIModalLanguageContent
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import type { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import type { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";
import type { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";
import type { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import type { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

export interface UILanguageManagerInterface {
    getButtonTranslatedContent(
        button: UIElementButtonBase,
        languageCode: string | undefined
    ): Promise<UIElementButtonLanguageContent>;

    getSelectMenuTranslatedContent(
        selectMenu:
            | UIElementStringSelectMenu
            | UIElementUserSelectMenu
            | UIElementRoleSelectMenu
            | UIElementChannelSelectMenu,
        languageCode: string | undefined
    ): Promise<UIElementSelectMenuLanguageContent>;

    getTextInputTranslatedContent(
        textInput: UIElementInputBase,
        languageCode: string | undefined
    ): Promise<UIElementTextInputLanguageContent>;

    getEmbedTranslatedContent(embed: UIEmbedBase, languageCode: string | undefined): Promise<UIEmbedLanguageContent>;

    getMarkdownTranslatedContent(
        markdown: UIMarkdownBase,
        languageCode: string | undefined
    ): Promise<UIMarkdownLanguageContent>;

    getModalTranslatedContent(modal: UIModalBase, languageCode: string | undefined): Promise<UIModalLanguageContent>;

    register(): Promise<void>;
}
