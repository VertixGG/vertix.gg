export function isObject( item: unknown ): item is Record<string, any> {
    return <boolean> ( item && typeof item === "object" && ! Array.isArray( item ) );
}

export function deepMerge<T extends Record<string, any>>( target: T, source: T ): T {
    const output: T = { ... target }; // Creates a shallow copy of target

    if ( isObject( target ) && isObject( source ) ) {
        Object.keys( source ).forEach( key => {
            const isSourceKeyAnObject = isObject( source[ key ] );
            const doesKeyExistInTarget = key in target;

            if ( isSourceKeyAnObject && doesKeyExistInTarget ) {
                ( output as Record<string, any> )[ key ] = deepMerge(
                    target[ key ],
                    source[ key ]
                );
            } else {
                ( output as Record<string, any> )[ key ] = source[ key ];
            }
        } );
    }
    return output;
}
