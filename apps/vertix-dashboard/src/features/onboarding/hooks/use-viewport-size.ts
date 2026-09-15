import { useEffect, useState } from "react";

interface ViewportSize {
    width: number;
    height: number;
}

function readViewportSize(): ViewportSize {
    return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * Function useViewportSize() :: How much room there is to place something in.
 *
 * A step anchored to something re-measures anyway when the window moves it, but one anchored to
 * nothing sits in the middle of a screen whose middle has moved - and nothing else would tell it.
 */
export function useViewportSize(): ViewportSize {
    const [ size, setSize ] = useState<ViewportSize>( readViewportSize );

    useEffect( () => {
        const handleResize = () => setSize( readViewportSize() );

        window.addEventListener( "resize", handleResize );

        return () => window.removeEventListener( "resize", handleResize );
    }, [] );

    return size;
}
