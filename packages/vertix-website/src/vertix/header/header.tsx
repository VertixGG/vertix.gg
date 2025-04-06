import React from "react";

import { useLocation } from "react-router-dom";

import VertixWeb from "../assets/vertix-optimized.webp";

const NavbarItem: React.FC<{ title: string, href: string }> = ( { title, href } ) => {
    const location = useLocation();

    return (
        <li className="nav-item">
            <a className={ `nav-link ${ location.pathname === href ? "active" : "" }` } aria-current="page"
               href={ href }>{ title }</a>
        </li>
    )
};

const NavbarDropdown: React.FC<{
    title: string,
    items: { title?: string, href?: string, divider?: boolean }[]
}> = (
    { title, items } ) => {
    let dropdownTimeout: NodeJS.Timeout;

    const [ isDropdownOpen, setDropdownState ] = React.useState( false ),
        toggleDropdown = () => setDropdownState( ! isDropdownOpen ),
        openAndClearTimeout = () => {
            clearTimeout( dropdownTimeout );
            setDropdownState( true );
        };

    const location = useLocation();

    return (
        <li className="nav-item dropdown">
            <span className="nav-link" role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onMouseEnter={ () => {
                      clearTimeout( dropdownTimeout );
                      setDropdownState( true )
                  } }
                  onMouseLeave={ () => dropdownTimeout = setTimeout( () => setDropdownState( false ), 200 ) }
                  onClick={ toggleDropdown }
            >
                { title }
            </span>
            <ul className={ `dropdown-menu border-0 ${ isDropdownOpen ? "show" : "" }` }>
                {
                    items.map( ( item, number ) =>
                        <li key={ number }>
                            <a
                                className={ `dropdown-item ${ location.pathname === item.href ? "active" : "" } ` }
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
    )
};

export const onAddToServerClick = () => {
    window.location.href = "/invite-vertix"
};

export default function Header() {
    const [ isNavbarOpen, setNavbarOpen ] = React.useState( false ),
        toggleNavbar = () => setNavbarOpen( ! isNavbarOpen );

    return (
        <section id="header" className="header">
            <nav className="navbar navbar-expand-xl pt-xl-5">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img id="vertix-logo" className="me-1 user-select-none" width="60px" height="60px"
                             src={ VertixWeb } alt=""></img>
                        <span id="vertix-brand-logo" className="d-inline">
                            <span id="vertix-first-letter">V</span>ertix
                        </span>
                    </a>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation"
                            onClick={ toggleNavbar }
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className={ `navbar-collapse collapse ${ isNavbarOpen ? "show" : "" }` }>
                        <ul className="navbar-nav me-auto ms-3 mb-2 mb-lg-0 md-xs-5">
                            <NavbarItem title="Home" href="/"/>

                            <NavbarDropdown title="Features" items={ [
                                { title: "Voice Channels", href: "/features/dynamic-channels-showcase" },

                                { divider: true },
                                { title: "Images Gallery", href: "/features-images" },
                                { title: "Video", href: "/features-video" },
                            ] }/>


                            <NavbarDropdown title="How to" items={ [
                                { title: "Setup", href: "/posts/how-to-setup" },
                                { divider: true },
                                { title: "Enable Logs", href: "/posts/how-to-setup-logs-channel" },
                                { title: "Enable Features", href: "/posts/enable-transfer-ownership" },
                            ] }/>

                            <NavbarItem title="Updates" href="/updates"/>
                        </ul>

                        <div className="buttons d-flex p-sm-2">
                            <button id="add-to-server" onClick={ () => onAddToServerClick() }
                                    className="btn ps-4 pe-4 btn-outline-primary btn-effect me-4">Invite
                                Vertix
                            </button>
                            <button id="support" onClick={ () => window.open( "https://discord.gg/dEwKeQefUU" ) }
                                    className="btn btn-outline-success btn-effect ms-auto">Support
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div id="vertix-wings" className="d-flex justify-content-center">
                <div id="vertix-wings-placeholder" className="text-center">
                    <h1 id="vertix-wings-heading" className="user-select-none">Vertix</h1>
                    <img id="vertix-wings-logo" className="user-select-none" width="60" height="60" src={ VertixWeb } alt=""></img>
                </div>
            </div>
        </section>
    );
}
