import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { DEFAULT_META, SITE_NAME, SITE_ORIGIN, getRouteMeta } from "@vertix.gg/website/src/vertix/seo/site-meta";

function setTag( selector: string, create: () => HTMLElement, value: string, attribute = "content" ) {
    let element = document.head.querySelector<HTMLElement>( selector );

    if ( ! element ) {
        element = create();
        document.head.appendChild( element );
    }

    element.setAttribute( attribute, value );
}

function setMeta( name: string, value: string ) {
    setTag( `meta[name="${ name }"]`, () => {
        const el = document.createElement( "meta" );
        el.setAttribute( "name", name );
        return el;
    }, value );
}

function setProperty( property: string, value: string ) {
    setTag( `meta[property="${ property }"]`, () => {
        const el = document.createElement( "meta" );
        el.setAttribute( "property", property );
        return el;
    }, value );
}

/**
 * Keeps the document's title, description, canonical and Open Graph tags in
 * step with the active route.
 *
 * The Open Graph pair matters beyond search here: it is what Discord renders
 * when someone pastes a link to the site into a channel.
 */
export function useDocumentMeta() {
    const { pathname } = useLocation();

    useEffect( () => {
        const meta = getRouteMeta( pathname ),
            title = meta?.title ?? DEFAULT_META.title,
            description = meta?.description ?? DEFAULT_META.description,
            // Unknown paths render the home page, so point them at the root
            // rather than minting a canonical for a URL that isn't a page.
            canonical = SITE_ORIGIN + ( meta ? meta.path : "/" );

        document.title = title;

        setMeta( "description", description );

        setTag( "link[rel=\"canonical\"]", () => {
            const el = document.createElement( "link" );
            el.setAttribute( "rel", "canonical" );
            return el;
        }, canonical, "href" );

        setProperty( "og:type", "website" );
        setProperty( "og:site_name", SITE_NAME );
        setProperty( "og:title", title );
        setProperty( "og:description", description );
        setProperty( "og:url", canonical );

        setMeta( "twitter:card", "summary_large_image" );
        setMeta( "twitter:title", title );
        setMeta( "twitter:description", description );
    }, [ pathname ] );
}
