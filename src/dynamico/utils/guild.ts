import { guildDataManager } from "@dynamico/managers";
import { DATA_CHANNEL_KEY_BADWORDS } from "@dynamico/constants/data";

import {
    GUILD_DEFAULT_BADWORDS,
    GUILD_DEFAULT_BADWORDS_INITIAL_VALUE,
    GUILD_DEFAULT_BADWORDS_SEPARATOR
} from "@dynamico/constants/guild";

export const guildGetBadwordsJoined = async ( guildId: string ): Promise<string> => {
    return (
        ( await guildGetBadwords( guildId ) ).join( GUILD_DEFAULT_BADWORDS_SEPARATOR ) || GUILD_DEFAULT_BADWORDS_INITIAL_VALUE
    );
};

export const guildGetBadwords = async ( guildId: string ): Promise<string[]> => {
    // const badwordsDB = await guildManager.getData( guildId, DATA_CHANNEL_KEY_BADWORDS, null, true );
    const badwordsDB = await guildDataManager.getData( {
        ownerId: guildId,
        key: DATA_CHANNEL_KEY_BADWORDS,
        default: null,
        cache: true,
    }, true );

    if ( badwordsDB?.values ) {
        return badwordsDB.values;
    }

    return GUILD_DEFAULT_BADWORDS;
};
