export function wrapPromiseSuspendable( promise: Promise<any> ) {
    let status = "pending";
    let result: any;
    let suspender = promise.then(
        ( r ) => {
            status = "success";
            result = r;
        },
        ( e ) => {
            status = "error";
            result = e;
        }
    );
    return {
        read() {
            if ( status === "pending" ) {
                throw suspender;
            } else if ( status === "error" ) {
                throw result;
            } else if ( status === "success" ) {
                return result;
            }
        }
    };
}

export const allImagesLoadedPromise = () => {
    return new Promise( ( resolve ) => {
        const allImages = document.querySelectorAll( "img" );

        // When all images are loaded, resolve the promise.
        if ( allImages.length > 0 ) {
            let loadedImages = 0;

            for ( let i = 0 ; i < allImages.length ; i ++ ) {
                const img = allImages[ i ];

                if ( img.complete ) {
                    loadedImages++;
                } else {
                    img.addEventListener( "load", () => {
                        loadedImages++;

                        if ( loadedImages === allImages.length ) {
                            resolve( true );
                        }
                    } );
                }
            }

            if ( loadedImages === allImages.length ) {
                resolve( true );
            }

            return
        }

        resolve( true );
    } );
};

export const windowLoadedPromise = () => {
    return new Promise( ( resolve ) => {
        if ( document.readyState === "complete" ) {
            setTimeout( () => {
                resolve( true );
            } );
        }

        window.addEventListener( "load", () => {
            resolve( true );
        } );
    } ) as Promise<boolean>;
};
