import { useLocation } from "react-router-dom";

import { DOCS_HOME, findDocsSection } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

import { normalizeRoutePath } from "@vertix.gg/website/src/vertix/seo/site-meta";

import DocsSidebar from "@vertix.gg/website/src/vertix/docs/docs-sidebar";
import DocsPager from "@vertix.gg/website/src/vertix/docs/docs-pager";

export default function DocsLayout( { children }: { children: React.ReactNode } ) {
    const { pathname } = useLocation(),
        currentPath = normalizeRoutePath( pathname ),
        section = findDocsSection( currentPath );

    return (
        <div className="mx-auto w-full max-w-[1440px] px-5 nav:px-8">
            <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
                <aside className="hidden lg:block">
                    <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-8">
                        <DocsSidebar currentPath={ currentPath }/>
                    </div>
                </aside>

                <details className="mb-6 rounded-xl border border-vc-hairline bg-vc-space-lighter/70 lg:hidden">
                    <summary className="cursor-pointer px-4 py-3 font-body text-vc-starlight">
                        Docs menu
                    </summary>

                    <div className="border-t border-vc-hairline p-4">
                        <DocsSidebar currentPath={ currentPath }/>
                    </div>
                </details>

                <article className="vc-page-panel w-full min-w-0 max-md:pt-2">
                    { section &&
                        <nav aria-label="Breadcrumb"
                            className="mb-4 flex items-center gap-2 font-body text-fine text-vc-ice-dim">
                            <a className="text-vc-ice-dim hover:text-vc-cyan" href={ DOCS_HOME.href }>Docs</a>
                            <span aria-hidden="true">/</span>
                            <span>{ section.title }</span>
                        </nav>
                    }

                    { children }

                    <DocsPager currentPath={ currentPath }/>
                </article>
            </div>
        </div>
    );
}
