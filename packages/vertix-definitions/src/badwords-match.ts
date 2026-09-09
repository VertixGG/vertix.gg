/**
 * Function badwordsIsMatch() :: Whether a single word is caught by a single badword.
 *
 * `*` stands for any run of characters, and the comparison ignores case, so one spelling of a word
 * covers the rest.
 *
 * It lives here rather than beside the filtering so the screens that let an admin edit the list can
 * answer "would this be caught" with the same rule the bot enforces, instead of a second copy of it
 * that drifts.
 */
export const badwordsIsMatch = ( word: string, badword: string ): boolean => {
    const regex = new RegExp( `^${ badword.replace( /\*/g, ".*" ) }$`, "i" );

    return regex.test( word );
};
