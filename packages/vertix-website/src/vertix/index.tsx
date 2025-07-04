import { Suspense } from "react";

import { Route, Routes } from "react-router-dom";

import LoadingContainer from "@vertix/ui/loading-container";

import Header from "@vertix/header/header";
import ShiningStars from "@vertix/ui/shining-stars";

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
        <div className="relative bg-vertix-main bg-no-repeat bg-[position:right_top,left_top] [background-size:35%] opacity-20 transition-opacity duration-1000 ease-in-out not-loaded sm:[background-size:45%] md:[background-size:40%] lg:[background-size:35%] xl:[background-size:30%] sm:bg-vertix-main-mobile sm:bg-[size:100%]">
            <ShiningStars/>
            <Header/>

            <section className="content">
                <Suspense fallback={ LoadingContainer() }>
                    <RoutesComponent/>
                </Suspense>
            </section>

            <div className="container mx-auto max-w-screen-lg px-4">
                <footer className="d-flex justify-content-between py-3 my-4">
                    <p className="d-flex gap-2 md:w-1/3 mb-0 text-gray-400">
                        <span>© 2023 ~ {new Date().getFullYear()}</span>
                        <span>Vertix.gg</span>
                    </p>

                    <ul className="d-flex nav">
                        <li className="nav-item"><a href="/privacy-policy" className="px-2 text-gray-400 hover:underline">Privacy
                            Policy</a></li>
                        <li className="nav-item"><a href="/terms-of-service" className="px-2 text-gray-400 hover:underline">Terms
                            Of Service</a></li>
                        <li className="nav-item"><a href="/changelog" className="px-2 text-gray-400 hover:underline">Changelog</a>
                        </li>
                        <li className="nav-item"><a href="/credits" className="px-2 text-gray-400 hover:underline">Credits</a>
                        </li>
                        <li className="nav-item">
                            <a href="mailto:leonid@vertix.gg" className="px-2 text-gray-400 hover:underline">Contact</a>
                        </li>
                    </ul>
                </footer>
            </div>
        </div>
    );
}

