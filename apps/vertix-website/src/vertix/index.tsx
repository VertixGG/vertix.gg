import { Suspense } from "react";

import { Route, Routes, useLocation } from "react-router-dom";

import { allImagesLoadedPromise, windowLoadedPromise, wrapPromiseSuspendable } from "@vertix.gg/website/src/utils/loading";

import LoadingContainer from "@vertix.gg/website/src/vertix/ui/loading-container";

import Header from "@vertix.gg/website/src/vertix/header/header";
import ShinyStars from "@vertix.gg/website/src/vertix/components/ui/shiny-stars";
import DashboardAnnouncement from "@vertix.gg/website/src/vertix/components/ui/dashboard-announcement";

import localRoutes from "@vertix.gg/website/src/vertix/routes";

import { useDocumentMeta } from "@vertix.gg/website/src/vertix/seo/use-document-meta";

import "@vertix.gg/website/src/vertix/styles/index.css";

const loadedPromise = windowLoadedPromise(),
    loadedSuspensePromise = wrapPromiseSuspendable( loadedPromise );

const FOOTER_LINK = "px-2 text-vc-ice-dim transition-colors hover:text-vc-cyan";

const RoutesComponent = () => {
    loadedSuspensePromise.read();

    const RoutesComponentTyped = Routes as React.ComponentType<{ children?: React.ReactNode }>;
    const RouteComponentTyped = Route as React.ComponentType<{ key?: string; path?: string; element?: React.ReactElement }>;

    return (
        <RoutesComponentTyped>
            { localRoutes.map( ( route ) => {
                return <RouteComponentTyped key={ route.path } path={ route.path } element={ <route.component/> }/>;
            } ) }
        </RoutesComponentTyped>
    );
};

const IndexContent = () => {
    const location = useLocation();
    const shouldHideHeader = location.pathname === "/welcome";

    useDocumentMeta();

    return (
        <>
            { !shouldHideHeader && <Header/> }

            { !shouldHideHeader && <DashboardAnnouncement/> }

            <section className="pt-7 md:pt-12">
                <Suspense fallback={ LoadingContainer() }>
                    <RoutesComponent/>
                </Suspense>
            </section>

            <div className="vc-container">
                <footer className="my-6 flex flex-wrap items-center justify-between gap-3 py-4
                    font-body text-lg text-vc-ice-dim">
                    <p className="mb-0">© 2023~2026 VoiceChannels.gg</p>

                    <ul className="flex list-none flex-wrap justify-end gap-1 pl-0 mb-0">
                        <li><a href="/privacy-policy" className={ FOOTER_LINK }>Privacy Policy</a></li>
                        <li><a href="/terms-of-service" className={ FOOTER_LINK }>Terms Of Service</a></li>
                        <li><a href="/credits" className={ FOOTER_LINK }>Credits</a></li>
                        <li><a href="mailto:leonidvinikov@gmail.com" className={ FOOTER_LINK }>Contact</a></li>
                    </ul>
                </footer>
            </div>
        </>
    );
};

export default function Index() {
    const showPage = () => {
        const container = document.querySelector( ".body-container" );

        if ( !container ) {
            return;
        }

        container.classList.remove( "unload", "not-loaded" );
        container.classList.add( "loaded" );
    };

    loadedPromise.then( () => {
        allImagesLoadedPromise().then( showPage );
    } );

    return (
        <>
            <ShinyStars/>

            <div className="body-container not-loaded">
                <IndexContent/>
            </div>
        </>
    );
}
