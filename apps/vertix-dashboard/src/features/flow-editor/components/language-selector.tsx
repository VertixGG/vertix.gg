import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { LanguageQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/language-query";
import { useLanguageStore } from "@vertix.gg/dashboard/src/hooks/use-language-store";

import type { LanguageInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { LanguageTranslations } from "@vertix.gg/dashboard/src/features/flow-editor/query/language-query";

export function LanguageSelector() {
    const availableLanguages = useLanguageStore( ( state ) => state.availableLanguages );
    const selectedLanguage = useLanguageStore( ( state ) => state.selectedLanguage );
    const isLoadingLanguages = useLanguageStore( ( state ) => state.isLoadingLanguages );
    const setAvailableLanguages = useLanguageStore( ( state ) => state.setAvailableLanguages );
    const setSelectedLanguage = useLanguageStore( ( state ) => state.setSelectedLanguage );
    const setIsLoadingLanguages = useLanguageStore( ( state ) => state.setIsLoadingLanguages );
    const setTranslations = useLanguageStore( ( state ) => state.setTranslations );
    const setIsLoadingTranslations = useLanguageStore( ( state ) => state.setIsLoadingTranslations );

    const lastLoadedTranslationCode = useRef<string | null>( null );
    const [ isOpen, setIsOpen ] = useState( false );
    const menuRef = useRef<HTMLDivElement>( null );

    // Close menu when clicking outside
    useEffect( () => {
        if ( !isOpen ) {
            return;
        }

        const handleClickOutside = ( event: MouseEvent ) => {
            if ( menuRef.current && !menuRef.current.contains( event.target as HTMLElement ) ) {
                setIsOpen( false );
            }
        };

        document.addEventListener( "mousedown", handleClickOutside );

        return () => {
            document.removeEventListener( "mousedown", handleClickOutside );
        };
    }, [ isOpen ] );

    const handleSelectLanguage = useCallback( ( code: string ) => {
        setSelectedLanguage( code );
        setIsOpen( false );
    }, [ setSelectedLanguage ] );

    useEffect( () => {
        // Only fetch once
        if ( availableLanguages.length > 0 || isLoadingLanguages ) {
            return;
        }

        setIsLoadingLanguages( true );

        const queryModule = getQueryModule( LanguageQuery );
        queryModule.request<LanguageInfo[]>( "Dashboard/Languages/GetAll", {} )
            .then( ( languages ) => {
                setAvailableLanguages( languages );

                // Default to first language if current selection isn't available
                if ( languages.length > 0 && !languages.find( l => l.code === selectedLanguage ) ) {
                    setSelectedLanguage( languages[ 0 ].code );
                }
            } )
            .catch( () => {
                // Fallback: at least show English
                setAvailableLanguages( [ { code: "en", name: "English", flag: "\u{1F1FA}\u{1F1F8}" } ] );
            } )
            .finally( () => {
                setIsLoadingLanguages( false );
            } );
    }, [ availableLanguages.length, isLoadingLanguages, selectedLanguage, setAvailableLanguages, setSelectedLanguage, setIsLoadingLanguages ] );

    // Fetch translations when selectedLanguage changes
    useEffect( () => {
        if ( !selectedLanguage || lastLoadedTranslationCode.current === selectedLanguage ) {
            return;
        }

        lastLoadedTranslationCode.current = selectedLanguage;
        setIsLoadingTranslations( true );

        const queryModule = getQueryModule( LanguageQuery );
        queryModule.request<LanguageTranslations>( "Dashboard/Languages/GetTranslations", { code: selectedLanguage } )
            .then( ( translations ) => {
                setTranslations( translations );
            } )
            .catch( () => {
                setTranslations( null );
            } )
            .finally( () => {
                setIsLoadingTranslations( false );
            } );
    }, [ selectedLanguage, setTranslations, setIsLoadingTranslations ] );

    if ( isLoadingLanguages || availableLanguages.length === 0 ) {
        return (
            <div className="flex items-center gap-1 text-zinc-500 text-xs">
                <Globe className="w-3 h-3" />
                <span>...</span>
            </div>
        );
    }

    const currentLang = availableLanguages.find( l => l.code === selectedLanguage );

    return (
        <div className="relative" ref={ menuRef }>
            <button
                onClick={ () => setIsOpen( !isOpen ) }
                className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs transition-colors border border-zinc-600"
            >
                <Globe className="w-3 h-3 text-zinc-400" />
                <span>
                    { currentLang ? `${ currentLang.flag } ${ currentLang.name }` : selectedLanguage.toUpperCase() }
                </span>
                <ChevronDown className={ `w-3 h-3 text-zinc-400 transition-transform ${ isOpen ? "rotate-180" : "" }` } />
            </button>

            { isOpen && (
                <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-zinc-800 border border-zinc-600 rounded-md shadow-lg z-50 py-1 overflow-hidden">
                    { availableLanguages.map( ( lang ) => (
                        <button
                            key={ lang.code }
                            onClick={ () => handleSelectLanguage( lang.code ) }
                            className={ `w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                                selectedLanguage === lang.code
                                    ? "bg-blue-600/20 text-blue-300"
                                    : "text-zinc-300 hover:bg-zinc-700"
                            }` }
                        >
                            <span className="text-sm">{ lang.flag }</span>
                            <span className="flex-1">{ lang.name }</span>
                            { selectedLanguage === lang.code && (
                                <Check className="w-3 h-3 text-blue-400" />
                            ) }
                        </button>
                    ) ) }
                </div>
            ) }
        </div>
    );
}
