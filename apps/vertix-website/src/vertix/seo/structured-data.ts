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

const HOW_TO_SETUP_PATH = "/posts/how-to-setup";

/*
 * The setup guide, said the way schema.org says a procedure.
 *
 * Every string below is the page's own wording, copied rather than rewritten: a rich result is only
 * eligible while the markup and the page agree, and the check is on the text, not the intent. So a
 * step renamed on the page has to be renamed here in the same commit, or the markup quietly stops
 * qualifying - it does not fail, it just stops being used.
 */
const HOW_TO_STEPS = [
    {
        name: "Set default channel's name template",
        text: "Join the Master Channel ( ➕ New Channel ) to generate a temporary voice channel, and set the "
            + "name template the generated channels are created with.",
    },
    {
        name: "Set temporary dynamic channel's button interface",
        text: "Choose which buttons the channel owner is given - rename, user limit, access, privacy, "
            + "region and the rest of the interface.",
    },
    {
        name: "Set verified roles",
        text: "Choose which roles a generated channel is visible to. For most servers @everyone is enough.",
    },
] as const;

const FAQ_ENTRIES = [
    {
        question: "What is a Master Channel?",
        answer: "A voice channel that generate dynamic temporary voice channels, his name will be "
            + "( ➕ New Channel )",
    },
    {
        question: "How i generate new temporary dynamic channel?",
        answer: "Simply just join the Master Channel ( ➕ New Channel ) and you will be automatically moved "
            + "to new temporary voice channel",
    },
    {
        question: "What is Default Channel's Name Template?",
        answer: "Its the name that will be used to create the temporary voice channels, that are created by "
            + "joining this Master Channel.",
    },
    {
        question: "What is {user}?",
        answer: "Its name Placeholder that will be used to create the temporary voice channels, that are "
            + "created by joining this Master Channel.",
    },
    {
        question: "Do I need to set Verified Roles?",
        answer: "For most Discord servers, the @everyone role is sufficient. However, there are use cases "
            + "where you may need additional roles.",
    },
] as const;

/*
 * Every place the bot is described that is not this site, which is how Google ties those pages and
 * this one into the same thing. top.gg answers 404 until the listing is approved, and is kept so that
 * it counts from the day it is.
 */
export const SITE_PROFILES = {
    SUPPORT_SERVER: "https://discord.gg/dEwKeQefUU",
    DISCORD_APP_DIRECTORY: "https://discord.com/discovery/applications/1538844311062581339",
    TOP_GG: "https://top.gg/bot/1538844311062581339",
    DISCORD_BOT_LIST: "https://discordbotlist.com/bots/voicechannels",
    DISCORD_BOTS_NET: "https://discordbots.net/bot/4003-voicechannels",
    GITHUB: "https://github.com/VertixGG/vertix.gg",
} as const;

/*
 * What the site is called, as opposed to what its address is.
 *
 * Without a WebSite node Google names a result after its hostname - "voicechannels.online" - and
 * reads "voicechannels" typed as one word as the generic "voice channels", so a search for the name
 * does not come back to the site. The domain is listed as an alternate the way Google's own example
 * lists one.
 */
const SITE_ALTERNATE_NAMES = [ "Voice Channels", "voicechannels.online" ] as const;

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

export function buildWebSiteNode(): JsonLdNode {
    return {
        "@context": SCHEMA_CONTEXT,
        "@type": "WebSite",
        name: SITE_NAME,
        alternateName: [ ...SITE_ALTERNATE_NAMES ],
        url: SITE_ORIGIN + HOME_PATH,
    };
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
        sameAs: [ ...Object.values( SITE_PROFILES ) ],
    };
}

export function buildOrganizationNode(): JsonLdNode {
    return {
        "@context": SCHEMA_CONTEXT,
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_ORIGIN + HOME_PATH,
        logo: SITE_ORIGIN + BRAND_LOGO_PATH,
        sameAs: [ ...Object.values( SITE_PROFILES ) ],
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

export function buildHowToNode( pathname: string ): JsonLdNode | null {
    const meta = getRouteMeta( pathname );

    if ( ! meta || HOW_TO_SETUP_PATH !== meta.path ) {
        return null;
    }

    return {
        "@context": SCHEMA_CONTEXT,
        "@type": "HowTo",
        name: toBreadcrumbName( meta.title ),
        description: meta.description,
        image: SITE_ORIGIN + SITE_OG_IMAGE.PATH,
        totalTime: "PT5M",
        step: HOW_TO_STEPS.map( ( step, index ) => ( {
            "@type": "HowToStep",
            position: index + 1,
            name: step.name,
            text: step.text,
            url: SITE_ORIGIN + meta.path + "#step-" + ( index + 1 ),
        } ) ),
    };
}

export function buildFaqNode( pathname: string ): JsonLdNode | null {
    const meta = getRouteMeta( pathname );

    if ( ! meta || HOW_TO_SETUP_PATH !== meta.path ) {
        return null;
    }

    return {
        "@context": SCHEMA_CONTEXT,
        "@type": "FAQPage",
        mainEntity: FAQ_ENTRIES.map( ( entry ) => ( {
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: entry.answer,
            },
        } ) ),
    };
}

export function getStructuredData( pathname: string ): JsonLdNode[] {
    const meta = getRouteMeta( pathname );

    if ( ! meta ) {
        return [];
    }

    if ( HOME_PATH === meta.path ) {
        return [ buildWebSiteNode(), buildSoftwareApplicationNode(), buildOrganizationNode() ];
    }

    const nodes = [
        buildBreadcrumbNode( pathname ),
        buildHowToNode( pathname ),
        buildFaqNode( pathname ),
    ];

    return nodes.filter( ( node ): node is JsonLdNode => null !== node );
}
