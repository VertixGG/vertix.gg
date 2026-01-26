import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export interface DiscordAPIChannel {
    id: string;
    name: string;
    type: number;
    position: number;
    parent_id: string | null;
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
    private botToken: string | null = null;

    public static getName(): string {
        return "VertixAPI/Services/Discord";
    }

    protected async initialize(): Promise<void> {
        this.botToken = process.env.DISCORD_TEST_TOKEN || null;

        if ( !this.botToken ) {
            this.logger.warn( this.initialize, "DISCORD_TEST_TOKEN not set - Discord API features will be unavailable" );
        } else {
            this.logger.info( this.initialize, "Discord service initialized with bot token" );
        }
    }

    public isReady(): boolean {
        return this.botToken !== null;
    }

    public async fetchChannel( channelId: string ): Promise<DiscordAPIChannel | null> {
        if ( !this.botToken ) {
            return null;
        }

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
        if ( !this.botToken ) {
            return [];
        }

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

    public async fetchGuild( guildId: string ): Promise<DiscordAPIGuild | null> {
        if ( !this.botToken ) {
            return null;
        }

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

        if ( !this.botToken ) {
            return result;
        }

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
