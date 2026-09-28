import React from "react";

import { useLocation } from "react-router-dom";

import { findActiveDocsHref, findDocsTrail } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

import DocsSidebar from "@vertix.gg/website/src/vertix/docs/docs-sidebar";
import DocsBreadcrumb from "@vertix.gg/website/src/vertix/docs/docs-breadcrumb";
import DocsPager from "@vertix.gg/website/src/vertix/docs/docs-pager";

import type { DocsNavigation } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

/**
 * Function useScrollTopOnNavigation() :: Starts every page the sidebar opens from its top.
 *
 * The sidebar moves between pages without reloading, and the router leaves the window where it was,
 * so a page opened from halfway down the previous one would open halfway down itself.
 */
function useScrollTopOnNavigation( locationKey: string ) {
    const previousLocationKey = React.useRef( locationKey );

    React.useEffect( () => {
        if ( previousLocationKey.current === locationKey ) {
            return;
        }

        previousLocationKey.current = locationKey;

        window.scrollTo( { top: 0 } );
    }, [ locationKey ] );
}

export default function DocsLayout( { navigation, children }: {
    navigation: DocsNavigation,
    children: React.ReactNode
} ) {
    const { pathname, search } = useLocation(),
        locationKey = pathname + search,
        activeHref = findActiveDocsHref( navigation, pathname, search ),
        trail = findDocsTrail( navigation, activeHref );

    useScrollTopOnNavigation( locationKey );

    return (
        <div className="mx-auto w-full max-w-[1440px] px-5 nav:px-8">
            <div className="xl:grid xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8">
                <aside className="hidden xl:block">
                    <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-8">
                        <DocsSidebar navigation={ navigation } activeHref={ activeHref }/>
                    </div>
                </aside>

                { /* Keyed by the location so it closes behind whatever it just opened. */ }
                <details key={ locationKey }
                    className="mb-6 rounded-xl border border-vc-hairline bg-vc-space-lighter/70 xl:hidden">
                    <summary className="cursor-pointer px-4 py-3 font-body text-vc-starlight">
                        { navigation.title } menu
                    </summary>

                    <div className="border-t border-vc-hairline p-4">
                        <DocsSidebar navigation={ navigation } activeHref={ activeHref }/>
                    </div>
                </details>

                <article className="vc-page-panel @container/vc-content w-full min-w-0 max-md:pt-2">
                    { trail.length > 0 && <DocsBreadcrumb trail={ trail }/> }

                    <React.Suspense fallback={ <div className="min-h-[60vh]" aria-busy="true"/> }>
                        { children }
                    </React.Suspense>

                    <DocsPager navigation={ navigation } activeHref={ activeHref }/>
                </article>
            </div>
        </div>
    );
}
