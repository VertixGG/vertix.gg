import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import type { DocsLink, DocsNavigation, DocsPage } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

const SECTION_TITLE = "mb-2 font-body text-fine font-semibold uppercase tracking-wide text-vc-ice-dim";

const LINK_LIST = "mb-0 list-none border-l border-vc-hairline pl-0";

const NESTED_LINK_LIST = "mb-1 ml-4 list-none border-l border-vc-hairline pl-0";

const LINK_BASE = "-ml-px flex items-center justify-between gap-2 border-l py-1.5 pl-4 pr-2 font-body transition-colors";

const LINK_IDLE = "border-transparent text-vc-ice hover:border-vc-ice-dim hover:text-vc-starlight";

const LINK_OPEN = "border-transparent text-vc-starlight hover:border-vc-ice-dim";

const LINK_ACTIVE = "border-vc-cyan text-vc-cyan hover:text-vc-cyan";

function getLinkState( isActive: boolean, isOpen: boolean ): string {
    if ( isActive ) {
        return LINK_ACTIVE;
    }

    if ( isOpen ) {
        return LINK_OPEN;
    }

    return LINK_IDLE;
}

const DocsSidebarLink: React.FC<{
    link: DocsLink,
    activeHref?: string,
    size: string,
    isOpen?: boolean,
    children?: React.ReactNode
}> = ( { link, activeHref, size, isOpen = false, children } ) => {
    const isActive = link.href === activeHref;

    return (
        <RouterLink
            className={ `${ LINK_BASE } ${ size } ${ getLinkState( isActive, isOpen ) }` }
            aria-current={ isActive ? "page" : undefined }
            to={ link.href }
        >
            { link.title }
            { children }
        </RouterLink>
    );
};

const DocsSidebarPage: React.FC<{ page: DocsPage, activeHref?: string }> = ( { page, activeHref } ) => {
    const isOpen = page.href === activeHref || !! page.pages?.some( ( child ) => child.href === activeHref );

    if ( ! page.pages ) {
        return (
            <li>
                <DocsSidebarLink link={ page } activeHref={ activeHref } size="text-base"/>
            </li>
        );
    }

    return (
        <li>
            <DocsSidebarLink link={ page } activeHref={ activeHref } size="text-base" isOpen={ isOpen }>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    className={ `shrink-0 text-vc-ice-dim transition-transform ${ isOpen ? "rotate-90" : "" }` }>
                    <path d="m9 18 6-6-6-6"/>
                </svg>
            </DocsSidebarLink>

            { isOpen &&
                <ul className={ NESTED_LINK_LIST }>
                    { page.pages.map( ( child ) =>
                        <li key={ child.href }>
                            <DocsSidebarLink link={ child } activeHref={ activeHref } size="text-fine"/>
                        </li>
                    ) }
                </ul>
            }
        </li>
    );
};

export default function DocsSidebar( { navigation, activeHref }: {
    navigation: DocsNavigation,
    activeHref?: string
} ) {
    return (
        <nav aria-label={ navigation.title } className="flex flex-col gap-6">
            <ul className={ LINK_LIST }>
                <li>
                    <DocsSidebarLink link={ navigation.home } activeHref={ activeHref } size="text-base"/>
                </li>
            </ul>

            { navigation.sections.map( ( section, index ) =>
                <div key={ section.title ?? index }>
                    { section.title && <p className={ SECTION_TITLE }>{ section.title }</p> }

                    <ul className={ LINK_LIST }>
                        { section.pages.map( ( page ) =>
                            <DocsSidebarPage key={ page.href } page={ page } activeHref={ activeHref }/>
                        ) }
                    </ul>
                </div>
            ) }
        </nav>
    );
}
