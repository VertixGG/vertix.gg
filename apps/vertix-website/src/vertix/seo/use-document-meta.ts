import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { NOT_FOUND_META, SITE_NAME, SITE_OG_IMAGE, SITE_ORIGIN, getRouteMeta } from "@vertix.gg/website/src/vertix/seo/site-meta";

const ROBOTS_NOINDEX = "noindex, follow";

function setTag( selector: string, create: () => HTMLElement, value: string, attribute = "content" ) {
    let element = document.head.querySelector<HTMLElement>( selector );

    if ( ! element ) {
        element = create();
        document.head.appendChild( element );
    }

    element.setAttribute( attribute, value );
}

function removeTag( selector: string ) {
    document.head.querySelector( selector )?.remove();
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
            title = meta?.title ?? NOT_FOUND_META.title,
            description = meta?.description ?? NOT_FOUND_META.description,
            canonical = meta ? SITE_ORIGIN + meta.path : null;

        document.title = title;

        setMeta( "description", description );

        if ( canonical ) {
            setTag( "link[rel=\"canonical\"]", () => {
                const el = document.createElement( "link" );
                el.setAttribute( "rel", "canonical" );
                return el;
            }, canonical, "href" );

            removeTag( "meta[name=\"robots\"]" );
        } else {
            removeTag( "link[rel=\"canonical\"]" );

            setMeta( "robots", ROBOTS_NOINDEX );
        }

        setProperty( "og:type", "website" );
        setProperty( "og:site_name", SITE_NAME );
        setProperty( "og:title", title );
        setProperty( "og:description", description );
        setProperty( "og:url", canonical ?? SITE_ORIGIN + pathname );
        setProperty( "og:image", SITE_ORIGIN + SITE_OG_IMAGE.PATH );
        setProperty( "og:image:width", SITE_OG_IMAGE.WIDTH );
        setProperty( "og:image:height", SITE_OG_IMAGE.HEIGHT );
        setProperty( "og:image:alt", SITE_OG_IMAGE.ALT );

        setMeta( "twitter:card", "summary_large_image" );
        setMeta( "twitter:title", title );
        setMeta( "twitter:description", description );
        setMeta( "twitter:image", SITE_ORIGIN + SITE_OG_IMAGE.PATH );
    }, [ pathname ] );
}
