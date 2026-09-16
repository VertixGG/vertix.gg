import { DISCORD_LIMITS, DISCORD_URLS, E2E_INTERVALS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";

export interface IRestGuild {
    id: string;
    name: string;
    owner_id: string;
}

export interface IRestRole {
    id: string;
    name: string;
    permissions: string;
}

export interface IRestMember {
    user: { id: string; username: string };
    roles: string[];
}

export interface IRestVoiceState {
    channel_id: string | null;
}

export interface IRestChannel {
    id: string;
    name: string;
    type: number;
    parent_id: string | null;
    user_limit?: number;
    rtc_region?: string | null;
    position?: number;
}

interface IRateLimitBody {
    retry_after?: number;
}

const CHANNEL_TYPES = {
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    GUILD_CATEGORY: 4
} as const;

function sleep( milliseconds: number ): Promise<void> {
    return new Promise( ( resolve ) => setTimeout( resolve, milliseconds ) );
}

/**
 * The bot's own token, used for the two things a browser cannot do quickly enough to be a
 * precondition: listing what is in the guild, and emptying it. Nothing here answers an interaction -
 * every behaviour under test still goes through the running bot.
 */
export class DiscordRest {
    public constructor( private readonly token: string ) {}

    public async listGuildChannels( guildId: string ): Promise<IRestChannel[]> {
        return this.request<IRestChannel[]>( "GET", `/guilds/${ guildId }/channels` );
    }

    public async guild( guildId: string ): Promise<IRestGuild> {
        return this.request<IRestGuild>( "GET", `/guilds/${ guildId }` );
    }

    public async guildRoles( guildId: string ): Promise<IRestRole[]> {
        return this.request<IRestRole[]>( "GET", `/guilds/${ guildId }/roles` );
    }

    public async guildMember( guildId: string, memberId: string ): Promise<IRestMember> {
        return this.request<IRestMember>( "GET", `/guilds/${ guildId }/members/${ memberId }` );
    }

    /**
     * Where a member is sitting, asked of discord rather than read off the client.
     *
     * Null when they are not in voice at all - discord answers that with a 404, which is not an error
     * here but the answer itself.
     */
    public async voiceState( guildId: string, memberId: string ): Promise<IRestVoiceState | null> {
        const response = await fetch( `${ DISCORD_URLS.API }/guilds/${ guildId }/voice-states/${ memberId }`, {
            headers: {
                Authorization: `Bot ${ this.token }`,
                "Content-Type": "application/json"
            }
        } );

        if ( 404 === response.status ) {
            return null;
        }

        if ( ! response.ok ) {
            throw new Error( `Discord voice state lookup failed: ${ response.status } ${ await response.text() }` );
        }

        return await response.json() as IRestVoiceState;
    }

    public async disconnectMember( guildId: string, memberId: string ): Promise<void> {
        await fetch( `${ DISCORD_URLS.API }/guilds/${ guildId }/members/${ memberId }`, {
            method: "PATCH",
            headers: {
                Authorization: `Bot ${ this.token }`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify( { channel_id: null } )
        } );
    }

    public async getChannel( channelId: string ): Promise<IRestChannel> {
        return this.request<IRestChannel>( "GET", `/channels/${ channelId }` );
    }

    public async deleteChannel( channelId: string ): Promise<void> {
        await this.request<IRestChannel>( "DELETE", `/channels/${ channelId }` );
    }

    public static isCategory( channel: IRestChannel ): boolean {
        return CHANNEL_TYPES.GUILD_CATEGORY === channel.type;
    }

    public static isVoice( channel: IRestChannel ): boolean {
        return CHANNEL_TYPES.GUILD_VOICE === channel.type;
    }

    public static isText( channel: IRestChannel ): boolean {
        return CHANNEL_TYPES.GUILD_TEXT === channel.type;
    }

    private async request<TResult>( method: string, route: string ): Promise<TResult> {
        for ( let attempt = 0; attempt < DISCORD_LIMITS.REST_RETRY_LIMIT; attempt++ ) {
            const response = await fetch( `${ DISCORD_URLS.API }${ route }`, {
                method,
                headers: {
                    Authorization: `Bot ${ this.token }`,
                    "Content-Type": "application/json"
                }
            } );

            if ( 429 === response.status ) {
                const body: IRateLimitBody = await response.json();

                await sleep( ( body.retry_after ?? 1 ) * 1000 + E2E_INTERVALS.POLL_MS );

                continue;
            }

            if ( 404 === response.status && "DELETE" === method ) {
                return undefined as TResult;
            }

            if ( ! response.ok ) {
                throw new Error( `Discord ${ method } ${ route } failed: ${ response.status } ${ await response.text() }` );
            }

            if ( 204 === response.status ) {
                return undefined as TResult;
            }

            return await response.json() as TResult;
        }

        throw new Error( `Discord ${ method } ${ route } gave up after ${ DISCORD_LIMITS.REST_RETRY_LIMIT } rate-limited attempts` );
    }
}
