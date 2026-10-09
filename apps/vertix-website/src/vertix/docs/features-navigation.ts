import {
    DYNAMIC_CHANNEL_V2_FEATURES,
    DYNAMIC_CHANNEL_V2_FEATURES_PATH,
    DYNAMIC_CHANNEL_V3_FEATURES,
    DYNAMIC_CHANNEL_V3_FEATURES_PATH,
    toDynamicChannelFeatureHref
} from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import type { DynamicChannelFeature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import type { DocsNavigation, DocsPage } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

export interface FeatureProduct {
    title: string;
    href: string;
    features: readonly DynamicChannelFeature[];
}

export const FEATURE_PRODUCTS: readonly FeatureProduct[] = [
    {
        title: "Dynamic Channels v3",
        href: DYNAMIC_CHANNEL_V3_FEATURES_PATH,
        features: DYNAMIC_CHANNEL_V3_FEATURES,
    },
    {
        title: "Dynamic Channels v2",
        href: DYNAMIC_CHANNEL_V2_FEATURES_PATH,
        features: DYNAMIC_CHANNEL_V2_FEATURES,
    },
    {
        title: "Auto-Scaling Channels",
        href: "/features/auto-scaling",
        features: [],
    },
    {
        title: "Team Lobby",
        href: "/features/team-lobby",
        features: [],
    },
];

/** What the bot does for a server beyond its channels. */
export const SERVER_TOOLS: readonly FeatureProduct[] = [
    {
        title: "Events",
        href: "/features/events",
        features: [],
    },
];

/**
 * The three role settings, which the bot keeps together too - `/manage roles` opens them and
 * nothing else. Titled the way `/setup` heads them, since that is where an admin meets them.
 */
export const SERVER_ROLES: readonly FeatureProduct[] = [
    {
        title: "Server Voice Role",
        href: "/features/voice-role",
        features: [],
    },
    {
        title: "Server Verified Roles",
        href: "/features/verified-roles",
        features: [],
    },
    {
        title: "Server Staff Roles",
        href: "/features/staff-roles",
        features: [],
    },
];

function toDocsPage( product: FeatureProduct ): DocsPage {
    if ( ! product.features.length ) {
        return { title: product.title, href: product.href };
    }

    return {
        title: product.title,
        href: product.href,
        pages: product.features.map( ( feature ) => ( {
            title: feature.title,
            href: toDynamicChannelFeatureHref( product.href, feature.value ),
        } ) ),
    };
}

export const FEATURES_NAVIGATION: DocsNavigation = {
    title: "Features",
    home: { title: "Overview", href: "/features" },
    sections: [
        {
            title: "Channel types",
            pages: FEATURE_PRODUCTS.map( toDocsPage ),
        },
        {
            title: "Server tools",
            pages: SERVER_TOOLS.map( toDocsPage ),
        },
        {
            title: "Server roles",
            pages: SERVER_ROLES.map( toDocsPage ),
        },
    ],
};
