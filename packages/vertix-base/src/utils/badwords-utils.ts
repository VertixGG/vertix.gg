import { DEFAULT_BADWORDS, DEFAULT_BADWORDS_SEPARATOR } from "@vertix.gg/definitions/src/badwords-defaults";

const isMatch = ( word: string, badword: string ): boolean => {
    const regex = new RegExp( `^${ badword.replace( /\*/g, ".*" ) }$`, "i" );
    return regex.test( word );
};

/**
 * Function badwordsSomeUsed() :: Determine if a word matches of the badwords and
 * return the first badword found.
 *
 * the method support '*' for each badword to implement non-exact matches
 */
export const badwordsSomeUsed = ( content: string, badwords: string[] ): string | null => {
    for ( const badword of badwords ) {
        let words = content.split( " " );

        if ( !words.length ) {
            words = [ content ];
        }

        for ( const word of words ) {
            if ( isMatch( word, badword ) ) {
                return badword;
            }
        }
    }
    return null;
};

/**
 * Function badwordsMask() :: Replace every word matching one of the badwords with asterisks.
 *
 * Renaming a channel refuses a badword outright, which is the right answer when a user typed it.
 * The paths that assemble a name themselves - creating a channel, resetting one, applying a saved
 * template - cannot refuse, since the user would be left without a channel, so they mask instead.
 */
export const badwordsMask = ( content: string, badwords: string[] ): string => {
    if ( !badwords.length ) {
        return content;
    }

    return content
        .split( " " )
        .map( ( word ) =>
            badwords.some( ( badword ) => isMatch( word, badword ) ) ? "*".repeat( word.length ) : word
        )
        .join( " " );
};

/**
 * Function badwordsNormalizeArray() :: Normalize the badwords array, removing the empty and extra spaces.
 */
export const badwordsNormalizeArray = ( badwords: string[] | undefined ): string[] => {
    let result: string[] = [];

    if ( badwords?.length ) {
        // Remove all empty spaces between words.
        result = badwords.map( ( word ) => word.trim() );

        // Remove empty words.
        result = result.filter( ( word ) => word.length );
    }

    return result;
};

export const badwordsSplitOrDefault = ( badwords: string | undefined ) => {
    if ( "string" === typeof badwords ) {
        return badwords.split( DEFAULT_BADWORDS_SEPARATOR.trim() );
    }

    return DEFAULT_BADWORDS;
};
