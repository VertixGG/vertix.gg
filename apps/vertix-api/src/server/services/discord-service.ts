import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

const DISCORD_API_BASE = "https://discord.com/api/v10";

/**
 * The two answers Discord gives for a guild the bot is not a member of: it reports one it cannot
 * see as missing, and one it is barred from as forbidden. Every other status is a failure to ask,
 * not an answer.
 */
const DISCORD_STATUS_FORBIDDEN = 403,
    DISCORD_STATUS_NOT_FOUND = 404;

export interface DiscordAPIChannel {
    id: string;
    name: string;
    type: number;
    position: number;
    parent_id: string | null;
}

export interface DiscordAPIRole {
    id: string;
    name: string;
    color: number;
    position: number;
    managed: boolean;
}

export interface DiscordAPIGuild {
    id: string;
    name: string;
    icon: string | null;
    owner_id: string;
    member_count?: number;
}

export interface DiscordChannelInfo {
    id: string;
    name: string;
    memberCount: number;
    position: number;
}

export class DiscordService extends ServiceBase {
    private botToken!: string;

    public static getName(): string {
        return "VertixAPI/Services/Discord";
    }

    public constructor() {
        super();

        const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_MCP_TOKEN || process.env.DISCORD_TOKEN;

        if ( !token ) {
            this.logger.error( "constructor", "DISCORD_BOT_TOKEN/DISCORD_MCP_TOKEN/DISCORD_TOKEN not set - cannot start API without Discord token" );
            process.exit( 1 );
        }

        this.botToken = token;
        this.logger.info( "constructor", "Discord service initialized with bot token" );
    }

    public async fetchChannel( channelId: string ): Promise<DiscordAPIChannel | null> {
        try {
            const response = await fetch( `${ DISCORD_API_BASE }/channels/${ channelId }`, {
                headers: {
                    Authorization: `Bot ${ this.botToken }`
                }
            } );

            if ( !response.ok ) {
                this.logger.warn( this.fetchChannel, `Failed to fetch channel ${ channelId }: ${ response.status }` );
                return null;
            }

            return await response.json() as DiscordAPIChannel;
        } catch( error ) {
            this.logger.error( this.fetchChannel, `Error fetching channel ${ channelId }`, error );
            return null;
        }
    }

    public async fetchGuildChannels( guildId: string ): Promise<DiscordAPIChannel[]> {
        try {
            const response = await fetch( `${ DISCORD_API_BASE }/guilds/${ guildId }/channels`, {
                headers: {
                    Authorization: `Bot ${ this.botToken }`
                }
            } );

            if ( !response.ok ) {
                this.logger.warn( this.fetchGuildChannels, `Failed to fetch channels for guild ${ guildId }: ${ response.status }` );
                return [];
            }

            return await response.json() as DiscordAPIChannel[];
        } catch( error ) {
            this.logger.error( this.fetchGuildChannels, `Error fetching channels for guild ${ guildId }`, error );
            return [];
        }
    }

    public async fetchGuildRoles( guildId: string ): Promise<DiscordAPIRole[]> {
        try {
            const response = await fetch( `${ DISCORD_API_BASE }/guilds/${ guildId }/roles`, {
                headers: {
                    Authorization: `Bot ${ this.botToken }`
                }
            } );

            if ( !response.ok ) {
                this.logger.warn( this.fetchGuildRoles, `Failed to fetch roles for guild ${ guildId }: ${ response.status }` );
                return [];
            }

            return await response.json() as DiscordAPIRole[];
        } catch( error ) {
            this.logger.error( this.fetchGuildRoles, `Error fetching roles for guild ${ guildId }`, error );
            return [];
        }
    }

    public async fetchGuild( guildId: string ): Promise<DiscordAPIGuild | null> {
        try {
            const response = await fetch( `${ DISCORD_API_BASE }/guilds/${ guildId }?with_counts=true`, {
                headers: {
                    Authorization: `Bot ${ this.botToken }`
                }
            } );

            if ( !response.ok ) {
                this.logger.warn( this.fetchGuild, `Failed to fetch guild ${ guildId }: ${ response.status }` );
                return null;
            }

            return await response.json() as DiscordAPIGuild;
        } catch( error ) {
            this.logger.error( this.fetchGuild, `Error fetching guild ${ guildId }`, error );
            return null;
        }
    }

    /**
     * Whether the bot is a member of the guild, asked of Discord rather than of our own tables.
     *
     * Our `isInGuild` column is only as fresh as the last cleanup pass, and a guild the bot was
     * never added to has no row to read at all - both of which this answers correctly.
     *
     * Returns null when the question could not be put to Discord. A refusal Discord never gave is
     * not a "no", and a caller that locks the dashboard on it would lock it on a network hiccup.
     */
    public async isBotInGuild( guildId: string ): Promise<boolean | null> {
        try {
            const response = await fetch( `${ DISCORD_API_BASE }/guilds/${ guildId }`, {
                headers: {
                    Authorization: `Bot ${ this.botToken }`
                }
            } );

            if ( response.ok ) {
                return true;
            }

            if ( DISCORD_STATUS_NOT_FOUND === response.status || DISCORD_STATUS_FORBIDDEN === response.status ) {
                return false;
            }

            this.logger.warn( this.isBotInGuild, `Guild ${ guildId } answered ${ response.status } - membership unknown` );

            return null;
        } catch( error ) {
            this.logger.error( this.isBotInGuild, `Error asking Discord about guild ${ guildId }`, error );
            return null;
        }
    }

    public async fetchScalingChannelInfo(
        guildId: string,
        masterChannelId: string,
        scalingChannelIds: string[]
    ): Promise<{
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
        scalingChannels: DiscordChannelInfo[];
    }> {
        const result = {
            masterChannel: null as DiscordChannelInfo | null,
            category: null as DiscordChannelInfo | null,
            scalingChannels: [] as DiscordChannelInfo[]
        };

        try {
            // Fetch all guild channels at once (more efficient than individual requests)
            const allChannels = await this.fetchGuildChannels( guildId );

            const channelMap = new Map( allChannels.map( ( ch ) => [ ch.id, ch ] ) );

            // Find master channel
            const masterChannel = channelMap.get( masterChannelId );

            if ( masterChannel ) {
                result.masterChannel = {
                    id: masterChannel.id,
                    name: masterChannel.name,
                    memberCount: 0, // REST API doesn't provide member count
                    position: masterChannel.position
                };

                // Find category
                if ( masterChannel.parent_id ) {
                    const category = channelMap.get( masterChannel.parent_id );

                    if ( category ) {
                        result.category = {
                            id: category.id,
                            name: category.name,
                            memberCount: 0,
                            position: category.position
                        };
                    }
                }
            }

            // Find scaling channels
            for ( const channelId of scalingChannelIds ) {
                const channel = channelMap.get( channelId );

                if ( channel ) {
                    result.scalingChannels.push( {
                        id: channel.id,
                        name: channel.name,
                        memberCount: 0,
                        position: channel.position
                    } );
                }
            }
        } catch( error ) {
            this.logger.error( this.fetchScalingChannelInfo, "Failed to fetch Discord channel info", error );
        }

        return result;
    }
}

export default DiscordService;
