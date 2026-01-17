import {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionsBitField,
    PermissionFlagsBits
} from "discord.js";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { environment } from "@vertix.gg/mcp/src/server/config/environment";

import type {
    GuildChannelTypes,
    Guild,
    GuildMember,
    User,
    GuildChannel,
    TextChannel,
    VoiceChannel,
    Message,
    Role,
    GuildBan,
    Webhook,
    Invite,
    GuildAuditLogsEntry,
    ThreadChannel,
    GuildEmoji,
    Sticker,
    MessageCreateOptions
} from "discord.js";

const logger = new Logger( "VertixMCP/DiscordClient", { skipEventBusHook: true } );

class DiscordClientService {
    private client: Client | null = null;
    private ready = false;
    private readyPromise: Promise<void> | null = null;

    public async getClient(): Promise<Client> {
        if ( ! this.client ) {
            this.client = new Client( {
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildBans,
                    GatewayIntentBits.GuildEmojisAndStickers,
                    GatewayIntentBits.GuildIntegrations,
                    GatewayIntentBits.GuildWebhooks,
                    GatewayIntentBits.GuildInvites,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildMessageReactions,
                    GatewayIntentBits.MessageContent
                ]
            } );

            this.readyPromise = new Promise( ( resolve ) => {
                this.client!.once( "ready", () => {
                    this.ready = true;
                    logger.info( this.getClient, `Discord client ready as ${ this.client!.user?.tag }` );
                    resolve();
                } );
            } );

            await this.client.login( environment.getDiscordToken() );
        }

        if ( ! this.ready && this.readyPromise ) {
            await this.readyPromise;
        }

        return this.client;
    }

    public async getGuild( guildId: string ): Promise<Guild> {
        const client = await this.getClient();
        const guild = await client.guilds.fetch( guildId );
        return guild;
    }

    public async getChannel( channelId: string ): Promise<GuildChannel | null> {
        const client = await this.getClient();
        const channel = await client.channels.fetch( channelId );
        return channel as GuildChannel | null;
    }

    public async getTextChannel( channelId: string ): Promise<TextChannel> {
        const channel = await this.getChannel( channelId );

        if ( ! channel || channel.type !== ChannelType.GuildText ) {
            throw new Error( `Channel ${ channelId } is not a text channel` );
        }

        return channel as TextChannel;
    }

    public serializeGuild( guild: Guild ): Record<string, unknown> {
        return {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            ownerId: guild.ownerId,
            memberCount: guild.memberCount,
            description: guild.description,
            createdAt: guild.createdAt.toISOString(),
            features: guild.features,
            premiumTier: guild.premiumTier,
            premiumSubscriptionCount: guild.premiumSubscriptionCount
        };
    }

    public serializeMember( member: GuildMember ): Record<string, unknown> {
        return {
            id: member.id,
            username: member.user.username,
            displayName: member.displayName,
            nickname: member.nickname,
            avatar: member.displayAvatarURL(),
            roles: member.roles.cache.map( r => ( { id: r.id, name: r.name } ) ),
            joinedAt: member.joinedAt?.toISOString(),
            premiumSince: member.premiumSince?.toISOString(),
            pending: member.pending,
            communicationDisabledUntil: member.communicationDisabledUntilTimestamp
        };
    }

    public serializeUser( user: User ): Record<string, unknown> {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.displayAvatarURL(),
            bot: user.bot,
            createdAt: user.createdAt.toISOString()
        };
    }

    public serializeChannel( channel: GuildChannel ): Record<string, unknown> {
        const base = {
            id: channel.id,
            name: channel.name,
            type: ChannelType[ channel.type ],
            guildId: channel.guildId,
            parentId: channel.parentId,
            position: channel.position,
            createdAt: channel.createdAt?.toISOString()
        };

        if ( channel.type === ChannelType.GuildText ) {
            const textChannel = channel as TextChannel;
            return {
                ... base,
                topic: textChannel.topic,
                nsfw: textChannel.nsfw,
                rateLimitPerUser: textChannel.rateLimitPerUser
            };
        }

        if ( channel.type === ChannelType.GuildVoice ) {
            const voiceChannel = channel as VoiceChannel;
            return {
                ... base,
                bitrate: voiceChannel.bitrate,
                userLimit: voiceChannel.userLimit,
                rtcRegion: voiceChannel.rtcRegion
            };
        }

        return base;
    }

    public serializeMessage( message: Message ): Record<string, unknown> {
        return {
            id: message.id,
            channelId: message.channelId,
            content: message.content,
            author: this.serializeUser( message.author ),
            timestamp: message.createdAt.toISOString(),
            editedTimestamp: message.editedAt?.toISOString(),
            embeds: message.embeds.map( e => ( {
                title: e.title,
                description: e.description,
                color: e.color,
                fields: e.fields
            } ) ),
            attachments: message.attachments.map( a => ( {
                id: a.id,
                name: a.name,
                url: a.url,
                size: a.size
            } ) ),
            reactions: message.reactions.cache.map( r => ( {
                emoji: r.emoji.name,
                count: r.count
            } ) ),
            pinned: message.pinned
        };
    }

    public serializeRole( role: Role ): Record<string, unknown> {
        return {
            id: role.id,
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions.toArray(),
            mentionable: role.mentionable,
            managed: role.managed,
            createdAt: role.createdAt.toISOString()
        };
    }

    public serializeBan( ban: GuildBan ): Record<string, unknown> {
        return {
            user: this.serializeUser( ban.user ),
            reason: ban.reason
        };
    }

    public serializeWebhook( webhook: Webhook ): Record<string, unknown> {
        return {
            id: webhook.id,
            name: webhook.name,
            avatar: webhook.avatarURL(),
            channelId: webhook.channelId,
            guildId: webhook.guildId,
            token: webhook.token,
            url: webhook.url
        };
    }

    public serializeInvite( invite: Invite ): Record<string, unknown> {
        return {
            code: invite.code,
            channelId: invite.channelId,
            guildId: invite.guild?.id,
            inviter: invite.inviter ? this.serializeUser( invite.inviter ) : null,
            maxAge: invite.maxAge,
            maxUses: invite.maxUses,
            uses: invite.uses,
            temporary: invite.temporary,
            createdAt: invite.createdAt?.toISOString(),
            expiresAt: invite.expiresAt?.toISOString()
        };
    }

    public serializeAuditLogEntry( entry: GuildAuditLogsEntry ): Record<string, unknown> {
        return {
            id: entry.id,
            action: entry.action,
            targetId: entry.targetId,
            executorId: entry.executorId,
            reason: entry.reason,
            createdAt: entry.createdAt.toISOString()
        };
    }

    public serializeThread( thread: ThreadChannel ): Record<string, unknown> {
        return {
            id: thread.id,
            name: thread.name,
            parentId: thread.parentId,
            ownerId: thread.ownerId,
            archived: thread.archived,
            locked: thread.locked,
            memberCount: thread.memberCount,
            messageCount: thread.messageCount,
            createdAt: thread.createdAt?.toISOString()
        };
    }

    public serializeEmoji( emoji: GuildEmoji ): Record<string, unknown> {
        return {
            id: emoji.id,
            name: emoji.name,
            animated: emoji.animated,
            url: emoji.url
        };
    }

    public serializeSticker( sticker: Sticker ): Record<string, unknown> {
        return {
            id: sticker.id,
            name: sticker.name,
            description: sticker.description,
            format: sticker.format,
            url: sticker.url
        };
    }

    public getChannelTypeFromString( type: string ): GuildChannelTypes {
        const typeMap: Record<string, GuildChannelTypes> = {
            text: ChannelType.GuildText,
            voice: ChannelType.GuildVoice,
            category: ChannelType.GuildCategory,
            announcement: ChannelType.GuildAnnouncement,
            stage: ChannelType.GuildStageVoice,
            forum: ChannelType.GuildForum
        };

        return typeMap[ type ] ?? ChannelType.GuildText;
    }

    public permissionStringsToFlags( permissions: string[] ): bigint {
        let flags = BigInt( 0 );

        for ( const perm of permissions ) {
            const flag = PermissionsBitField.Flags[ perm as keyof typeof PermissionsBitField.Flags ];

            if ( flag ) {
                flags |= flag;
            }
        }

        return flags;
    }

    public permissionStringsToRecord( permissions: string[] ): Partial<Record<keyof typeof PermissionFlagsBits, boolean>> {
        const result: Partial<Record<keyof typeof PermissionFlagsBits, boolean>> = {};

        for ( const perm of permissions ) {
            if ( perm in PermissionFlagsBits ) {
                result[ perm as keyof typeof PermissionFlagsBits ] = true;
            }
        }

        return result;
    }

    public async sendDM( userId: string, options: MessageCreateOptions ): Promise<Message> {
        if ( ! this.client ) {
            throw new Error( "Discord client not initialized" );
        }

        const user = await this.client.users.fetch( userId );
        const dmChannel = await user.createDM();

        return dmChannel.send( options );
    }
}

export const discordClient = new DiscordClientService();
