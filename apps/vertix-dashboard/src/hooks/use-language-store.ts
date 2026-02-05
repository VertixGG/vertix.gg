import { create } from "zustand";

import type { LanguageInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { LanguageTranslations } from "@vertix.gg/dashboard/src/features/flow-editor/query/language-query";

export type { LanguageTranslations } from "@vertix.gg/dashboard/src/features/flow-editor/query/language-query";

interface LanguageState {
    availableLanguages: LanguageInfo[];
    selectedLanguage: string;
    isLoadingLanguages: boolean;
    translations: LanguageTranslations | null;
    isLoadingTranslations: boolean;
    setAvailableLanguages: ( languages: LanguageInfo[] ) => void;
    setSelectedLanguage: ( code: string ) => void;
    setIsLoadingLanguages: ( loading: boolean ) => void;
    setTranslations: ( translations: LanguageTranslations | null ) => void;
    setIsLoadingTranslations: ( loading: boolean ) => void;
}

export const useLanguageStore = create<LanguageState>( ( set ) => ( {
    availableLanguages: [],
    selectedLanguage: "en",
    isLoadingLanguages: false,
    translations: null,
    isLoadingTranslations: false,
    setAvailableLanguages: ( languages ) => set( { availableLanguages: languages } ),
    setSelectedLanguage: ( code ) => set( { selectedLanguage: code } ),
    setIsLoadingLanguages: ( loading ) => set( { isLoadingLanguages: loading } ),
    setTranslations: ( translations ) => set( { translations } ),
    setIsLoadingTranslations: ( loading ) => set( { isLoadingTranslations: loading } ),
} ) );
