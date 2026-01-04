type SuspendablePromiseStatus = "pending" | "success" | "error";
type SuspendablePromiseError = Error | string | number | boolean | bigint | symbol | null | undefined | object;

export function wrapPromiseSuspendable<TResult>( promise: Promise<TResult> ) {
    let status: SuspendablePromiseStatus = "pending";
    let result!: TResult;
    let error!: SuspendablePromiseError;

    const suspender = promise.then(
        ( value ) => {
            status = "success";
            result = value;
        },
        ( value: SuspendablePromiseError ) => {
            status = "error";
            error = value;
        }
    );

    return {
        read(): TResult {
            if ( status === "pending" ) {
                throw suspender;
            }

            if ( status === "error" ) {
                throw error;
            }

            return result;
        }
    };
}

export const allImagesLoadedPromise = () => {
    return new Promise( ( resolve ) => {
        const allImages = document.querySelectorAll( "img" );

        // When all images are loaded, resolve the promise.
        if ( allImages.length > 0 ) {
            let loadedImages = 0;

            const onImageLoad = () => {
                loadedImages++;

                if ( loadedImages === allImages.length ) {
                    resolve( true );
                }
            };

            for ( let i = 0 ; i < allImages.length ; i ++ ) {
                const img = allImages[ i ];

                if ( img.complete ) {
                    onImageLoad();
                } else {
                    img.addEventListener( "load", onImageLoad, { once: true } );
                    img.addEventListener( "error", onImageLoad, { once: true } );
                }
            }

            return;
        }

        resolve( true );
    } );
};

export const windowLoadedPromise = () => {
    return new Promise<boolean>( ( resolve ) => {
        if ( document.readyState === "complete" || document.readyState === "interactive" ) {
            resolve( true );
            return;
        }

        const onLoaded = () => {
            resolve( true );
        };

        window.addEventListener( "load", onLoaded, { once: true } );
        window.addEventListener( "DOMContentLoaded", onLoaded, { once: true } );
    } );
};
