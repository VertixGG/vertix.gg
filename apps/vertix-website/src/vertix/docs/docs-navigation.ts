import { normalizeRoutePath } from "@vertix.gg/website/src/vertix/seo/site-meta";

export interface DocsLink {
    title: string;
    href: string;
}

export interface DocsPage extends DocsLink {
    pages?: readonly DocsLink[];
}

export interface DocsSection {
    title?: string;
    pages: readonly DocsPage[];
}

export interface DocsNavigation {
    title: string;
    home: DocsLink;
    sections: readonly DocsSection[];
}

export interface DocsCrumb {
    title: string;
    href?: string;
}

function parseHref( href: string ): { path: string, query: URLSearchParams } {
    const [ path = "", query = "" ] = href.split( "?" );

    return { path: normalizeRoutePath( path ), query: new URLSearchParams( query ) };
}

export function listDocsLinks( navigation: DocsNavigation ): DocsLink[] {
    return navigation.sections.flatMap( ( section ) =>
        section.pages.flatMap( ( page ) => [ page, ...( page.pages ?? [] ) ] )
    );
}

export function isInDocsNavigation( navigation: DocsNavigation, pathname: string ): boolean {
    const path = normalizeRoutePath( pathname );

    return [ navigation.home, ...listDocsLinks( navigation ) ]
        .some( ( link ) => parseHref( link.href ).path === path );
}

/**
 * Function findActiveDocsHref() :: The link a location is showing.
 *
 * Several links can share a path and differ by query - a features page and each feature on it - so
 * a link matches when the location carries every parameter it names, and the one naming the most
 * wins. A parameter the navigation knows nothing about, or a feature that does not exist, falls
 * back to the page itself rather than to nothing.
 */
export function findActiveDocsHref( navigation: DocsNavigation, pathname: string, search: string ): string | undefined {
    const path = normalizeRoutePath( pathname ),
        query = new URLSearchParams( search );

    const matches = [ navigation.home, ...listDocsLinks( navigation ) ]
        .map( ( link ) => ( { href: link.href, ...parseHref( link.href ) } ) )
        .filter( ( link ) => link.path === path &&
            [ ...link.query ].every( ( [ key, value ] ) => query.get( key ) === value ) );

    return matches.sort( ( a, b ) => [ ...b.query ].length - [ ...a.query ].length )[ 0 ]?.href;
}

export function findDocsTrail( navigation: DocsNavigation, activeHref: string | undefined ): DocsCrumb[] {
    const root = { title: navigation.title, href: navigation.home.href };

    for ( const section of navigation.sections ) {
        const sectionCrumbs = section.title ? [ { title: section.title } ] : [];

        for ( const page of section.pages ) {
            if ( page.href === activeHref ) {
                return [ root, ...sectionCrumbs ];
            }

            if ( page.pages?.some( ( child ) => child.href === activeHref ) ) {
                return [ root, ...sectionCrumbs, { title: page.title, href: page.href } ];
            }
        }
    }

    return [];
}

export function findDocsNeighbours(
    navigation: DocsNavigation,
    activeHref: string | undefined
): { previous?: DocsLink, next?: DocsLink } {
    const links = listDocsLinks( navigation ),
        index = links.findIndex( ( link ) => link.href === activeHref );

    if ( -1 === index ) {
        return {};
    }

    return {
        previous: links[ index - 1 ],
        next: links[ index + 1 ],
    };
}
