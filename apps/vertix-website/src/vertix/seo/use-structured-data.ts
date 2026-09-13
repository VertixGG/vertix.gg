import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { getStructuredData } from "@vertix.gg/website/src/vertix/seo/structured-data";

const STRUCTURED_DATA_SCRIPT_TYPE = "application/ld+json";

const STRUCTURED_DATA_MARKER = "data-vc-structured-data";

export function useStructuredData() {
    const { pathname } = useLocation();

    useEffect( () => {
        const scripts = getStructuredData( pathname ).map( ( node ) => {
            const script = document.createElement( "script" );

            script.setAttribute( "type", STRUCTURED_DATA_SCRIPT_TYPE );
            script.setAttribute( STRUCTURED_DATA_MARKER, "" );
            script.textContent = JSON.stringify( node );

            document.head.appendChild( script );

            return script;
        } );

        return () => scripts.forEach( ( script ) => script.remove() );
    }, [ pathname ] );
}
