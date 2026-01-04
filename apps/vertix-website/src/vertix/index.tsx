import { Suspense } from "react";

import { Route, Routes, useLocation } from "react-router-dom";

import { allImagesLoadedPromise, windowLoadedPromise, wrapPromiseSuspendable } from "@vertix.gg/website/src/utils/loading";

import LoadingContainer from "@vertix.gg/website/src/vertix/ui/loading-container";

import Header from "@vertix.gg/website/src/vertix/header/header";

import localRoutes from "@vertix.gg/website/src/vertix/routes";

import "@vertix.gg/website/src/vertix/style-static.scss";

( () => {
    // @ts-ignore
    import ( "./style-dynamic.scss" );
} )();

const loadedPromise = windowLoadedPromise(),
    loadedSuspensePromise = wrapPromiseSuspendable( loadedPromise );

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

    return (
        <>
            { !shouldHideHeader && <Header/> }

            <section className="content">
                <Suspense fallback={ LoadingContainer() }>
                    <RoutesComponent/>
                </Suspense>
            </section>

            <div className="container">
                <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4">
                    <p className="col-md-4 mb-0 text-muted">© 2023~2026 Vertix.gg</p>

                    <ul className="nav col-md justify-content-end">
                        <li className="nav-item"><a href="/privacy-policy" className="nav-link px-2 text-muted">Privacy
                            Policy</a></li>
                        <li className="nav-item"><a href="/terms-of-service" className="nav-link px-2 text-muted">Terms
                            Of Service</a></li>
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
        <div className="body-container not-loaded">
            <IndexContent/>
        </div>
    );
}

