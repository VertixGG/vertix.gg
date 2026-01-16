import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const discordToolDefinitions: Tool[] = [
    {
        name: "discord_get_guild",
        description: "Get detailed information about a Discord guild/server",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_get_guild_members",
        description: "Get members of a guild with pagination",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                limit: { type: "number", description: "Max members to return (1-1000)" },
                after: { type: "string", description: "Get members after this user ID" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_search_members",
        description: "Search guild members by username",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                query: { type: "string", description: "Search query" },
                limit: { type: "number", description: "Max results (1-1000)" }
            },
            required: [ "guildId", "query" ]
        }
    },
    {
        name: "discord_get_member",
        description: "Get detailed information about a guild member",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" }
            },
            required: [ "guildId", "userId" ]
        }
    },
    {
        name: "discord_get_user",
        description: "Get information about a Discord user",
        inputSchema: {
            type: "object",
            properties: {
                userId: { type: "string", description: "Discord User ID" }
            },
            required: [ "userId" ]
        }
    },

    {
        name: "discord_get_channels",
        description: "Get all channels in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_get_channel",
        description: "Get detailed information about a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_create_channel",
        description: "Create a new channel in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                name: { type: "string", description: "Channel name" },
                type: { type: "string", enum: [ "text", "voice", "category", "announcement", "stage", "forum" ], description: "Channel type" },
                parentId: { type: "string", description: "Parent category ID" },
                topic: { type: "string", description: "Channel topic" },
                nsfw: { type: "boolean", description: "NSFW channel" },
                rateLimitPerUser: { type: "number", description: "Slowmode in seconds" },
                userLimit: { type: "number", description: "Voice channel user limit" },
                bitrate: { type: "number", description: "Voice channel bitrate" }
            },
            required: [ "guildId", "name", "type" ]
        }
    },
    {
        name: "discord_edit_channel",
        description: "Edit a channel's settings",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                name: { type: "string", description: "New name" },
                topic: { type: "string", description: "New topic" },
                nsfw: { type: "boolean", description: "NSFW setting" },
                rateLimitPerUser: { type: "number", description: "Slowmode" },
                parentId: { type: "string", description: "New parent category" },
                position: { type: "number", description: "New position" }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_delete_channel",
        description: "Delete a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_set_channel_permissions",
        description: "Set permission overwrites for a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                targetId: { type: "string", description: "User or Role ID" },
                targetType: { type: "string", enum: [ "user", "role" ], description: "Target type" },
                allow: { type: "array", items: { type: "string" }, description: "Permissions to allow" },
                deny: { type: "array", items: { type: "string" }, description: "Permissions to deny" }
            },
            required: [ "channelId", "targetId", "targetType" ]
        }
    },

    {
        name: "discord_get_messages",
        description: "Get messages from a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                limit: { type: "number", description: "Number of messages (max 100)" },
                before: { type: "string", description: "Get messages before this ID" },
                after: { type: "string", description: "Get messages after this ID" },
                around: { type: "string", description: "Get messages around this ID" }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_get_message",
        description: "Get a specific message by ID",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Discord Message ID" }
            },
            required: [ "channelId", "messageId" ]
        }
    },
    {
        name: "discord_send_message",
        description: "Send a message to a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                content: { type: "string", description: "Message content" },
                embeds: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            color: { type: "number" },
                            fields: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        value: { type: "string" },
                                        inline: { type: "boolean" }
                                    }
                                }
                            },
                            footer: {
                                type: "object",
                                properties: {
                                    text: { type: "string" },
                                    iconUrl: { type: "string" }
                                }
                            },
                            thumbnail: { type: "object", properties: { url: { type: "string" } } },
                            image: { type: "object", properties: { url: { type: "string" } } }
                        }
                    },
                    description: "Embed objects"
                }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_edit_message",
        description: "Edit an existing message",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Discord Message ID" },
                content: { type: "string", description: "New content" },
                embeds: { type: "array", description: "New embeds" }
            },
            required: [ "channelId", "messageId" ]
        }
    },
    {
        name: "discord_delete_message",
        description: "Delete a message",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Discord Message ID" }
            },
            required: [ "channelId", "messageId" ]
        }
    },
    {
        name: "discord_bulk_delete_messages",
        description: "Delete multiple messages at once (2-100 messages, max 14 days old)",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageIds: { type: "array", items: { type: "string" }, description: "Array of message IDs" }
            },
            required: [ "channelId", "messageIds" ]
        }
    },
    {
        name: "discord_pin_message",
        description: "Pin a message in a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Message ID to pin" }
            },
            required: [ "channelId", "messageId" ]
        }
    },
    {
        name: "discord_unpin_message",
        description: "Unpin a message from a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Message ID to unpin" }
            },
            required: [ "channelId", "messageId" ]
        }
    },
    {
        name: "discord_get_pinned_messages",
        description: "Get all pinned messages in a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" }
            },
            required: [ "channelId" ]
        }
    },

    {
        name: "discord_add_reaction",
        description: "Add a reaction to a message",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Discord Message ID" },
                emoji: { type: "string", description: "Emoji (unicode or custom emoji ID)" }
            },
            required: [ "channelId", "messageId", "emoji" ]
        }
    },
    {
        name: "discord_remove_reaction",
        description: "Remove a reaction from a message",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Discord Message ID" },
                emoji: { type: "string", description: "Emoji to remove" },
                userId: { type: "string", description: "User ID (optional, defaults to bot)" }
            },
            required: [ "channelId", "messageId", "emoji" ]
        }
    },
    {
        name: "discord_get_reactions",
        description: "Get users who reacted with a specific emoji",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Discord Message ID" },
                emoji: { type: "string", description: "Emoji to check" },
                limit: { type: "number", description: "Max users to return" }
            },
            required: [ "channelId", "messageId", "emoji" ]
        }
    },
    {
        name: "discord_clear_reactions",
        description: "Clear all reactions from a message",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                messageId: { type: "string", description: "Discord Message ID" },
                emoji: { type: "string", description: "Specific emoji to clear (optional)" }
            },
            required: [ "channelId", "messageId" ]
        }
    },

    {
        name: "discord_get_roles",
        description: "Get all roles in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_get_role",
        description: "Get information about a specific role",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                roleId: { type: "string", description: "Discord Role ID" }
            },
            required: [ "guildId", "roleId" ]
        }
    },
    {
        name: "discord_create_role",
        description: "Create a new role in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                name: { type: "string", description: "Role name" },
                color: { type: "number", description: "Role color (decimal)" },
                hoist: { type: "boolean", description: "Display separately" },
                mentionable: { type: "boolean", description: "Allow mentions" },
                permissions: { type: "array", items: { type: "string" }, description: "Permission flags" }
            },
            required: [ "guildId", "name" ]
        }
    },
    {
        name: "discord_edit_role",
        description: "Edit a role's settings",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                roleId: { type: "string", description: "Discord Role ID" },
                name: { type: "string", description: "New name" },
                color: { type: "number", description: "New color" },
                hoist: { type: "boolean", description: "Display separately" },
                mentionable: { type: "boolean", description: "Allow mentions" },
                permissions: { type: "array", items: { type: "string" }, description: "Permission flags" }
            },
            required: [ "guildId", "roleId" ]
        }
    },
    {
        name: "discord_delete_role",
        description: "Delete a role from a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                roleId: { type: "string", description: "Discord Role ID" }
            },
            required: [ "guildId", "roleId" ]
        }
    },
    {
        name: "discord_add_role_to_member",
        description: "Add a role to a guild member",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                roleId: { type: "string", description: "Discord Role ID" }
            },
            required: [ "guildId", "userId", "roleId" ]
        }
    },
    {
        name: "discord_remove_role_from_member",
        description: "Remove a role from a guild member",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                roleId: { type: "string", description: "Discord Role ID" }
            },
            required: [ "guildId", "userId", "roleId" ]
        }
    },

    {
        name: "discord_kick_member",
        description: "Kick a member from a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                reason: { type: "string", description: "Reason for kick" }
            },
            required: [ "guildId", "userId" ]
        }
    },
    {
        name: "discord_ban_member",
        description: "Ban a member from a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                reason: { type: "string", description: "Reason for ban" },
                deleteMessageDays: { type: "number", description: "Days of messages to delete (0-7)" }
            },
            required: [ "guildId", "userId" ]
        }
    },
    {
        name: "discord_unban_member",
        description: "Remove a ban from a user",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" }
            },
            required: [ "guildId", "userId" ]
        }
    },
    {
        name: "discord_get_bans",
        description: "Get list of banned users in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                limit: { type: "number", description: "Max bans to return" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_timeout_member",
        description: "Timeout a member (communication disabled)",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                duration: { type: "number", description: "Duration in seconds" },
                reason: { type: "string", description: "Reason for timeout" }
            },
            required: [ "guildId", "userId", "duration" ]
        }
    },
    {
        name: "discord_remove_timeout",
        description: "Remove timeout from a member",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" }
            },
            required: [ "guildId", "userId" ]
        }
    },

    {
        name: "discord_get_voice_states",
        description: "Get current voice states in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_move_member_voice",
        description: "Move a member to a different voice channel",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                channelId: { type: "string", description: "Target voice channel ID (null to disconnect)" }
            },
            required: [ "guildId", "userId" ]
        }
    },
    {
        name: "discord_set_voice_mute",
        description: "Server mute a member",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                mute: { type: "boolean", description: "Mute state" }
            },
            required: [ "guildId", "userId", "mute" ]
        }
    },
    {
        name: "discord_set_voice_deaf",
        description: "Server deafen a member",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                userId: { type: "string", description: "Discord User ID" },
                deaf: { type: "boolean", description: "Deafen state" }
            },
            required: [ "guildId", "userId", "deaf" ]
        }
    },

    {
        name: "discord_create_thread",
        description: "Create a new thread",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Parent channel ID" },
                name: { type: "string", description: "Thread name" },
                autoArchiveDuration: { type: "string", enum: [ "60", "1440", "4320", "10080" ], description: "Auto archive (minutes)" },
                messageId: { type: "string", description: "Message ID to create thread from" }
            },
            required: [ "channelId", "name" ]
        }
    },
    {
        name: "discord_get_threads",
        description: "Get active threads in a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Parent channel ID" }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_join_thread",
        description: "Join a thread",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread channel ID" }
            },
            required: [ "threadId" ]
        }
    },
    {
        name: "discord_leave_thread",
        description: "Leave a thread",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread channel ID" }
            },
            required: [ "threadId" ]
        }
    },
    {
        name: "discord_archive_thread",
        description: "Archive a thread",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread channel ID" },
                locked: { type: "boolean", description: "Also lock the thread" }
            },
            required: [ "threadId" ]
        }
    },

    {
        name: "discord_get_webhooks",
        description: "Get webhooks for a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_create_webhook",
        description: "Create a webhook for a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                name: { type: "string", description: "Webhook name" },
                avatar: { type: "string", description: "Avatar URL" }
            },
            required: [ "channelId", "name" ]
        }
    },
    {
        name: "discord_delete_webhook",
        description: "Delete a webhook",
        inputSchema: {
            type: "object",
            properties: {
                webhookId: { type: "string", description: "Webhook ID" }
            },
            required: [ "webhookId" ]
        }
    },
    {
        name: "discord_send_webhook_message",
        description: "Send a message via webhook",
        inputSchema: {
            type: "object",
            properties: {
                webhookId: { type: "string", description: "Webhook ID" },
                webhookToken: { type: "string", description: "Webhook token" },
                content: { type: "string", description: "Message content" },
                username: { type: "string", description: "Override username" },
                avatarUrl: { type: "string", description: "Override avatar" },
                embeds: { type: "array", description: "Embed objects" }
            },
            required: [ "webhookId", "webhookToken" ]
        }
    },

    {
        name: "discord_create_invite",
        description: "Create an invite to a channel",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                maxAge: { type: "number", description: "Max age in seconds (0 = never)" },
                maxUses: { type: "number", description: "Max uses (0 = unlimited)" },
                temporary: { type: "boolean", description: "Temporary membership" },
                unique: { type: "boolean", description: "Create unique invite" }
            },
            required: [ "channelId" ]
        }
    },
    {
        name: "discord_get_invites",
        description: "Get all invites for a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_delete_invite",
        description: "Delete an invite",
        inputSchema: {
            type: "object",
            properties: {
                inviteCode: { type: "string", description: "Invite code" }
            },
            required: [ "inviteCode" ]
        }
    },

    {
        name: "discord_get_audit_log",
        description: "Get the audit log for a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" },
                limit: { type: "number", description: "Number of entries (1-100)" },
                userId: { type: "string", description: "Filter by user" },
                actionType: { type: "number", description: "Filter by action type" }
            },
            required: [ "guildId" ]
        }
    },

    {
        name: "discord_get_emojis",
        description: "Get all custom emojis in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" }
            },
            required: [ "guildId" ]
        }
    },
    {
        name: "discord_get_stickers",
        description: "Get all stickers in a guild",
        inputSchema: {
            type: "object",
            properties: {
                guildId: { type: "string", description: "Discord Guild ID" }
            },
            required: [ "guildId" ]
        }
    }
];
