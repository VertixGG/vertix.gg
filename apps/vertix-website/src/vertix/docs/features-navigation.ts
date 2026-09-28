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
    ],
};
