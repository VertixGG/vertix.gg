import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { findDocsNeighbours } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

import type { DocsNavigation } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

const PAGER_LINK =
    "flex flex-col gap-1 rounded-xl border border-vc-hairline bg-vc-space/60 px-5 py-4 " +
    "transition-colors hover:border-vc-hairline-bright hover:bg-vc-surface";

const PAGER_LABEL = "font-body text-fine text-vc-ice-dim";

const PAGER_TITLE = "font-body text-lg font-semibold text-vc-starlight";

export default function DocsPager( { navigation, activeHref }: {
    navigation: DocsNavigation,
    activeHref?: string
} ) {
    const { previous, next } = findDocsNeighbours( navigation, activeHref );

    if ( ! previous && ! next ) {
        return null;
    }

    return (
        <nav aria-label="Previous and next page"
            className="mt-12 grid gap-4 border-t border-vc-hairline pt-8 sm:grid-cols-2">
            { previous &&
                <RouterLink className={ PAGER_LINK } to={ previous.href }>
                    <span className={ PAGER_LABEL }>← Previous</span>
                    <span className={ PAGER_TITLE }>{ previous.title }</span>
                </RouterLink>
            }

            { next &&
                <RouterLink className={ `${ PAGER_LINK } items-end text-right sm:col-start-2` } to={ next.href }>
                    <span className={ PAGER_LABEL }>Next →</span>
                    <span className={ PAGER_TITLE }>{ next.title }</span>
                </RouterLink>
            }
        </nav>
    );
}
