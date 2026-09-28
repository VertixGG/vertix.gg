import { DOCS_HOME, DOCS_SECTIONS } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

import type { DocsPage } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

const SECTION_TITLE = "mb-2 font-body text-fine font-semibold uppercase tracking-wide text-vc-ice-dim";

const LINK_LIST = "mb-0 list-none border-l border-vc-hairline pl-0";

const LINK_BASE = "-ml-px block border-l py-1.5 pl-4 font-body text-base transition-colors";

const LINK_IDLE = "border-transparent text-vc-ice hover:border-vc-ice-dim hover:text-vc-starlight";

const LINK_ACTIVE = "border-vc-cyan text-vc-cyan hover:text-vc-cyan";

const DocsSidebarLink: React.FC<{ page: DocsPage, currentPath: string }> = ( { page, currentPath } ) => {
    const isActive = page.href === currentPath;

    return (
        <li>
            <a
                className={ `${ LINK_BASE } ${ isActive ? LINK_ACTIVE : LINK_IDLE }` }
                aria-current={ isActive ? "page" : undefined }
                href={ page.href }
            >{ page.title }</a>
        </li>
    );
};

export default function DocsSidebar( { currentPath }: { currentPath: string } ) {
    return (
        <nav aria-label="Documentation" className="flex flex-col gap-6">
            <ul className={ LINK_LIST }>
                <DocsSidebarLink page={ DOCS_HOME } currentPath={ currentPath }/>
            </ul>

            { DOCS_SECTIONS.map( ( section ) =>
                <div key={ section.title }>
                    <p className={ SECTION_TITLE }>{ section.title }</p>

                    <ul className={ LINK_LIST }>
                        { section.pages.map( ( page ) =>
                            <DocsSidebarLink key={ page.href } page={ page } currentPath={ currentPath }/>
                        ) }
                    </ul>
                </div>
            ) }
        </nav>
    );
}
