import React, { Suspense } from "react";

import { Route, Routes } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import LoadingContainer from "@vertix/ui/loading-container";

import Header from "@vertix/header/header";

import localRoutes from "@vertix/routes";

import { allImagesLoadedPromise, windowLoadedPromise, wrapPromiseSuspendable } from "@internal/utils/loading";

import "./style-static.scss"

( () => {
    // @ts-ignore
    import ( "./style-dynamic.scss" );
} )();

const loadedPromise = windowLoadedPromise(),
    loadedSuspensePromise = wrapPromiseSuspendable( loadedPromise );

const RoutesComponent = () => {
    loadedSuspensePromise.read();

    return (
        <Routes>
            { localRoutes.map( ( route ) => {
                return <Route key={ route.path } path={ route.path } element={ <route.component/> }/>;
            } ) }
        </Routes>
    )
};

export default function Index() {
    loadedPromise.then( () => {
        allImagesLoadedPromise().then( () => {
            document.querySelector( ".body-container" )?.classList.remove( "unload", "not-loaded" );
            document.querySelector( ".body-container" )?.classList.add( "loaded" );
        } );
    } );

    return (
        <div className="body-container not-loaded">
            <Header/>

            <Helmet>
                <title>Discord Voice Channels | Vertix.gg ~ Create Temporary Channels</title>
                <meta name="description" content="Easily create, manage, and enjoy temporary Discord voice channels with Vertix.gg, the Discord bot designed for seamless voice communication." />
                <meta name="keywords" content="Discord voice channels, temporary voice channels, Discord bot, Vertix.gg" />
                <script type="application/ld+json">
                    {`
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Vertix.gg",
                        "description": "Discord bot for creating temporary voice channels",
                        "applicationCategory": "Communication",
                        "operatingSystem": "Discord",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    }
                    `}
                </script>
            </Helmet>

            <section className="content">
                <div className="intro-section">
                    <h1>Discord Voice Channels by Vertix.gg</h1>
                    <p>Experience unparalleled control over temporary Discord voice channels with Vertix.gg. Our Discord bot simplifies the creation and management of your channels, perfect for gaming, community events, and meetings.</p>
                    <h2>Why Choose Vertix for Temporary Discord Channels?</h2>
                    <p>Vertix.gg makes your voice communication easy, effective, and hassle-free. Quickly create temporary rooms, control user access, and automate your channel management effortlessly.</p>
                </div>

                <Suspense fallback={ LoadingContainer() }>
                    <RoutesComponent/>
                </Suspense>
            </section>

            <div className="container">
                <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4">
                    <p className="col-md-4 mb-0 text-muted">© 2023~2024 Vertix.gg</p>

                    <ul className="nav col-md justify-content-end">
                        <li className="nav-item"><a href="/privacy-policy" className="nav-link px-2 text-muted">Privacy
                            Policy</a></li>
                        <li className="nav-item"><a href="/terms-of-service" className="nav-link px-2 text-muted">Terms
                            Of Service</a></li>
                        <li className="nav-item"><a href="/changelog" className="nav-link px-2 text-muted">Changelog</a>
                        </li>
                        <li className="nav-item"><a href="/credits" className="nav-link px-2 text-muted">Credits</a>
                        </li>
                        <li className="nav-item">
                            <a href="mailto:leonid@vertix.gg" className="nav-link px-2 text-muted">Contact</a>
                        </li>
                    </ul>
                </footer>

                <div className="d-flex justify-content-center opacity-0 text-white">
                    <a href="https://vertix.gg" target="_blank" rel="noreferrer">vertix</a>&nbsp;|&nbsp;
                    <a href="https://vertix.gg" target="_blank" rel="noreferrer">discord</a>&nbsp;|&nbsp;
                    <a href="https://vertix.gg" target="_blank" rel="noreferrer">bot</a>&nbsp;|&nbsp;
                    <a href="https://vertix.gg" target="_blank" rel="noreferrer">temporary</a>&nbsp;|&nbsp;
                    <a href="https://vertix.gg" target="_blank" rel="noreferrer">voice</a>&nbsp;|&nbsp;
                    <a href="https://vertix.gg" target="_blank" rel="noreferrer">channels</a>
                </div>
            </div>
        </div>
    );
}

