import type { DocsNavigation } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

export const GUIDES_NAVIGATION: DocsNavigation = {
    title: "Docs",
    home: { title: "Overview", href: "/docs" },
    sections: [
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
                { title: "Event Check-in", href: "/posts/event-check-in" },
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
    ],
};
