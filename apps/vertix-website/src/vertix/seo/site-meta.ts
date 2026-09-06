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

export interface RouteMeta {
    path: string;
    title: string;
    description: string;
    /** Left out of the sitemap — thin, duplicated, or not a landing page. */
    noSitemap?: boolean;
    /** Relative weight for the sitemap, 0.0–1.0. */
    priority?: number;
}

export const DEFAULT_META = {
    title: "VoiceChannels — Temporary Voice Channels Discord Bot",
    description:
        "VoiceChannels creates temporary voice channels on demand for your Discord server, "
        + "with per-channel owner controls, auto-scaling and a web dashboard.",
};

export const ROUTE_META: readonly RouteMeta[] = [
    {
        path: "/",
        title: DEFAULT_META.title,
        description: DEFAULT_META.description,
        priority: 1.0,
    },
    {
        path: "/features/dynamic-channel-v2",
        title: "Dynamic Channel V2 — Buttons Interface | VoiceChannels",
        description:
            "The classic VoiceChannels control panel: rename, user limit, clear chat, privacy, "
            + "access, reset, transfer and claim — all from buttons in your voice channel.",
        priority: 0.9,
    },
    {
        path: "/features/dynamic-channel-v3",
        title: "Dynamic Channel V3 — Modern Interface | VoiceChannels",
        description:
            "The V3 interface for temporary voice channels: channel templates, region control, "
            + "granular permissions, editable primary message and one-click presets.",
        priority: 0.9,
    },
    {
        path: "/features/auto-scaling",
        title: "Auto-Scaling Voice Channels | VoiceChannels",
        description:
            "Automatically create and remove Discord voice channels as demand changes, so your "
            + "server never runs out of capacity and never leaves empty channels behind.",
        priority: 0.9,
    },
    {
        path: "/posts/how-to-setup",
        title: "How to Set Up Temporary Voice Channels | VoiceChannels",
        description:
            "Step-by-step setup for VoiceChannels: run /setup, pick a master channel and "
            + "configure the buttons interface for your Discord server.",
        priority: 0.8,
    },
    {
        path: "/posts/how-to-setup-logs-channel",
        title: "How to Enable a Logs Channel | VoiceChannels",
        description:
            "Send temporary voice channel activity to a log channel, with a separate log per "
            + "voice channels generator.",
        priority: 0.7,
    },
    {
        path: "/posts/channel-name-placeholders",
        title: "Channel Name Placeholders | VoiceChannels",
        description:
            "Every placeholder VoiceChannels understands in a channel name, an auto-scaling prefix "
            + "and a primary message - what each one becomes and where it works.",
        priority: 0.7,
    },
    {
        path: "/posts/enable-transfer-ownership",
        title: "How to Enable Channel Features | VoiceChannels",
        description:
            "Turn individual dynamic channel features — such as transfer ownership — on or off "
            + "for your Discord server.",
        priority: 0.7,
    },
    {
        path: "/changelog",
        title: "Changelog | VoiceChannels",
        description: "Release notes for the VoiceChannels Discord bot.",
        priority: 0.5,
    },
    {
        path: "/invite-vertix",
        title: "Invite VoiceChannels to Your Server",
        description:
            "Add the VoiceChannels bot to your Discord server with recommended or minimal "
            + "permissions.",
        priority: 0.8,
    },
    {
        path: "/credits",
        title: "Credits | VoiceChannels",
        description: "People who contributed translations and improvements to VoiceChannels.",
        priority: 0.3,
    },
    {
        path: "/privacy-policy",
        title: "Privacy Policy | VoiceChannels",
        description: "How the VoiceChannels Discord bot handles your data.",
        priority: 0.3,
    },
    {
        path: "/terms-of-service",
        title: "Terms of Service | VoiceChannels",
        description: "Terms for using the VoiceChannels Discord bot.",
        priority: 0.3,
    },
    {
        path: "/welcome",
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
