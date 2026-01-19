import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const discordReadOnlyToolDefinitions: Tool[] = [
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
    },
    {
        name: "discord_send_message",
        description: "Send a message to a Discord channel (reply only, no management)",
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
        name: "discord_send_file",
        description: "Send a file to a Discord channel. Provide either a public URL or base64 encoded content.",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord Channel ID" },
                url: { type: "string", description: "Public URL of the file to send" },
                base64: { type: "string", description: "Base64 encoded file content" },
                filename: { type: "string", description: "Filename with extension (e.g., image.png)" },
                content: { type: "string", description: "Optional message content to send with the file" },
                spoiler: { type: "boolean", description: "Mark file as spoiler" }
            },
            required: [ "channelId", "filename" ]
        }
    }
];

export const READ_ONLY_TOOL_NAMES = new Set( discordReadOnlyToolDefinitions.map( t => t.name ) );

export function isReadOnlyTool( toolName: string ): boolean {
    return READ_ONLY_TOOL_NAMES.has( toolName );
}
