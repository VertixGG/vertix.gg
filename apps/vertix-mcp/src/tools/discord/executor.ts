import { z } from "zod";
import { ChannelType, OverwriteType, ThreadAutoArchiveDuration } from "discord.js";

import { discordClient } from "@vertix.gg/mcp/src/services/discord-client";

import {
    GuildIdSchema,
    ChannelIdSchema,
    MessageIdSchema,
    UserIdSchema,
    RoleIdSchema,
    SendMessageSchema,
    EditMessageSchema,
    ReactionSchema,
    CreateChannelSchema,
    EditChannelSchema,
    ChannelPermissionSchema,
    CreateRoleSchema,
    EditRoleSchema,
    MemberRoleSchema,
    ModerationSchema,
    TimeoutSchema,
    BanSchema,
    WebhookSchema,
    WebhookMessageSchema,
    ThreadSchema,
    BulkDeleteSchema,
    PinMessageSchema,
    GetMessagesSchema,
    SearchMembersSchema,
    GetAuditLogSchema,
    InviteSchema,
    SendFileSchema,
    SendDMSchema
} from "@vertix.gg/mcp/src/tools/discord/schemas";

import type { TextChannel, NewsChannel, VoiceChannel, GuildTextBasedChannel } from "discord.js";

type ToolResult = Record<string, unknown>;

export async function executeDiscordTool( name: string, args: Record<string, unknown> | undefined ): Promise<ToolResult> {
    switch ( name ) {
        case "discord_get_guild": {
            const parsed = GuildIdSchema.parse( args );
            return getGuild( parsed.guildId );
        }

        case "discord_get_guild_members": {
            const parsed = z.object( {
                guildId: z.string(),
                limit: z.number().optional(),
                after: z.string().optional()
            } ).parse( args );
            return getGuildMembers( parsed.guildId, parsed.limit, parsed.after );
        }

        case "discord_search_members": {
            const parsed = SearchMembersSchema.parse( args );
            return searchMembers( parsed.guildId, parsed.query, parsed.limit );
        }

        case "discord_get_member": {
            const parsed = z.object( {
                guildId: z.string(),
                userId: z.string()
            } ).parse( args );
            return getMember( parsed.guildId, parsed.userId );
        }

        case "discord_get_user": {
            const parsed = UserIdSchema.parse( args );
            return getUser( parsed.userId );
        }

        case "discord_get_channels": {
            const parsed = GuildIdSchema.parse( args );
            return getChannels( parsed.guildId );
        }

        case "discord_get_channel": {
            const parsed = ChannelIdSchema.parse( args );
            return getChannel( parsed.channelId );
        }

        case "discord_create_channel": {
            const parsed = CreateChannelSchema.parse( args );
            return createChannel( parsed );
        }

        case "discord_edit_channel": {
            const parsed = EditChannelSchema.parse( args );
            return editChannel( parsed );
        }

        case "discord_delete_channel": {
            const parsed = ChannelIdSchema.parse( args );
            return deleteChannel( parsed.channelId );
        }

        case "discord_set_channel_permissions": {
            const parsed = ChannelPermissionSchema.parse( args );
            return setChannelPermissions( parsed );
        }

        case "discord_get_messages": {
            const parsed = GetMessagesSchema.parse( args );
            return getMessages( parsed );
        }

        case "discord_get_message": {
            const parsed = MessageIdSchema.parse( args );
            return getMessage( parsed.channelId, parsed.messageId );
        }

        case "discord_send_message": {
            const parsed = SendMessageSchema.parse( args );
            return sendMessage( parsed );
        }

        case "discord_edit_message": {
            const parsed = EditMessageSchema.parse( args );
            return editMessage( parsed );
        }

        case "discord_delete_message": {
            const parsed = MessageIdSchema.parse( args );
            return deleteMessage( parsed.channelId, parsed.messageId );
        }

        case "discord_bulk_delete_messages": {
            const parsed = BulkDeleteSchema.parse( args );
            return bulkDeleteMessages( parsed.channelId, parsed.messageIds );
        }

        case "discord_pin_message": {
            const parsed = PinMessageSchema.parse( args );
            return pinMessage( parsed.channelId, parsed.messageId );
        }

        case "discord_unpin_message": {
            const parsed = PinMessageSchema.parse( args );
            return unpinMessage( parsed.channelId, parsed.messageId );
        }

        case "discord_get_pinned_messages": {
            const parsed = ChannelIdSchema.parse( args );
            return getPinnedMessages( parsed.channelId );
        }

        case "discord_add_reaction": {
            const parsed = ReactionSchema.parse( args );
            return addReaction( parsed );
        }

        case "discord_remove_reaction": {
            const parsed = z.object( {
                channelId: z.string(),
                messageId: z.string(),
                emoji: z.string(),
                userId: z.string().optional()
            } ).parse( args );
            return removeReaction( parsed.channelId, parsed.messageId, parsed.emoji, parsed.userId );
        }

        case "discord_get_reactions": {
            const parsed = z.object( {
                channelId: z.string(),
                messageId: z.string(),
                emoji: z.string(),
                limit: z.number().optional()
            } ).parse( args );
            return getReactions( parsed.channelId, parsed.messageId, parsed.emoji, parsed.limit );
        }

        case "discord_clear_reactions": {
            const parsed = z.object( {
                channelId: z.string(),
                messageId: z.string(),
                emoji: z.string().optional()
            } ).parse( args );
            return clearReactions( parsed.channelId, parsed.messageId, parsed.emoji );
        }

        case "discord_get_roles": {
            const parsed = GuildIdSchema.parse( args );
            return getRoles( parsed.guildId );
        }

        case "discord_get_role": {
            const parsed = RoleIdSchema.parse( args );
            return getRole( parsed.guildId, parsed.roleId );
        }

        case "discord_create_role": {
            const parsed = CreateRoleSchema.parse( args );
            return createRole( parsed );
        }

        case "discord_edit_role": {
            const parsed = EditRoleSchema.parse( args );
            return editRole( parsed );
        }

        case "discord_delete_role": {
            const parsed = RoleIdSchema.parse( args );
            return deleteRole( parsed.guildId, parsed.roleId );
        }

        case "discord_add_role_to_member": {
            const parsed = MemberRoleSchema.parse( args );
            return addRoleToMember( parsed );
        }

        case "discord_remove_role_from_member": {
            const parsed = MemberRoleSchema.parse( args );
            return removeRoleFromMember( parsed );
        }

        case "discord_kick_member": {
            const parsed = ModerationSchema.parse( args );
            return kickMember( parsed );
        }

        case "discord_ban_member": {
            const parsed = BanSchema.parse( args );
            return banMember( parsed );
        }

        case "discord_unban_member": {
            const parsed = z.object( {
                guildId: z.string(),
                userId: z.string()
            } ).parse( args );
            return unbanMember( parsed.guildId, parsed.userId );
        }

        case "discord_get_bans": {
            const parsed = z.object( {
                guildId: z.string(),
                limit: z.number().optional()
            } ).parse( args );
            return getBans( parsed.guildId, parsed.limit );
        }

        case "discord_timeout_member": {
            const parsed = TimeoutSchema.parse( args );
            return timeoutMember( parsed );
        }

        case "discord_remove_timeout": {
            const parsed = z.object( {
                guildId: z.string(),
                userId: z.string()
            } ).parse( args );
            return removeTimeout( parsed.guildId, parsed.userId );
        }

        case "discord_get_voice_states": {
            const parsed = GuildIdSchema.parse( args );
            return getVoiceStates( parsed.guildId );
        }

        case "discord_move_member_voice": {
            const parsed = z.object( {
                guildId: z.string(),
                userId: z.string(),
                channelId: z.string().nullable().optional()
            } ).parse( args );
            return moveMemberVoice( parsed.guildId, parsed.userId, parsed.channelId ?? null );
        }

        case "discord_set_voice_mute": {
            const parsed = z.object( {
                guildId: z.string(),
                userId: z.string(),
                mute: z.boolean()
            } ).parse( args );
            return setVoiceMute( parsed.guildId, parsed.userId, parsed.mute );
        }

        case "discord_set_voice_deaf": {
            const parsed = z.object( {
                guildId: z.string(),
                userId: z.string(),
                deaf: z.boolean()
            } ).parse( args );
            return setVoiceDeaf( parsed.guildId, parsed.userId, parsed.deaf );
        }

        case "discord_create_thread": {
            const parsed = ThreadSchema.parse( args );
            return createThread( parsed );
        }

        case "discord_get_threads": {
            const parsed = ChannelIdSchema.parse( args );
            return getThreads( parsed.channelId );
        }

        case "discord_join_thread": {
            const parsed = z.object( { threadId: z.string() } ).parse( args );
            return joinThread( parsed.threadId );
        }

        case "discord_leave_thread": {
            const parsed = z.object( { threadId: z.string() } ).parse( args );
            return leaveThread( parsed.threadId );
        }

        case "discord_archive_thread": {
            const parsed = z.object( {
                threadId: z.string(),
                locked: z.boolean().optional()
            } ).parse( args );
            return archiveThread( parsed.threadId, parsed.locked );
        }

        case "discord_get_webhooks": {
            const parsed = ChannelIdSchema.parse( args );
            return getWebhooks( parsed.channelId );
        }

        case "discord_create_webhook": {
            const parsed = WebhookSchema.parse( args );
            return createWebhook( parsed );
        }

        case "discord_delete_webhook": {
            const parsed = z.object( { webhookId: z.string() } ).parse( args );
            return deleteWebhook( parsed.webhookId );
        }

        case "discord_send_webhook_message": {
            const parsed = WebhookMessageSchema.parse( args );
            return sendWebhookMessage( parsed );
        }

        case "discord_create_invite": {
            const parsed = InviteSchema.parse( args );
            return createInvite( parsed );
        }

        case "discord_get_invites": {
            const parsed = GuildIdSchema.parse( args );
            return getInvites( parsed.guildId );
        }

        case "discord_delete_invite": {
            const parsed = z.object( { inviteCode: z.string() } ).parse( args );
            return deleteInvite( parsed.inviteCode );
        }

        case "discord_get_audit_log": {
            const parsed = GetAuditLogSchema.parse( args );
            return getAuditLog( parsed );
        }

        case "discord_get_emojis": {
            const parsed = GuildIdSchema.parse( args );
            return getEmojis( parsed.guildId );
        }

        case "discord_get_stickers": {
            const parsed = GuildIdSchema.parse( args );
            return getStickers( parsed.guildId );
        }

        case "discord_send_file": {
            const parsed = SendFileSchema.parse( args );
            return sendFile( parsed );
        }

        case "discord_send_dm": {
            const parsed = SendDMSchema.parse( args );
            return sendDM( parsed );
        }

        default:
            throw new Error( `Unknown Discord tool: ${ name }` );
    }
}

async function getGuild( guildId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    return discordClient.serializeGuild( guild );
}

async function getGuildMembers( guildId: string, limit?: number, after?: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const members = await guild.members.list( { limit: limit || 100, after } );

    return {
        guildId,
        members: members.map( m => discordClient.serializeMember( m ) ),
        count: members.size
    };
}

async function searchMembers( guildId: string, query: string, limit?: number ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const members = await guild.members.search( { query, limit: limit || 100 } );

    return {
        guildId,
        query,
        members: members.map( m => discordClient.serializeMember( m ) ),
        count: members.size
    };
}

async function getMember( guildId: string, userId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const member = await guild.members.fetch( userId );

    return discordClient.serializeMember( member );
}

async function getUser( userId: string ): Promise<ToolResult> {
    const client = await discordClient.getClient();
    const user = await client.users.fetch( userId );

    return discordClient.serializeUser( user );
}

async function getChannels( guildId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const channels = await guild.channels.fetch();

    return {
        guildId,
        channels: channels.filter( c => c !== null ).map( c => discordClient.serializeChannel( c! ) ),
        count: channels.size
    };
}

async function getChannel( channelId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId );

    if ( ! channel ) {
        throw new Error( `Channel ${ channelId } not found` );
    }

    return discordClient.serializeChannel( channel );
}

async function createChannel( config: z.infer<typeof CreateChannelSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );

    const channel = await guild.channels.create( {
        name: config.name,
        type: discordClient.getChannelTypeFromString( config.type ),
        parent: config.parentId,
        topic: config.topic,
        nsfw: config.nsfw,
        rateLimitPerUser: config.rateLimitPerUser,
        userLimit: config.userLimit,
        bitrate: config.bitrate
    } );

    return {
        success: true,
        channel: discordClient.serializeChannel( channel )
    };
}

async function editChannel( config: z.infer<typeof EditChannelSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId );

    if ( ! channel ) {
        throw new Error( `Channel ${ config.channelId } not found` );
    }

    const updated = await channel.edit( {
        name: config.name,
        topic: config.topic,
        nsfw: config.nsfw,
        rateLimitPerUser: config.rateLimitPerUser,
        parent: config.parentId,
        position: config.position
    } );

    return {
        success: true,
        channel: discordClient.serializeChannel( updated )
    };
}

async function deleteChannel( channelId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId );

    if ( ! channel ) {
        throw new Error( `Channel ${ channelId } not found` );
    }

    await channel.delete();

    return { success: true, channelId };
}

async function setChannelPermissions( config: z.infer<typeof ChannelPermissionSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId );

    if ( ! channel ) {
        throw new Error( `Channel ${ config.channelId } not found` );
    }

    const permissions: Record<string, boolean | null> = {};

    if ( config.allow ) {
        for ( const perm of config.allow ) {
            permissions[ perm ] = true;
        }
    }

    if ( config.deny ) {
        for ( const perm of config.deny ) {
            permissions[ perm ] = false;
        }
    }

    await channel.permissionOverwrites.edit( config.targetId, permissions, {
        type: config.targetType === "user" ? OverwriteType.Member : OverwriteType.Role
    } );

    return { success: true, ... config };
}

async function getMessages( config: z.infer<typeof GetMessagesSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } is not a text channel` );
    }

    const messages = await channel.messages.fetch( {
        limit: config.limit || 50,
        before: config.before,
        after: config.after,
        around: config.around
    } );

    return {
        channelId: config.channelId,
        messages: messages.map( m => discordClient.serializeMessage( m ) ),
        count: messages.size
    };
}

async function getMessage( channelId: string, messageId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( messageId );

    return discordClient.serializeMessage( message );
}

async function sendMessage( config: z.infer<typeof SendMessageSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "send" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } is not a text channel` );
    }

    const message = await channel.send( {
        content: config.content,
        embeds: config.embeds?.map( e => ( {
            title: e.title,
            description: e.description,
            color: e.color,
            fields: e.fields,
            footer: e.footer ? { text: e.footer.text, iconURL: e.footer.iconUrl } : undefined,
            thumbnail: e.thumbnail,
            image: e.image
        } ) )
    } );

    return {
        success: true,
        message: discordClient.serializeMessage( message )
    };
}

async function editMessage( config: z.infer<typeof EditMessageSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( config.messageId );
    const updated = await message.edit( {
        content: config.content,
        embeds: config.embeds?.map( e => ( {
            title: e.title,
            description: e.description,
            color: e.color,
            fields: e.fields
        } ) )
    } );

    return {
        success: true,
        message: discordClient.serializeMessage( updated )
    };
}

async function deleteMessage( channelId: string, messageId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( messageId );
    await message.delete();

    return { success: true, channelId, messageId };
}

async function bulkDeleteMessages( channelId: string, messageIds: string[] ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as TextChannel;

    if ( ! channel || channel.type !== ChannelType.GuildText ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const deleted = await channel.bulkDelete( messageIds );

    return {
        success: true,
        channelId,
        deleted: deleted.size
    };
}

async function pinMessage( channelId: string, messageId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( messageId );
    await message.pin();

    return { success: true, channelId, messageId };
}

async function unpinMessage( channelId: string, messageId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( messageId );
    await message.unpin();

    return { success: true, channelId, messageId };
}

async function getPinnedMessages( channelId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const messages = await channel.messages.fetchPinned();

    return {
        channelId,
        messages: messages.map( m => discordClient.serializeMessage( m ) ),
        count: messages.size
    };
}

async function addReaction( config: z.infer<typeof ReactionSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( config.messageId );
    await message.react( config.emoji );

    return { success: true, ... config };
}

async function removeReaction( channelId: string, messageId: string, emoji: string, userId?: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( messageId );
    const reaction = message.reactions.cache.get( emoji );

    if ( reaction ) {
        if ( userId ) {
            await reaction.users.remove( userId );
        } else {
            await reaction.users.remove();
        }
    }

    return { success: true, channelId, messageId, emoji, userId };
}

async function getReactions( channelId: string, messageId: string, emoji: string, limit?: number ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( messageId );
    const reaction = message.reactions.cache.get( emoji );

    if ( ! reaction ) {
        return { channelId, messageId, emoji, users: [], count: 0 };
    }

    const users = await reaction.users.fetch( { limit: limit || 100 } );

    return {
        channelId,
        messageId,
        emoji,
        users: users.map( u => discordClient.serializeUser( u ) ),
        count: users.size
    };
}

async function clearReactions( channelId: string, messageId: string, emoji?: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "messages" in channel ) ) {
        throw new Error( `Channel ${ channelId } is not a text channel` );
    }

    const message = await channel.messages.fetch( messageId );

    if ( emoji ) {
        const reaction = message.reactions.cache.get( emoji );

        if ( reaction ) {
            await reaction.remove();
        }
    } else {
        await message.reactions.removeAll();
    }

    return { success: true, channelId, messageId, emoji };
}

async function getRoles( guildId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const roles = await guild.roles.fetch();

    return {
        guildId,
        roles: roles.map( r => discordClient.serializeRole( r ) ),
        count: roles.size
    };
}

async function getRole( guildId: string, roleId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const role = await guild.roles.fetch( roleId );

    if ( ! role ) {
        throw new Error( `Role ${ roleId } not found` );
    }

    return discordClient.serializeRole( role );
}

async function createRole( config: z.infer<typeof CreateRoleSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );

    const role = await guild.roles.create( {
        name: config.name,
        color: config.color,
        hoist: config.hoist,
        mentionable: config.mentionable,
        permissions: config.permissions ? discordClient.permissionStringsToFlags( config.permissions ) : undefined
    } );

    return {
        success: true,
        role: discordClient.serializeRole( role )
    };
}

async function editRole( config: z.infer<typeof EditRoleSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );
    const role = await guild.roles.fetch( config.roleId );

    if ( ! role ) {
        throw new Error( `Role ${ config.roleId } not found` );
    }

    const updated = await role.edit( {
        name: config.name,
        color: config.color,
        hoist: config.hoist,
        mentionable: config.mentionable,
        permissions: config.permissions ? discordClient.permissionStringsToFlags( config.permissions ) : undefined
    } );

    return {
        success: true,
        role: discordClient.serializeRole( updated )
    };
}

async function deleteRole( guildId: string, roleId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const role = await guild.roles.fetch( roleId );

    if ( ! role ) {
        throw new Error( `Role ${ roleId } not found` );
    }

    await role.delete();

    return { success: true, guildId, roleId };
}

async function addRoleToMember( config: z.infer<typeof MemberRoleSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );
    const member = await guild.members.fetch( config.userId );

    await member.roles.add( config.roleId );

    return { success: true, ... config };
}

async function removeRoleFromMember( config: z.infer<typeof MemberRoleSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );
    const member = await guild.members.fetch( config.userId );

    await member.roles.remove( config.roleId );

    return { success: true, ... config };
}

async function kickMember( config: z.infer<typeof ModerationSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );
    const member = await guild.members.fetch( config.userId );

    await member.kick( config.reason );

    return { success: true, ... config };
}

async function banMember( config: z.infer<typeof BanSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );

    await guild.members.ban( config.userId, {
        reason: config.reason,
        deleteMessageSeconds: config.deleteMessageDays ? config.deleteMessageDays * 86400 : undefined
    } );

    return { success: true, ... config };
}

async function unbanMember( guildId: string, userId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    await guild.members.unban( userId );

    return { success: true, guildId, userId };
}

async function getBans( guildId: string, limit?: number ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const bans = await guild.bans.fetch( { limit: limit || 100 } );

    return {
        guildId,
        bans: bans.map( b => discordClient.serializeBan( b ) ),
        count: bans.size
    };
}

async function timeoutMember( config: z.infer<typeof TimeoutSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );
    const member = await guild.members.fetch( config.userId );

    await member.timeout( config.duration * 1000, config.reason );

    return { success: true, ... config };
}

async function removeTimeout( guildId: string, userId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const member = await guild.members.fetch( userId );

    await member.timeout( null );

    return { success: true, guildId, userId };
}

async function getVoiceStates( guildId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );

    const voiceStates = guild.voiceStates.cache.map( vs => ( {
        memberId: vs.member?.id,
        memberName: vs.member?.displayName,
        channelId: vs.channelId,
        channelName: vs.channel?.name,
        selfMute: vs.selfMute,
        selfDeaf: vs.selfDeaf,
        serverMute: vs.serverMute,
        serverDeaf: vs.serverDeaf,
        streaming: vs.streaming,
        selfVideo: vs.selfVideo
    } ) );

    return {
        guildId,
        voiceStates,
        count: voiceStates.length
    };
}

async function moveMemberVoice( guildId: string, userId: string, channelId: string | null ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const member = await guild.members.fetch( userId );

    await member.voice.setChannel( channelId );

    return { success: true, guildId, userId, channelId };
}

async function setVoiceMute( guildId: string, userId: string, mute: boolean ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const member = await guild.members.fetch( userId );

    await member.voice.setMute( mute );

    return { success: true, guildId, userId, mute };
}

async function setVoiceDeaf( guildId: string, userId: string, deaf: boolean ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const member = await guild.members.fetch( userId );

    await member.voice.setDeaf( deaf );

    return { success: true, guildId, userId, deaf };
}

async function createThread( config: z.infer<typeof ThreadSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as TextChannel | NewsChannel;

    if ( ! channel || ! ( "threads" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } does not support threads` );
    }

    const archiveDurationMap: Record<string, ThreadAutoArchiveDuration> = {
        "60": ThreadAutoArchiveDuration.OneHour,
        "1440": ThreadAutoArchiveDuration.OneDay,
        "4320": ThreadAutoArchiveDuration.ThreeDays,
        "10080": ThreadAutoArchiveDuration.OneWeek
    };

    let thread;

    if ( config.messageId ) {
        const message = await channel.messages.fetch( config.messageId );
        thread = await message.startThread( {
            name: config.name,
            autoArchiveDuration: config.autoArchiveDuration
                ? archiveDurationMap[ config.autoArchiveDuration ]
                : undefined
        } );
    } else {
        thread = await channel.threads.create( {
            name: config.name,
            autoArchiveDuration: config.autoArchiveDuration
                ? archiveDurationMap[ config.autoArchiveDuration ]
                : undefined
        } );
    }

    return {
        success: true,
        thread: discordClient.serializeThread( thread )
    };
}

async function getThreads( channelId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as TextChannel | NewsChannel;

    if ( ! channel || ! ( "threads" in channel ) ) {
        throw new Error( `Channel ${ channelId } does not support threads` );
    }

    const threads = await channel.threads.fetchActive();

    return {
        channelId,
        threads: threads.threads.map( t => discordClient.serializeThread( t ) ),
        count: threads.threads.size
    };
}

async function joinThread( threadId: string ): Promise<ToolResult> {
    const client = await discordClient.getClient();
    const thread = await client.channels.fetch( threadId );

    if ( ! thread || thread.type !== ChannelType.PublicThread && thread.type !== ChannelType.PrivateThread ) {
        throw new Error( `${ threadId } is not a thread` );
    }

    await thread.join();

    return { success: true, threadId };
}

async function leaveThread( threadId: string ): Promise<ToolResult> {
    const client = await discordClient.getClient();
    const thread = await client.channels.fetch( threadId );

    if ( ! thread || thread.type !== ChannelType.PublicThread && thread.type !== ChannelType.PrivateThread ) {
        throw new Error( `${ threadId } is not a thread` );
    }

    await thread.leave();

    return { success: true, threadId };
}

async function archiveThread( threadId: string, locked?: boolean ): Promise<ToolResult> {
    const client = await discordClient.getClient();
    const thread = await client.channels.fetch( threadId );

    if ( ! thread || thread.type !== ChannelType.PublicThread && thread.type !== ChannelType.PrivateThread ) {
        throw new Error( `${ threadId } is not a thread` );
    }

    await thread.setArchived( true );

    if ( locked ) {
        await thread.setLocked( true );
    }

    return { success: true, threadId, locked };
}

async function getWebhooks( channelId: string ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( channelId ) as TextChannel;

    if ( ! channel || ! ( "fetchWebhooks" in channel ) ) {
        throw new Error( `Channel ${ channelId } does not support webhooks` );
    }

    const webhooks = await channel.fetchWebhooks();

    return {
        channelId,
        webhooks: webhooks.map( w => discordClient.serializeWebhook( w ) ),
        count: webhooks.size
    };
}

async function createWebhook( config: z.infer<typeof WebhookSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as TextChannel;

    if ( ! channel || ! ( "createWebhook" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } does not support webhooks` );
    }

    const webhook = await channel.createWebhook( {
        name: config.name,
        avatar: config.avatar
    } );

    return {
        success: true,
        webhook: discordClient.serializeWebhook( webhook )
    };
}

async function deleteWebhook( webhookId: string ): Promise<ToolResult> {
    const client = await discordClient.getClient();
    const webhook = await client.fetchWebhook( webhookId );

    await webhook.delete();

    return { success: true, webhookId };
}

async function sendWebhookMessage( config: z.infer<typeof WebhookMessageSchema> ): Promise<ToolResult> {
    const client = await discordClient.getClient();
    const webhook = await client.fetchWebhook( config.webhookId, config.webhookToken );

    const message = await webhook.send( {
        content: config.content,
        username: config.username,
        avatarURL: config.avatarUrl,
        embeds: config.embeds?.map( e => ( {
            title: e.title,
            description: e.description,
            color: e.color
        } ) )
    } );

    return {
        success: true,
        messageId: message.id
    };
}

async function createInvite( config: z.infer<typeof InviteSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as VoiceChannel | TextChannel;

    if ( ! channel || ! ( "createInvite" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } does not support invites` );
    }

    const invite = await channel.createInvite( {
        maxAge: config.maxAge,
        maxUses: config.maxUses,
        temporary: config.temporary,
        unique: config.unique
    } );

    return {
        success: true,
        invite: discordClient.serializeInvite( invite )
    };
}

async function getInvites( guildId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const invites = await guild.invites.fetch();

    return {
        guildId,
        invites: invites.map( i => discordClient.serializeInvite( i ) ),
        count: invites.size
    };
}

async function deleteInvite( inviteCode: string ): Promise<ToolResult> {
    const client = await discordClient.getClient();
    const invite = await client.fetchInvite( inviteCode );

    await invite.delete();

    return { success: true, inviteCode };
}

async function getAuditLog( config: z.infer<typeof GetAuditLogSchema> ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( config.guildId );

    const auditLogs = await guild.fetchAuditLogs( {
        limit: config.limit || 50,
        user: config.userId
    } );

    const entries = auditLogs.entries.map( e => ( {
        id: e.id,
        action: e.action,
        targetId: e.targetId,
        executorId: e.executorId,
        reason: e.reason,
        createdAt: e.createdAt.toISOString()
    } ) );

    return {
        guildId: config.guildId,
        entries,
        count: entries.length
    };
}

async function getEmojis( guildId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const emojis = await guild.emojis.fetch();

    return {
        guildId,
        emojis: emojis.map( e => discordClient.serializeEmoji( e ) ),
        count: emojis.size
    };
}

async function getStickers( guildId: string ): Promise<ToolResult> {
    const guild = await discordClient.getGuild( guildId );
    const stickers = await guild.stickers.fetch();

    return {
        guildId,
        stickers: stickers.map( s => discordClient.serializeSticker( s ) ),
        count: stickers.size
    };
}

async function sendFile( config: z.infer<typeof SendFileSchema> ): Promise<ToolResult> {
    const channel = await discordClient.getChannel( config.channelId ) as GuildTextBasedChannel;

    if ( ! channel || ! ( "send" in channel ) ) {
        throw new Error( `Channel ${ config.channelId } is not a text channel` );
    }

    let attachment: { attachment: Buffer | string; name: string };

    if ( config.url ) {
        const response = await fetch( config.url );

        if ( ! response.ok ) {
            throw new Error( `Failed to fetch file from URL: ${ response.status } ${ response.statusText }` );
        }

        const buffer = Buffer.from( await response.arrayBuffer() );
        const filename = config.spoiler ? `SPOILER_${ config.filename }` : config.filename;

        attachment = { attachment: buffer, name: filename };
    } else if ( config.base64 ) {
        const buffer = Buffer.from( config.base64, "base64" );
        const filename = config.spoiler ? `SPOILER_${ config.filename }` : config.filename;

        attachment = { attachment: buffer, name: filename };
    } else {
        throw new Error( "Either url or base64 must be provided" );
    }

    const message = await channel.send( {
        content: config.content,
        files: [ attachment ]
    } );

    return {
        success: true,
        message: discordClient.serializeMessage( message )
    };
}

async function sendDM( config: z.infer<typeof SendDMSchema> ): Promise<ToolResult> {
    const embeds = config.embeds?.map( ( embed ) => ( {
        title: embed.title,
        description: embed.description,
        color: embed.color,
        fields: embed.fields,
        footer: embed.footer ? {
            text: embed.footer.text,
            icon_url: embed.footer.iconUrl
        } : undefined,
        thumbnail: embed.thumbnail,
        image: embed.image
    } ) );

    const message = await discordClient.sendDM( config.userId, {
        content: config.content,
        embeds
    } );

    return {
        success: true,
        message: discordClient.serializeMessage( message )
    };
}
