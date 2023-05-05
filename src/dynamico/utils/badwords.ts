import { Guild } from "discord.js";

import {
    DEFAULT_BADWORDS,
    DEFAULT_BADWORDS_INITIAL_VALUE,
    DEFAULT_BADWORDS_SEPARATOR
} from "@dynamico/constants/badwords";

import { guildDataManager } from "@dynamico/managers";

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
        return badwords.split( DEFAULT_BADWORDS_SEPARATOR.trim() );
    }

    return DEFAULT_BADWORDS;
};

export const guildGetBadwords = async ( guildId: string ): Promise<string[]> => {
    const badwordsDB = await guildDataManager.getData( {
        ownerId: guildId,
        key: "badwords",
        default: null,
        cache: true,
    }, true );

    if ( badwordsDB?.values ) {
        return badwordsDB.values;
    }

    return DEFAULT_BADWORDS;
};

export const guildUsedSomeBadword = async ( guildId: string, word: string ): Promise<string | null> => {
    return badwordsSomeUsed( word, await guildGetBadwords( guildId ) );
};

export const guildGetBadwordsFormatted = async ( guildId: string ): Promise<string> => {
    return (
        ( await guildGetBadwords( guildId ) ).join( DEFAULT_BADWORDS_SEPARATOR ) || DEFAULT_BADWORDS_INITIAL_VALUE
    );
};

export const guildSetBadwords = async ( guild: Guild, badwords: string[] | undefined ): Promise<void> => {
    if ( ! badwords?.length ) {
        try {
            await guildDataManager.deleteData( {
                ownerId: guild.id,
                key: "badwords",
            }, true );
        } catch ( e ) {
            // Ignore
        }

        return;
    }

    await guildDataManager.setData( {
        ownerId: guild.id,
        key: "badwords",
        default: badwords,
    }, true );
};
