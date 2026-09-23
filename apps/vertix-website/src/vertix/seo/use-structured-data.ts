import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { getStructuredData } from "@vertix.gg/website/src/vertix/seo/structured-data";

const STRUCTURED_DATA_SCRIPT_TYPE = "application/ld+json";

const STRUCTURED_DATA_MARKER = "data-vc-structured-data";

export function useStructuredData() {
    const { pathname } = useLocation();

    useEffect( () => {
        /*
         * Clear before writing, because this hook has usually run once already.
         *
         * Prerendering runs the app to get the markup, so the blocks this effect appends are in the
         * html that ships - and then the app mounts over that html and appends them a second time.
         * The page went out saying everything twice: two breadcrumbs, two of each schema, which a
         * crawler reads as two of the thing rather than one said clearly.
         *
         * Anything carrying the marker is this hook's own output, from this run or from the build,
         * so taking it out first leaves exactly one set however many times the app has rendered.
         */
        document.head
            .querySelectorAll( `script[${ STRUCTURED_DATA_MARKER }]` )
            .forEach( ( existing ) => existing.remove() );

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
