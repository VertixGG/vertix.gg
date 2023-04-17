import { GUILD_DEFAULT_BADWORDS, GUILD_DEFAULT_BADWORDS_SEPARATOR } from "@dynamico/constants/guild";

/**
 * Function badwordsSomeUsed() :: Determine if a word contains any of the badwords and
 * return the first badword found.
 */
export const badwordsSomeUsed = ( word: string, badwords: string[] ): string | null => {
    let usedBadword: string | null = null;

    ( badwords ).some( ( badword ) => {
        if ( badword.length && word.toLowerCase().includes( badword.toString().toLowerCase() ) ) {
            usedBadword = badword;
        }
        return !! usedBadword;
    } );

    return usedBadword;
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
        return badwords.split( GUILD_DEFAULT_BADWORDS_SEPARATOR.trim() );
    }

    return GUILD_DEFAULT_BADWORDS;
};
