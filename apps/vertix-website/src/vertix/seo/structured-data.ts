import {
    DEFAULT_META,
    SITE_NAME,
    SITE_OG_IMAGE,
    SITE_ORIGIN,
    getRouteMeta
} from "@vertix.gg/website/src/vertix/seo/site-meta";

export type JsonLdValue = string | number | boolean | JsonLdValue[] | { [ key: string ]: JsonLdValue };

export type JsonLdNode = { [ key: string ]: JsonLdValue };

const SCHEMA_CONTEXT = "https://schema.org";

const HOME_PATH = "/";

const BRAND_LOGO_PATH = "/vc-naked.png";

const APPLICATION_CATEGORY = "UtilitiesApplication";

const APPLICATION_OPERATING_SYSTEM = "Discord";

const OFFER_PRICE = "0";

const OFFER_CURRENCY = "USD";

const TITLE_SUFFIX_SEPARATORS = [ " | ", " — " ] as const;

export const SITE_PROFILES = {
    SUPPORT_SERVER: "https://discord.gg/dEwKeQefUU",
    TOP_GG: "https://top.gg/bot/1538844311062581339",
} as const;

const FEATURE_LIST = [
    "Join to Create temporary voice channels",
    "Empty voice channels are deleted automatically",
    "Per-channel owner controls: rename, user limit, access, privacy and region",
    "Auto-scaling voice channel pools",
    "Channel templates and presets",
    "Activity logs per generator",
    "Web dashboard for embeds, buttons and translations",
] as const;

function toBreadcrumbName( title: string ): string {
    for ( const separator of TITLE_SUFFIX_SEPARATORS ) {
        const index = title.indexOf( separator );

        if ( -1 !== index ) {
            return title.slice( 0, index );
        }
    }

    return title;
}

export function buildSoftwareApplicationNode(): JsonLdNode {
    return {
        "@context": SCHEMA_CONTEXT,
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url: SITE_ORIGIN + HOME_PATH,
        description: DEFAULT_META.description,
        applicationCategory: APPLICATION_CATEGORY,
        operatingSystem: APPLICATION_OPERATING_SYSTEM,
        image: SITE_ORIGIN + SITE_OG_IMAGE.PATH,
        featureList: [ ...FEATURE_LIST ],
        offers: {
            "@type": "Offer",
            price: OFFER_PRICE,
            priceCurrency: OFFER_CURRENCY,
        },
        sameAs: [ SITE_PROFILES.SUPPORT_SERVER, SITE_PROFILES.TOP_GG ],
    };
}

export function buildOrganizationNode(): JsonLdNode {
    return {
        "@context": SCHEMA_CONTEXT,
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_ORIGIN + HOME_PATH,
        logo: SITE_ORIGIN + BRAND_LOGO_PATH,
        sameAs: [ SITE_PROFILES.SUPPORT_SERVER, SITE_PROFILES.TOP_GG ],
    };
}

export function buildBreadcrumbNode( pathname: string ): JsonLdNode | null {
    const meta = getRouteMeta( pathname );

    if ( ! meta || HOME_PATH === meta.path ) {
        return null;
    }

    return {
        "@context": SCHEMA_CONTEXT,
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: SITE_NAME,
                item: SITE_ORIGIN + HOME_PATH,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: toBreadcrumbName( meta.title ),
                item: SITE_ORIGIN + meta.path,
            },
        ],
    };
}

export function getStructuredData( pathname: string ): JsonLdNode[] {
    const meta = getRouteMeta( pathname );

    if ( ! meta ) {
        return [];
    }

    if ( HOME_PATH === meta.path ) {
        return [ buildSoftwareApplicationNode(), buildOrganizationNode() ];
    }

    const breadcrumb = buildBreadcrumbNode( pathname );

    return breadcrumb ? [ breadcrumb ] : [];
}
