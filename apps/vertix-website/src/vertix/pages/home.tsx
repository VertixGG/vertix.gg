import VertixAvatar from "@vertix.gg/assets/brand/vc.png";
import OwnerAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import ChannelLifecycle from "@vertix.gg/website/src/vertix/components/landing/channel-lifecycle";
import DiscordDynamicChannelV3 from "@vertix.gg/website/src/vertix/components/discord/discord-dynamic-channel-v3";

/** One place for the ramp the explainer cards and feature grid walk through. */
const CRIMSON = "var(--color-vc-crimson)",
    AZURE = "var(--color-vc-azure)",
    CYAN = "var(--color-vc-cyan)",
    MINT = "var(--color-vc-mint)";

const LIFECYCLE_STEPS = [
    {
        accent: CRIMSON,
        mark: "1",
        title: "You create one generator",
        body: "A single voice channel — call it whatever you like. It's the only "
            + "one that stays in your list permanently.",
    },
    {
        accent: AZURE,
        mark: "2",
        title: "Members get a room of their own",
        body: "Anyone who joins the generator is moved straight into a fresh "
            + "channel, named after them, with them in charge of it.",
    },
    {
        accent: MINT,
        mark: "3",
        title: "Empty rooms disappear",
        body: "The moment the last person leaves, the channel is deleted. Your "
            + "server never collects abandoned voice channels again.",
    },
] as const;

const OWNER_CONTROLS = [
    { icon: "✏️", title: "Rename", body: "Give the room a name that fits what's happening in it." },
    { icon: "✋", title: "Limit", body: "Cap how many people can squeeze in." },
    { icon: "🚫", title: "Privacy", body: "Flip between public and invite-only." },
    { icon: "🙈", title: "Visibility", body: "Hide the channel from everyone who isn't in it." },
    { icon: "👥", title: "Access", body: "Allow or block individual members." },
    { icon: "🔀", title: "Transfer", body: "Hand the room over to someone else." },
] as const;

const PLATFORM = [
    {
        accent: CYAN,
        mark: "⌘",
        title: "One-command setup",
        body: "Run /setup and pick your options. Every feature and every piece of "
            + "the interface stays editable from the same command.",
        href: "/posts/how-to-setup",
        linkText: "How to set it up",
    },
    {
        accent: AZURE,
        mark: "⧉",
        title: "Auto-scaling channels",
        body: "Keep a pool of channels that grows and shrinks with demand, so busy "
            + "servers never run out of room and quiet ones stay tidy.",
        href: "/features/auto-scaling",
        linkText: "See auto-scaling",
    },
    {
        accent: MINT,
        mark: "❯❯",
        title: "Activity logs",
        body: "Point each generator at a log channel and watch channels being "
            + "created, renamed, claimed and removed.",
        href: "/posts/how-to-setup-logs-channel",
        linkText: "Enable logs",
    },
    {
        accent: CRIMSON,
        mark: "▨",
        title: "Web dashboard",
        body: "Edit embeds, buttons and every string the bot says — per language — "
            + "without touching a single command.",
        href: DASHBOARD_URL,
        linkText: "Open the dashboard",
        external: true,
    },
] as const;

const goToInvite = () => {
    window.location.href = "/invite-vertix";
};

export default function Home() {
    return (
        <>
            { /* --- Hero ------------------------------------------------------ */ }
            <section className="vc-shell vc-band-hero">
                <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-16">
                    <div className="flex-1">
                        <h1 className="vc-display mb-5">
                            Voice channels that<br className="hidden sm:block"/>
                            { " " }clean up after themselves
                        </h1>

                        <p className="vc-lede mb-8">
                            VoiceChannels makes a room the moment someone needs one, hands them the
                            controls, and deletes it once they&rsquo;re done. Your channel list stops
                            filling up with empties.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <button id="add-to-server" onClick={ goToInvite }
                                className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                                Add to Discord
                            </button>
                            <button onClick={ () => window.open( DASHBOARD_URL ) }
                                className="vc-btn vc-btn-lg">
                                Open Dashboard
                            </button>
                        </div>

                        <p className="vc-eyebrow mt-6 mb-0">
                            Free to add · Set up with one command
                        </p>
                    </div>

                    <div className="flex shrink-0 justify-center lg:justify-end">
                        <ChannelLifecycle/>
                    </div>
                </div>
            </section>

            { /* --- What is a temporary channel -------------------------------- */ }
            <section className="vc-shell vc-band">
                <h2 className="vc-section-title mb-3">What&rsquo;s a temporary channel?</h2>
                <p className="vc-lede mb-10">
                    Three moving parts, and you only ever set up the first one.
                </p>

                <div className="grid gap-5 md:grid-cols-3">
                    { LIFECYCLE_STEPS.map( ( step ) => (
                        <div key={ step.mark } className="vc-card">
                            <span className="vc-card-mark"
                                style={ { "--vc-card-accent": step.accent } as React.CSSProperties }>
                                { step.mark }
                            </span>
                            <h3 className="mb-2 text-h5 font-semibold">{ step.title }</h3>
                            <p className="mb-0 text-vc-ice-dim">{ step.body }</p>
                        </div>
                    ) ) }
                </div>
            </section>

            { /* --- Members moderate themselves -------------------------------- */ }
            <section className="vc-shell vc-band">
                <h2 className="vc-section-title mb-3">Members moderate themselves</h2>
                <p className="vc-lede mb-10">
                    Whoever creates a channel owns it. They get a control panel in the channel
                    itself &mdash; no moderator, no commands, no waiting for you.
                </p>

                { /* The real V3 panel, not a mock-up of one. It carries its own
                    width, so it gets the full measure rather than a column
                    beside the copy — squeezed into half, the control grid
                    inside it wraps into an unreadable stack. */ }
                <div className="vc-landing-chat mb-12 hidden justify-center lg:flex">
                    <DiscordDynamicChannelV3/>
                </div>

                <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                    { OWNER_CONTROLS.map( ( control ) => (
                        <div key={ control.title }>
                            <h3 className="mb-1 text-h6 font-semibold">
                                <span aria-hidden="true" className="mr-2">{ control.icon }</span>
                                { control.title }
                            </h3>
                            <p className="mb-0 text-vc-ice-dim">{ control.body }</p>
                        </div>
                    ) ) }
                </div>
            </section>

            { /* --- Platform --------------------------------------------------- */ }
            <section className="vc-shell vc-band">
                <h2 className="vc-section-title mb-3">And the rest of it</h2>
                <p className="vc-lede mb-10">
                    Everything around the channels themselves.
                </p>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    { PLATFORM.map( ( item ) => (
                        <div key={ item.title } className="vc-card flex flex-col">
                            <span className="vc-card-mark"
                                style={ { "--vc-card-accent": item.accent } as React.CSSProperties }>
                                { item.mark }
                            </span>
                            <h3 className="mb-2 text-h5 font-semibold">{ item.title }</h3>
                            <p className="mb-4 text-vc-ice-dim">{ item.body }</p>
                            <a className="mt-auto text-fine"
                                href={ item.href }
                                { ...( "external" in item && item.external
                                    ? { target: "_blank", rel: "noreferrer" }
                                    : {} ) }>
                                { item.linkText } →
                            </a>
                        </div>
                    ) ) }
                </div>
            </section>

            { /* --- Note from the maker ---------------------------------------- */ }
            <section className="vc-shell vc-band-wide">
                <div className="mx-auto max-w-[1000px]">
                    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                        <img src={ OwnerAvatar } alt=""
                            width="72" height="72"
                            className="h-18 w-18 shrink-0 rounded-full border border-vc-hairline-bright
                                object-cover"/>

                        <div>
                            <div className="mb-3 flex items-center gap-3">
                                <span className="font-semibold text-vc-starlight">Leonid Vinikov</span>
                                <span className="vc-eyebrow">Maker</span>
                            </div>

                            <p className="text-vc-ice">
                                Thanks for taking a look at VoiceChannels. Most of what&rsquo;s in the bot
                                today started as somebody&rsquo;s suggestion &mdash; I read every one, and a
                                good number of them ship.
                            </p>
                            <p className="mb-0 text-vc-ice">
                                If something is missing or in your way,{ " " }
                                <a href="mailto:leonidvinikov@gmail.com">tell me about it</a> or come say so
                                in{ " " }
                                <a href="https://discord.gg/dEwKeQefUU" target="_blank" rel="noreferrer">
                                    the support server
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            { /* --- Closing CTA ------------------------------------------------ */ }
            <section className="vc-shell vc-band">
                <div className="vc-card flex flex-col items-center gap-6 px-6 py-12 text-center">
                    <img src={ VertixAvatar } alt="" width="56" height="56"
                        className="h-14 w-14 rounded-2xl object-cover"/>

                    <div>
                        <h2 className="vc-section-title mb-3">Set it up in a minute</h2>
                        <p className="vc-lede mx-auto mb-0">
                            Add the bot, run <code>/setup</code>, pick a generator channel. That&rsquo;s
                            the whole thing.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button onClick={ goToInvite }
                            className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                            Add to Discord
                        </button>
                        <a href="/posts/how-to-setup" className="vc-btn vc-btn-lg">
                            Read the setup guide
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
