import React from "react";

import { useLocation } from "react-router-dom";

import VCBrand from "@vertix.gg/assets/brand/vc-naked.png";

const NAV_LINK_BASE =
    "relative block px-4 py-2 font-body text-lg text-vc-ice transition-colors " +
    "hover:text-vc-cyan focus:text-vc-cyan";

const DROPDOWN_CLOSE_DELAY_MS = 200;

const HOVER_CAPABLE_MEDIA_QUERY = "(hover: hover)";

const useHoverCapability = () => {
    const [ isHoverCapable, setHoverCapable ] = React.useState(
        () => window.matchMedia( HOVER_CAPABLE_MEDIA_QUERY ).matches
    );

    React.useEffect( () => {
        const mediaQuery = window.matchMedia( HOVER_CAPABLE_MEDIA_QUERY ),
            onCapabilityChange = ( event: MediaQueryListEvent ) => setHoverCapable( event.matches );

        mediaQuery.addEventListener( "change", onCapabilityChange );

        return () => mediaQuery.removeEventListener( "change", onCapabilityChange );
    }, [] );

    return isHoverCapable;
};

type OpenDropdownState = string | null;

const NavbarDropdownGroupContext = React.createContext<{
    openDropdown: OpenDropdownState,
    setOpenDropdown: React.Dispatch<React.SetStateAction<OpenDropdownState>>
}>( {
    openDropdown: null,
    setOpenDropdown: () => undefined,
} );

const NavbarDropdownGroup: React.FC<{ children: React.ReactNode }> = ( { children } ) => {
    const [ openDropdown, setOpenDropdown ] = React.useState<OpenDropdownState>( null );

    const group = React.useMemo( () => ( { openDropdown, setOpenDropdown } ), [ openDropdown ] );

    return (
        <NavbarDropdownGroupContext.Provider value={ group }>
            { children }
        </NavbarDropdownGroupContext.Provider>
    );
};

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
    const { openDropdown, setOpenDropdown } = React.useContext( NavbarDropdownGroupContext ),
        isHoverCapable = useHoverCapability(),
        closeTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>( undefined );

    const location = useLocation(),
        isDropdownOpen = openDropdown === title;

    const openNow = () => {
            clearTimeout( closeTimeout.current );
            setOpenDropdown( title );
        },
        scheduleClose = () => {
            clearTimeout( closeTimeout.current );
            closeTimeout.current = setTimeout(
                () => setOpenDropdown( ( current ) => current === title ? null : current ),
                DROPDOWN_CLOSE_DELAY_MS
            );
        },
        toggleDropdown = () => setOpenDropdown( ( current ) => current === title ? null : title );

    React.useEffect( () => () => clearTimeout( closeTimeout.current ), [] );

    return (
        <li className="relative"
            onMouseEnter={ isHoverCapable ? openNow : undefined }
            onMouseLeave={ isHoverCapable ? scheduleClose : undefined }
        >
            <span className={ `${ NAV_LINK_BASE } cursor-pointer` }
                role="button"
                aria-haspopup="true"
                aria-expanded={ isDropdownOpen }
                onClick={ isHoverCapable ? undefined : toggleDropdown }
            >
                { title }
                <span className="pl-1 text-[10px] text-vc-ice-dim">▼</span>
            </span>

            <ul className={ `${ isDropdownOpen ? "block" : "hidden" } list-none overflow-hidden rounded-2xl pl-0
                border border-vc-hairline bg-vc-space-lighter/95 shadow-[0_18px_44px_rgb(6_7_10/0.6)]
                backdrop-blur-lg nav:absolute nav:left-0 nav:top-full nav:z-50 nav:min-w-56` }
            >
                {
                    items.map( ( item, number ) =>
                        <li key={ number }>
                            <a
                                className={ `block px-4 py-2 font-body text-base transition-colors
                                    hover:bg-vc-surface hover:text-vc-starlight ${
        location.pathname === item.href
            ? "text-vc-cyan"
            : "text-vc-ice" }` }
                                href={ item.href }
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
                        <NavbarDropdownGroup>
                            <ul className="flex list-none flex-col gap-1 pl-0
                                nav:flex-row nav:items-center nav:gap-2">
                                <NavbarItem title="Home" href="/"/>

                                <NavbarDropdown title="Features" items={ [
                                    { title: "Dynamic Channels v2", href: "/features/dynamic-channel-v2" },
                                    { title: "Dynamic Channels v3", href: "/features/dynamic-channel-v3" },
                                    { title: "Auto-Scaling Channels", href: "/features/auto-scaling" },
                                ] }/>

                                <NavbarDropdown title="How to" items={ [
                                    { title: "Setup", href: "/posts/how-to-setup" },
                                    { title: "Enable Logs", href: "/posts/how-to-setup-logs-channel" },
                                    { title: "Enable Features", href: "/posts/enable-features" },
                                    { title: "Name Placeholders", href: "/posts/channel-name-placeholders" },
                                ] }/>

                                <NavbarItem title="Change log" href="/changelog"/>
                            </ul>
                        </NavbarDropdownGroup>

                        <div className="mt-4 flex flex-col gap-3 nav:mt-0 nav:flex-row nav:gap-4">
                            <button id="add-to-server" onClick={ () => onAddToServerClick() }
                                className="vc-btn vc-btn-primary vc-btn-effect w-full nav:w-auto">
                                Invite
                            </button>
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
