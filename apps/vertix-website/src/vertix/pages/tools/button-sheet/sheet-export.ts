import fontUrl from "@assets/fonts/RedHatDisplay-Bold.ttf?url";

export interface SheetExport {
    blob: Blob;
    width: number;
    height: number;
}

let cachedFont: Promise<string> | null = null;

/**
 * Function embeddedFont() :: The brand face, base64 encoded, fetched once.
 *
 * Kept out of the bundle and off the page: only an export needs it, so it is pulled on the first
 * download rather than shipped to every visitor who merely looks at the sheet.
 */
export async function embeddedFont(): Promise<string> {
    cachedFont ??= ( async() => {
        const response = await fetch( fontUrl );

        if ( ! response.ok ) {
            throw new Error( "The brand font could not be loaded for the export" );
        }

        const bytes = new Uint8Array( await response.arrayBuffer() );

        let binary = "";

        for ( let offset = 0; offset < bytes.length; offset += 8192 ) {
            binary += String.fromCharCode( ...bytes.subarray( offset, offset + 8192 ) );
        }

        return btoa( binary );
    } )();

    return await cachedFont;
}

/**
 * Function exportSheet() :: Turns the built svg into a png.
 *
 * Two details are load bearing:
 *
 * - the svg is handed to the image as a `data:` uri rather than a `blob:` one. A blob url taints
 *   the canvas, and the export then fails at the very last step;
 * - a `viewBox` and explicit width. Without them the scaled canvas paints the sheet at its original
 *   size in the corner and leaves the rest blank.
 *
 * The sheet carries its icons and its face inline, so there is nothing left for the rasteriser to
 * go and fetch - an svg opened as an image is not allowed to, and a sheet that referenced either
 * would come back missing its icons and typeset in a system fallback.
 */
export async function exportSheet( svg: string, width: number, height: number, scale: number ): Promise<SheetExport> {
    const source = "data:image/svg+xml;charset=utf-8," + encodeURIComponent( svg );

    const rasterised = await new Promise<HTMLImageElement>( ( resolve, reject ) => {
        const image = new Image();

        image.onload = () => resolve( image );
        image.onerror = () => reject( new Error( "The sheet could not be rasterised" ) );

        image.src = source;
    } );

    const canvas = document.createElement( "canvas" );

    canvas.width = Math.round( width * scale );
    canvas.height = Math.round( height * scale );

    const context = canvas.getContext( "2d" );

    if ( ! context ) {
        throw new Error( "This browser did not give us a canvas to draw on" );
    }

    context.drawImage( rasterised, 0, 0, canvas.width, canvas.height );

    const blob = await new Promise<Blob | null>( ( resolve ) => canvas.toBlob( resolve, "image/png" ) );

    if ( ! blob ) {
        throw new Error( "The sheet could not be encoded as a png" );
    }

    return { blob, width: canvas.width, height: canvas.height };
}

/**
 * Function canRasterise() :: Whether this browser can turn an svg into a canvas image at all.
 *
 * Probed once with a known colour rather than discovered when someone clicks download and gets a
 * blank file.
 */
export async function canRasterise(): Promise<boolean> {
    const svg =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1\" height=\"1\">" +
        "<rect width=\"1\" height=\"1\" fill=\"#0f0\"/></svg>";

    try {
        const image = await new Promise<HTMLImageElement>( ( resolve, reject ) => {
            const probe = new Image();

            probe.onload = () => resolve( probe );
            probe.onerror = () => reject( new Error( "probe failed" ) );

            probe.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent( svg );
        } );

        const canvas = document.createElement( "canvas" );

        canvas.width = 1;
        canvas.height = 1;

        const context = canvas.getContext( "2d" );

        if ( ! context ) {
            return false;
        }

        context.drawImage( image, 0, 0 );

        const [ , green ] = context.getImageData( 0, 0, 1, 1 ).data;

        return green > 200;
    } catch {
        return false;
    }
}
