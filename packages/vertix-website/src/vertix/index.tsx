import { Suspense } from "react";

import { Route, Routes } from "react-router-dom";

import LoadingContainer from "@vertix/ui/loading-container";

import Header from "@vertix/header/header";

import localRoutes from "@vertix/routes";

import { allImagesLoadedPromise, windowLoadedPromise, wrapPromiseSuspendable } from "@internal/utils/loading";

import "@vertix.gg/website/src/vertix/style-static.scss";

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
    );
};

export default function Index() {
    loadedPromise.then( () => {
        allImagesLoadedPromise().then( () => {
            document.querySelector( ".body-container" )?.classList.remove( "unload", "not-loaded" );
            document.querySelector( ".body-container" )?.classList.add( "loaded" );
        } );
    } );

    return (
        <div className="bg-vertix-main bg-no-repeat bg-[position:right_top,left_top] [background-size:35%] opacity-20 transition-opacity duration-1000 ease-in-out not-loaded sm:[background-size:45%] md:[background-size:40%] lg:[background-size:35%] xl:[background-size:30%] sm:bg-vertix-main-mobile sm:bg-[size:100%]">
            <Header/>

            <section className="content">
                <Suspense fallback={ LoadingContainer() }>
                    <RoutesComponent/>
                </Suspense>
            </section>

            <div className="container mx-auto max-w-screen-lg px-4">
                <footer className="flex flex-wrap justify-between items-center py-3 my-4">
                    <p className="md:w-1/3 mb-0 text-gray-400">© 2023~2024 Vertix.gg</p>

                    <ul className="flex md:justify-end">
                        <li><a href="/privacy-policy" className="px-2 text-gray-400 hover:underline">Privacy
                            Policy</a></li>
                        <li><a href="/terms-of-service" className="px-2 text-gray-400 hover:underline">Terms
                            Of Service</a></li>
                        <li><a href="/changelog" className="px-2 text-gray-400 hover:underline">Changelog</a>
                        </li>
                        <li><a href="/credits" className="px-2 text-gray-400 hover:underline">Credits</a>
                        </li>
                        <li>
                            <a href="mailto:leonid@vertix.gg" className="px-2 text-gray-400 hover:underline">Contact</a>
                        </li>
                    </ul>
                </footer>

                <div className="flex justify-center opacity-0 text-white">
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

