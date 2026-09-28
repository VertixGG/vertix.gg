import { normalizeRoutePath } from "@vertix.gg/website/src/vertix/seo/site-meta";

export interface DocsPage {
    title: string;
    href: string;
}

export interface DocsSection {
    title: string;
    pages: readonly DocsPage[];
}

export const DOCS_HOME: DocsPage = {
    title: "Overview",
    href: "/docs",
};

export const DOCS_SECTIONS: readonly DocsSection[] = [
    {
        title: "Getting started",
        pages: [
            { title: "Join to Create", href: "/posts/join-to-create" },
            { title: "Setup", href: "/posts/how-to-setup" },
        ],
    },
    {
        title: "Configuration",
        pages: [
            { title: "Enable Features", href: "/posts/enable-features" },
            { title: "Logs Channel", href: "/posts/how-to-setup-logs-channel" },
            { title: "Name Placeholders", href: "/posts/channel-name-placeholders" },
            { title: "Disable AutoStatus", href: "/posts/disable-auto-status" },
        ],
    },
    {
        title: "Resources",
        pages: [
            { title: "Comparison", href: "/posts/comparison" },
        ],
    },
];

const DOCS_PAGES = DOCS_SECTIONS.flatMap( ( section ) => section.pages );

export function isDocsPath( pathname: string ): boolean {
    const path = normalizeRoutePath( pathname );

    return DOCS_HOME.href === path || DOCS_PAGES.some( ( page ) => page.href === path );
}

export function findDocsSection( pathname: string ): DocsSection | undefined {
    const path = normalizeRoutePath( pathname );

    return DOCS_SECTIONS.find( ( section ) => section.pages.some( ( page ) => page.href === path ) );
}

export function findDocsNeighbours( pathname: string ): { previous?: DocsPage, next?: DocsPage } {
    const path = normalizeRoutePath( pathname ),
        index = DOCS_PAGES.findIndex( ( page ) => page.href === path );

    if ( -1 === index ) {
        return {};
    }

    return {
        previous: DOCS_PAGES[ index - 1 ],
        next: DOCS_PAGES[ index + 1 ],
    };
}
