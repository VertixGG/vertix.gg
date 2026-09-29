import React from "react";

import { useLocation } from "react-router-dom";

import VCBrandHeader from "@vertix.gg/assets/brand/vc-naked-header.webp";

import { isInDocsNavigation } from "@vertix.gg/website/src/vertix/docs/docs-navigation";
import { GUIDES_NAVIGATION } from "@vertix.gg/website/src/vertix/docs/guides-navigation";
import { FEATURES_NAVIGATION } from "@vertix.gg/website/src/vertix/docs/features-navigation";

const NAV_LINK_BASE =
    "relative block px-4 py-2 font-body text-lg text-vc-ice transition-colors " +
    "hover:text-vc-cyan focus:text-vc-cyan";

const isFeaturesPath = ( pathname: string ) => isInDocsNavigation( FEATURES_NAVIGATION, pathname );

const isGuidesPath = ( pathname: string ) => isInDocsNavigation( GUIDES_NAVIGATION, pathname );

const NavbarItem: React.FC<{
    title: string,
    href: string,
    isActivePath?: ( pathname: string ) => boolean
}> = ( { title, href, isActivePath = ( pathname ) => pathname === href } ) => {
    const location = useLocation(),
        isActive = isActivePath( location.pathname );

    return (
        <li>
            <a
                className={ `${ NAV_LINK_BASE } ${ isActive
                    ? "vc-nav-link-active text-vc-starlight"
                    : "" }` }
                aria-current={ isActive ? "page" : undefined }
                href={ href }
            >{ title }</a>
        </li>
    );
};

export default function Header() {
    const [ isNavbarOpen, setNavbarOpen ] = React.useState( false ),
        toggleNavbar = () => setNavbarOpen( ! isNavbarOpen );

    return (
        <header id="header" className="relative">
            { /* Vignette so the bar reads over the nebula without blacking it out. */ }
            <div className="vc-header-vignette pointer-events-none absolute inset-x-0 top-0 -z-10"/>

            <nav className="vc-header-glass relative z-20">
                <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center
                    justify-between px-5 nav:px-8">

                    <a className="vc-header-bar flex shrink-0 items-center" href="/">
                        { /* 324x192 is the mark's own band inside the square source
                            art; the stylesheet crops to it, so reserve that box here.

                            The header draws the mark at 112px at its widest, so it takes the
                            264px cut of the source rather than the 500px one the welcome page
                            needs - a third of the bytes for a logo that loads above the fold on
                            every page. Both are cut from the same art and have to be re-cut
                            together if it ever changes. */ }
                        <img className="vc-logo w-[88px] select-none lg:w-[112px]"
                            width="112" height="66"
                            src={ VCBrandHeader } alt="VoiceChannels"/>
                    </a>

                    <button
                        type="button"
                        className="flex items-center self-center rounded-xl border
                            border-vc-hairline-bright bg-vc-surface px-3 py-2 text-vc-ice
                            transition-colors hover:border-vc-ice-dim hover:text-vc-starlight
                            focus-visible:outline-none focus-visible:ring-3
                            focus-visible:ring-vc-cyan/25 nav:hidden"
                        aria-controls="navbar-menu"
                        aria-expanded={ isNavbarOpen }
                        aria-label="Toggle navigation"
                        onClick={ toggleNavbar }
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            aria-hidden="true">
                            <path d="M4 7h16M4 12h16M4 17h16"/>
                        </svg>
                    </button>

                    <div
                        id="navbar-menu"
                        className={ `${ isNavbarOpen ? "block" : "hidden" } order-last w-full
                            rounded-2xl border border-vc-hairline bg-vc-space-lighter/95 p-5
                            shadow-[0_24px_60px_rgb(6_7_10/0.6)] backdrop-blur-lg
                            mt-3 mb-5
                            nav:order-none nav:mt-0 nav:mb-0 nav:flex nav:w-auto nav:flex-1
                            nav:items-center nav:justify-between nav:rounded-none nav:border-0
                            nav:bg-transparent nav:p-0 nav:shadow-none nav:backdrop-blur-none` }
                    >
                        <ul className="flex list-none flex-col gap-1 pl-0
                            nav:flex-row nav:items-center nav:gap-2">
                            <NavbarItem title="Home" href="/"/>

                            <NavbarItem title="Features" href="/features" isActivePath={ isFeaturesPath }/>

                            <NavbarItem title="Docs" href="/docs" isActivePath={ isGuidesPath }/>

                            <NavbarItem title="Plans" href="/pricing"/>

                            <NavbarItem title="Change log" href="/changelog"/>
                        </ul>

                        <div className="mt-4 flex flex-col gap-3 nav:mt-0 nav:flex-row nav:gap-4">
                            <a id="add-to-server" href="/invite-vertix?src=site-header"
                                className="vc-btn vc-btn-primary vc-btn-effect w-full nav:w-auto">
                                Invite
                            </a>
                            <button id="dashboard"
                                onClick={ () => window.open( import.meta.env.VITE_DASHBOARD_URL || "https://dashboard.voicechannels.online" ) }
                                className="vc-btn w-full nav:w-auto">
                                Dashboard
                            </button>
                            <button id="support" onClick={ () => window.open( "https://discord.gg/dEwKeQefUU" ) }
                                className="vc-btn w-full nav:w-auto">
                                Support
                            </button>
                        </div>
                    </div>
                </div>

                { /* Neon hairline pinned to the bottom of the brand row, so it stays
                    put when the stacked menu wraps underneath it. */ }
                <div className="vc-header-rule pointer-events-none absolute inset-x-0 h-px"
                    style={ { top: "var(--vc-header-height)" } }/>
            </nav>
        </header>
    );
}
