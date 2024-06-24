import type { UIBaseTemplateOptions, UIEmbedArrayOptions } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export const UI_LANGUAGES_PATH = process.cwd() + "/assets/languages/",
    UI_LANGUAGES_FILE_EXTENSION = ".json",
    UI_LANGUAGES_INITIAL_CODE = "en",
    UI_LANGUAGES_INITIAL_FILE_NAME = UI_LANGUAGES_INITIAL_CODE + UI_LANGUAGES_FILE_EXTENSION,
    UI_LANGUAGES_INITIAL_FILE_PATH = UI_LANGUAGES_PATH + UI_LANGUAGES_INITIAL_FILE_NAME,
    UI_LANGUAGES_INITIAL_ATTRIBUTES = {
        code: UI_LANGUAGES_INITIAL_CODE,
        name: "English",
        flag: "🇺🇸",
    };

export interface UIModalLanguageContent {
    title: string,
}

export interface UIModalLanguage {
    name: string,
    content: UIModalLanguageContent,
}

export interface UIMarkdownLanguageContent {
    content: string,
    options?: UIBaseTemplateOptions,
}

export interface UIMarkdownLanguage {
    name: string,
    content: UIMarkdownLanguageContent,
}

export interface UIEmbedLanguageContent {
    title?: string,
    description?: string,
    footer?: string,
    options?: UIBaseTemplateOptions,
    arrayOptions?: UIEmbedArrayOptions,
}

export interface UIEmbedLanguage {
    name: string,
    content: UIEmbedLanguageContent,
}

// TODO: Currently used by `ElementSelectMenuLanguageModel` and `ElementSelectUserMenuLanguageModel`.
export interface UIElementSelectMenuLanguageContent {
    placeholder?: string,
    options?: {
        [ key: string ]: any,
    }

    selectOptions?: {
        label: string,
    }[],
}

export interface UIElementSelectUserMenuLanguage {
    name: string,
    content: UIElementSelectMenuLanguageContent,
}

export interface UIElementSelectMenuLanguage {
    name: string,
    content: UIElementSelectMenuLanguageContent,
}

export interface UIElementTextInputLanguageContent {
    label: string,
    placeholder?: string,
}

export interface UIElementTextInputLanguage {
    name: string,
    content: UIElementTextInputLanguageContent,
}

export interface UIElementButtonLanguageContent {
    label: string,
    options?: UIBaseTemplateOptions,
}

export interface UIElementButtonLanguage {
    name: string,
    content: UIElementButtonLanguageContent,
}

export interface UIElementsLanguage {
    buttons: UIElementButtonLanguage[],
    textInputs: UIElementTextInputLanguage[],
    selectMenus: UIElementSelectMenuLanguage[] | UIElementSelectUserMenuLanguage[],
}

export interface UILanguageJSON {
    code: string,
    name: string,
    flag: string,

    elements: UIElementsLanguage,
    embeds: UIEmbedLanguage[],
    markdowns: UIMarkdownLanguage[],
    modals: UIModalLanguage[],
}
