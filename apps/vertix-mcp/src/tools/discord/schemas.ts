import { z } from "zod";

export const GuildIdSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" )
} );

export const ChannelIdSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" )
} );

export const MessageIdSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    messageId: z.string().describe( "Discord Message ID" )
} );

export const UserIdSchema = z.object( {
    userId: z.string().describe( "Discord User ID" )
} );

export const RoleIdSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    roleId: z.string().describe( "Discord Role ID" )
} );

export const SendMessageSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    content: z.string().optional().describe( "Message content" ),
    embeds: z.array( z.object( {
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.number().optional(),
        fields: z.array( z.object( {
            name: z.string(),
            value: z.string(),
            inline: z.boolean().optional()
        } ) ).optional(),
        footer: z.object( {
            text: z.string(),
            iconUrl: z.string().optional()
        } ).optional(),
        thumbnail: z.object( { url: z.string() } ).optional(),
        image: z.object( { url: z.string() } ).optional()
    } ) ).optional().describe( "Embed objects" )
} );

export const EditMessageSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    messageId: z.string().describe( "Discord Message ID" ),
    content: z.string().optional().describe( "New message content" ),
    embeds: z.array( z.object( {
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.number().optional(),
        fields: z.array( z.object( {
            name: z.string(),
            value: z.string(),
            inline: z.boolean().optional()
        } ) ).optional()
    } ) ).optional().describe( "New embeds" )
} );

export const ReactionSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    messageId: z.string().describe( "Discord Message ID" ),
    emoji: z.string().describe( "Emoji to react with (unicode or custom emoji ID)" )
} );

export const CreateChannelSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    name: z.string().describe( "Channel name" ),
    type: z.enum( [ "text", "voice", "category", "announcement", "stage", "forum" ] ).describe( "Channel type" ),
    parentId: z.string().optional().describe( "Parent category ID" ),
    topic: z.string().optional().describe( "Channel topic" ),
    nsfw: z.boolean().optional().describe( "NSFW channel" ),
    rateLimitPerUser: z.number().optional().describe( "Slowmode in seconds" ),
    userLimit: z.number().optional().describe( "User limit for voice channels" ),
    bitrate: z.number().optional().describe( "Bitrate for voice channels" )
} );

export const EditChannelSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    name: z.string().optional().describe( "New name" ),
    topic: z.string().optional().describe( "New topic" ),
    nsfw: z.boolean().optional().describe( "NSFW setting" ),
    rateLimitPerUser: z.number().optional().describe( "Slowmode" ),
    parentId: z.string().optional().describe( "New parent category" ),
    position: z.number().optional().describe( "New position" )
} );

export const ChannelPermissionSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    targetId: z.string().describe( "User or Role ID" ),
    targetType: z.enum( [ "user", "role" ] ).describe( "Target type" ),
    allow: z.array( z.string() ).optional().describe( "Permissions to allow" ),
    deny: z.array( z.string() ).optional().describe( "Permissions to deny" )
} );

export const CreateRoleSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    name: z.string().describe( "Role name" ),
    color: z.number().optional().describe( "Role color (decimal)" ),
    hoist: z.boolean().optional().describe( "Display separately" ),
    mentionable: z.boolean().optional().describe( "Allow mentions" ),
    permissions: z.array( z.string() ).optional().describe( "Permission flags" )
} );

export const EditRoleSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    roleId: z.string().describe( "Discord Role ID" ),
    name: z.string().optional().describe( "New name" ),
    color: z.number().optional().describe( "New color" ),
    hoist: z.boolean().optional().describe( "Display separately" ),
    mentionable: z.boolean().optional().describe( "Allow mentions" ),
    permissions: z.array( z.string() ).optional().describe( "Permission flags" )
} );

export const MemberRoleSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    userId: z.string().describe( "Discord User ID" ),
    roleId: z.string().describe( "Discord Role ID" )
} );

export const ModerationSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    userId: z.string().describe( "Discord User ID" ),
    reason: z.string().optional().describe( "Reason for action" )
} );

export const TimeoutSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    userId: z.string().describe( "Discord User ID" ),
    duration: z.number().describe( "Timeout duration in seconds" ),
    reason: z.string().optional().describe( "Reason for timeout" )
} );

export const BanSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    userId: z.string().describe( "Discord User ID" ),
    reason: z.string().optional().describe( "Reason for ban" ),
    deleteMessageDays: z.number().min( 0 ).max( 7 ).optional().describe( "Days of messages to delete" )
} );

export const WebhookSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    name: z.string().describe( "Webhook name" ),
    avatar: z.string().optional().describe( "Avatar URL" )
} );

export const WebhookMessageSchema = z.object( {
    webhookId: z.string().describe( "Webhook ID" ),
    webhookToken: z.string().describe( "Webhook token" ),
    content: z.string().optional().describe( "Message content" ),
    username: z.string().optional().describe( "Override username" ),
    avatarUrl: z.string().optional().describe( "Override avatar" ),
    embeds: z.array( z.object( {
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.number().optional()
    } ) ).optional().describe( "Embeds" )
} );

export const ThreadSchema = z.object( {
    channelId: z.string().describe( "Parent channel ID" ),
    name: z.string().describe( "Thread name" ),
    autoArchiveDuration: z.enum( [ "60", "1440", "4320", "10080" ] ).optional().describe( "Auto archive duration in minutes" ),
    messageId: z.string().optional().describe( "Message ID to create thread from" )
} );

export const BulkDeleteSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    messageIds: z.array( z.string() ).describe( "Array of message IDs to delete" )
} );

export const PinMessageSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    messageId: z.string().describe( "Message ID to pin/unpin" )
} );

export const GetMessagesSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    limit: z.number().min( 1 ).max( 100 ).optional().describe( "Number of messages (max 100)" ),
    before: z.string().optional().describe( "Get messages before this ID" ),
    after: z.string().optional().describe( "Get messages after this ID" ),
    around: z.string().optional().describe( "Get messages around this ID" )
} );

export const SearchMembersSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    query: z.string().describe( "Search query" ),
    limit: z.number().min( 1 ).max( 1000 ).optional().describe( "Max results" )
} );

export const GetAuditLogSchema = z.object( {
    guildId: z.string().describe( "Discord Guild ID" ),
    limit: z.number().min( 1 ).max( 100 ).optional().describe( "Number of entries" ),
    userId: z.string().optional().describe( "Filter by user" ),
    actionType: z.number().optional().describe( "Filter by action type" )
} );

export const InviteSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    maxAge: z.number().optional().describe( "Invite max age in seconds (0 = never)" ),
    maxUses: z.number().optional().describe( "Max uses (0 = unlimited)" ),
    temporary: z.boolean().optional().describe( "Temporary membership" ),
    unique: z.boolean().optional().describe( "Create unique invite" )
} );

export const SendFileSchema = z.object( {
    channelId: z.string().describe( "Discord Channel ID" ),
    url: z.string().optional().describe( "Public URL of the file to send" ),
    base64: z.string().optional().describe( "Base64 encoded file content" ),
    filename: z.string().describe( "Filename with extension (e.g., image.png)" ),
    content: z.string().optional().describe( "Optional message content to send with the file" ),
    spoiler: z.boolean().optional().describe( "Mark file as spoiler" )
} );
