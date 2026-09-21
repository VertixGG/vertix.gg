/**
 * Per-route metadata. Plain data with no JSX or lazy imports, so the build's
 * sitemap generator can import it directly alongside the runtime.
 *
 * Every route needs its own title and description: the app is a single-page
 * client-rendered bundle, so without this all routes serve the one static pair
 * from `index.html` and compete with each other as the same document.
 */

export const SITE_ORIGIN = "https://voicechannels.online";

export const SITE_NAME = "VoiceChannels";

export const SITE_OG_IMAGE = {
    PATH: "/og-card.png",
    WIDTH: "1200",
    HEIGHT: "630",
    ALT: "VoiceChannels - temporary Discord voice channels, on demand",
} as const;

export interface RouteMeta {
    path: string;
    title: string;
    description: string;
    /** Left out of the sitemap — thin, duplicated, or not a landing page. */
    noSitemap?: boolean;
    /** Relative weight for the sitemap, 0.0–1.0. */
    priority?: number;
    /** Page component, relative to the app root; the sitemap reads its git date. */
    sourcePath?: string;
}

export const DEFAULT_META = {
    title: "Discord Temporary Voice Channels — Join to Create Bot | VoiceChannels",
    description:
        "VoiceChannels creates temporary voice channels on demand for your Discord server, "
        + "with per-channel owner controls, auto-scaling and a web dashboard.",
};

export const NOT_FOUND_META = {
    title: "Page Not Found | VoiceChannels",
    description: "That page does not exist on voicechannels.online.",
};

export const ROUTE_META: readonly RouteMeta[] = [
    {
        path: "/",
        sourcePath: "src/vertix/pages/home.tsx",
        title: DEFAULT_META.title,
        description: DEFAULT_META.description,
        priority: 1.0,
    },
    {
        path: "/features/dynamic-channel-v2",
        sourcePath: "src/vertix/pages/features/dynamic-channel-v2.tsx",
        title: "Dynamic Channel V2 — Buttons Interface | VoiceChannels",
        description:
            "The classic VoiceChannels control panel: rename, user limit, clear chat, privacy, "
            + "access, reset, transfer and claim — all from buttons in your voice channel.",
        priority: 0.9,
    },
    {
        path: "/features/dynamic-channel-v3",
        sourcePath: "src/vertix/pages/features/dynamic-channel-v3.tsx",
        title: "Dynamic Channel V3 — Modern Interface | VoiceChannels",
        description:
            "The V3 interface for temporary voice channels: channel templates, region control, "
            + "granular permissions, editable primary message and one-click presets.",
        priority: 0.9,
    },
    {
        path: "/features/auto-scaling",
        sourcePath: "src/vertix/pages/features/auto-scaling.tsx",
        title: "Auto-Scaling Voice Channels | VoiceChannels",
        description:
            "Automatically create and remove Discord voice channels as demand changes, so your "
            + "server never runs out of capacity and never leaves empty channels behind.",
        priority: 0.9,
    },
    {
        path: "/posts/join-to-create",
        sourcePath: "src/vertix/posts/join-to-create.tsx",
        title: "Join to Create Voice Channels in Discord | VoiceChannels",
        description:
            "How Join to Create works: one generator channel makes a room for whoever joins it, "
            + "hands them the controls, and deletes it once everyone leaves.",
        priority: 0.9,
    },
    {
        path: "/posts/comparison",
        sourcePath: "src/vertix/posts/comparison.tsx",
        title: "Discord Temporary Voice Channel Bots Compared | VoiceChannels",
        description:
            "VoiceChannels against VoiceMaster, TempVoice and Astro, control by control - "
            + "server counts, ratings, what each one charges for, and what needs a vote.",
        priority: 0.8,
    },
    {
        path: "/posts/how-to-setup",
        sourcePath: "src/vertix/posts/how-to-setup.tsx",
        title: "How to Set Up Temporary Voice Channels | VoiceChannels",
        description:
            "Step-by-step setup for VoiceChannels: run /setup, pick a master channel and "
            + "configure the buttons interface for your Discord server.",
        priority: 0.8,
    },
    {
        path: "/posts/how-to-setup-logs-channel",
        sourcePath: "src/vertix/posts/how-to-setup-logs-channel.tsx",
        title: "How to Enable a Logs Channel | VoiceChannels",
        description:
            "Send temporary voice channel activity to a log channel, with a separate log per "
            + "voice channels generator.",
        priority: 0.7,
    },
    {
        path: "/posts/channel-name-placeholders",
        sourcePath: "src/vertix/posts/channel-name-placeholders.tsx",
        title: "Channel Name Placeholders | VoiceChannels",
        description:
            "Every placeholder VoiceChannels understands in a channel name, a channel status, an "
            + "auto-scaling prefix and a primary message - what each one becomes and where it works.",
        priority: 0.7,
    },
    {
        path: "/posts/enable-features",
        sourcePath: "src/vertix/posts/enable-features.tsx",
        title: "How to Enable Channel Features | VoiceChannels",
        description:
            "Turn individual dynamic channel features — such as transfer ownership — on or off "
            + "for your Discord server.",
        priority: 0.7,
    },
    {
        path: "/pricing",
        sourcePath: "src/vertix/pages/pricing.tsx",
        title: "Plans and Pricing | VoiceChannels",
        description:
            "Every feature is free. A plan buys how many generators a server may run at once - "
            + "two free, five on Plus, fifteen on Pro, bought inside Discord.",
        priority: 0.8,
    },
    {
        path: "/changelog",
        sourcePath: "src/vertix/pages/changelog.tsx",
        title: "Changelog | VoiceChannels",
        description: "Release notes for the VoiceChannels Discord bot.",
        priority: 0.5,
    },
    {
        path: "/invite-vertix",
        sourcePath: "src/vertix/pages/invite-vertix.tsx",
        title: "Invite VoiceChannels to Your Server",
        description:
            "Add the VoiceChannels bot to your Discord server with recommended or minimal "
            + "permissions.",
        priority: 0.8,
    },
    {
        path: "/credits",
        sourcePath: "src/vertix/pages/credits.tsx",
        title: "Credits | VoiceChannels",
        description: "People who contributed translations and improvements to VoiceChannels.",
        priority: 0.3,
    },
    {
        path: "/privacy-policy",
        sourcePath: "src/vertix/pages/legal-polices/privacy-policy.tsx",
        title: "Privacy Policy | VoiceChannels",
        description: "How the VoiceChannels Discord bot handles your data.",
        priority: 0.3,
    },
    {
        path: "/terms-of-service",
        sourcePath: "src/vertix/pages/legal-polices/terms-of-service.tsx",
        title: "Terms of Service | VoiceChannels",
        description: "Terms for using the VoiceChannels Discord bot.",
        priority: 0.3,
    },
    {
        path: "/refund-policy",
        sourcePath: "src/vertix/pages/legal-polices/refund-policy.tsx",
        title: "Refund Policy | VoiceChannels",
        description: "Refunds, cancelling, and what happens to your server when a VoiceChannels plan ends.",
        priority: 0.3,
    },
    {
        path: "/welcome",
        sourcePath: "src/vertix/pages/welcome.tsx",
        title: "Welcome to VoiceChannels",
        description:
            "A guided tour of VoiceChannels: master channels, dynamic channels, auto-scaling "
            + "and the dashboard.",
        // Onboarding surface shown after install, not a search landing page.
        noSitemap: true,
    },
];

const META_BY_PATH = new Map( ROUTE_META.map( ( meta ) => [ meta.path, meta ] ) );

export function getRouteMeta( pathname: string ): RouteMeta | undefined {
    return META_BY_PATH.get( pathname );
}
