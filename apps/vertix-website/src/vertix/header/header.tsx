import React from "react";

import { useLocation } from "react-router-dom";

import VCBrand from "@vertix.gg/assets/brand/vc-naked.png";

const NAV_LINK_BASE =
    "relative block px-4 py-2 font-body text-lg text-vc-ice transition-colors " +
    "hover:text-vc-cyan focus:text-vc-cyan";

const NavbarItem: React.FC<{ title: string, href: string }> = ( { title, href } ) => {
    const location = useLocation(),
        isActive = location.pathname === href;

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

const NavbarDropdown: React.FC<{
    title: string,
    items: { title?: string, href?: string, divider?: boolean }[]
}> = (
    { title, items } ) => {
    let dropdownTimeout: ReturnType<typeof setTimeout>;

    const [ isDropdownOpen, setDropdownState ] = React.useState( false ),
        toggleDropdown = () => setDropdownState( ! isDropdownOpen ),
        openAndClearTimeout = () => {
            clearTimeout( dropdownTimeout );
            setDropdownState( true );
        };

    const location = useLocation();

    return (
        <li className="relative">
            <span className={ `${ NAV_LINK_BASE } cursor-pointer` }
                role="button"
                aria-expanded={ isDropdownOpen }
                onMouseEnter={ () => {
                    clearTimeout( dropdownTimeout );
                    setDropdownState( true );
                } }
                onMouseLeave={ () => dropdownTimeout = setTimeout( () => setDropdownState( false ), 200 ) }
                onClick={ toggleDropdown }
            >
                { title }
                <span className="pl-1 text-[10px] text-vc-cyan">▼</span>
            </span>

            <ul className={ `${ isDropdownOpen ? "block" : "hidden" } list-none overflow-hidden rounded-2xl pl-0
                border border-vc-cyan/20 bg-vc-space-lighter/95 shadow-[0_18px_44px_rgb(1_3_11/0.85)]
                backdrop-blur-lg nav:absolute nav:left-0 nav:top-full nav:z-50 nav:min-w-56` }
            >
                {
                    items.map( ( item, number ) =>
                        <li key={ number }>
                            <a
                                className={ `block px-4 py-2 font-body text-base transition-colors
                                    hover:bg-vc-cyan/10 hover:text-vc-cyan ${
        location.pathname === item.href
            ? "text-vc-cyan"
            : "text-vc-ice" }` }
                                href={ item.href }
                                onMouseEnter={ () => openAndClearTimeout() }
                                onMouseLeave={ () => setDropdownState( false ) }
                            >
                                { item.title }
                            </a>
                        </li>
                    )
                }
            </ul>
        </li>
    );
};

export const onAddToServerClick = () => {
    window.location.href = "/invite-vertix";
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
                            art; the stylesheet crops to it, so reserve that box here. */ }
                        <img className="vc-logo w-[88px] select-none lg:w-[112px]"
                            width="112" height="66"
                            src={ VCBrand } alt="VoiceChannels"/>
                    </a>

                    <button
                        type="button"
                        className="flex items-center self-center rounded-xl border
                            border-vc-cyan/35 bg-vc-space/60 px-3 py-2 text-vc-cyan
                            shadow-[0_0_16px_rgb(47_216_245/0.15)] transition-all
                            hover:border-vc-cyan/70 hover:shadow-[0_0_24px_rgb(47_216_245/0.35)]
                            focus-visible:outline-none focus-visible:ring-3
                            focus-visible:ring-vc-cyan/20 nav:hidden"
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
                            rounded-3xl border border-vc-cyan/15 bg-vc-space-lighter/90 p-5
                            shadow-[0_24px_60px_rgb(1_3_11/0.8)] backdrop-blur-lg
                            mt-3 mb-5
                            nav:order-none nav:mt-0 nav:mb-0 nav:flex nav:w-auto nav:flex-1
                            nav:items-center nav:justify-between nav:rounded-none nav:border-0
                            nav:bg-transparent nav:p-0 nav:shadow-none nav:backdrop-blur-none` }
                    >
                        <ul className="flex list-none flex-col gap-1 pl-0
                            nav:flex-row nav:items-center nav:gap-2">
                            <NavbarItem title="Home" href="/"/>

                            <NavbarDropdown title="Features" items={ [
                                { title: "Dynamic Channel V2", href: "/features/dynamic-channel-v2" },
                                { title: "Dynamic Channel V3", href: "/features/dynamic-channel-v3" },
                                { title: "Auto-Scaling Channels", href: "/features/auto-scaling" },
                            ] }/>

                            <NavbarDropdown title="How to" items={ [
                                { title: "Setup", href: "/posts/how-to-setup" },
                                { title: "Enable Logs", href: "/posts/how-to-setup-logs-channel" },
                                { title: "Enable Features", href: "/posts/enable-transfer-ownership" },
                            ] }/>

                            <NavbarItem title="Change log" href="/changelog"/>
                        </ul>

                        <div className="mt-4 flex flex-col gap-3 nav:mt-0 nav:flex-row nav:gap-4">
                            <button id="add-to-server" onClick={ () => onAddToServerClick() }
                                className="vc-btn vc-btn-crimson vc-btn-effect w-full nav:w-auto">
                                Invite
                            </button>
                            <button id="dashboard"
                                onClick={ () => window.open( import.meta.env.VITE_DASHBOARD_URL || "https://dashboard.voicechannels.online" ) }
                                className="vc-btn vc-btn-cyan vc-btn-effect w-full nav:w-auto">
                                Dashboard
                            </button>
                            <button id="support" onClick={ () => window.open( "https://discord.gg/dEwKeQefUU" ) }
                                className="vc-btn vc-btn-mint vc-btn-effect w-full nav:w-auto">
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
