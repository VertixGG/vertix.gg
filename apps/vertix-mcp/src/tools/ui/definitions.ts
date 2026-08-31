import type { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Read-only tools answer from the exported UI catalog (`exports/ui`), no bot process needed.
 * The `ui_send_*` tools go through IPC and require the bot to be running.
 */
export const uiReadOnlyToolDefinitions: Tool[] = [
    {
        name: "ui_list_adapters",
        description: "List Vertix UI adapters. An adapter is a ready-made interactive Discord dialog - embeds plus buttons, select menus and modals - that the bot knows how to render and react to",
        inputSchema: {
            type: "object",
            properties: {
                module: { type: "string", description: "Filter by module, e.g. 'VertixBot/UI-V3/Module'" },
                kind: { type: "string", description: "Filter by adapter kind: 'base', 'execution' or 'wizard'" },
                search: { type: "string", description: "Filter by adapter name substring" }
            }
        }
    },
    {
        name: "ui_get_adapter",
        description: "Get the full definition of one UI adapter: its embeds (title, description, color, image), its interactive elements (buttons, select menus with their labels and options), modals, execution steps and the channel types it supports",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "Adapter name, e.g. 'VertixBot/UI-General/WelcomeAdapter'" }
            },
            required: [ "name" ]
        }
    },
    {
        name: "ui_search",
        description: "Search the UI catalog by text and find which adapter renders it - matches adapter names, embed titles and descriptions, button labels and select menu placeholders",
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string", description: "Text to search for" },
                limit: { type: "number", description: "Max matches to return (default 20)" }
            },
            required: [ "query" ]
        }
    },
    {
        name: "ui_list_live_adapters",
        description: "List the UI adapters actually registered in the running bot process, with their instance type and supported channel types. Requires the bot to be running",
        inputSchema: {
            type: "object",
            properties: {}
        }
    }
];

export const uiToolDefinitions: Tool[] = [
    ...uiReadOnlyToolDefinitions,
    {
        name: "ui_send_adapter",
        description: "Send a Vertix UI adapter to a Discord channel. The bot builds the real interactive message - embeds plus working buttons and select menus - and keeps handling the interactions afterwards. Use ui_get_adapter first to see what the adapter renders and which args it takes",
        inputSchema: {
            type: "object",
            properties: {
                adapterName: { type: "string", description: "Adapter name, e.g. 'VertixBot/UI-General/WelcomeAdapter'" },
                channelId: { type: "string", description: "Target guild text or voice channel ID" },
                args: { type: "object", description: "Optional adapter args (UIArgs), passed to the adapter's start hook" }
            },
            required: [ "adapterName", "channelId" ]
        }
    },
    {
        name: "ui_send_adapter_to_user",
        description: "Send a Vertix UI adapter to a user's direct messages through the bot",
        inputSchema: {
            type: "object",
            properties: {
                adapterName: { type: "string", description: "Adapter name" },
                guildId: { type: "string", description: "Guild ID the UI belongs to, or 'direct-message'" },
                userId: { type: "string", description: "Target user ID" },
                args: { type: "object", description: "Optional adapter args (UIArgs)" }
            },
            required: [ "adapterName", "guildId", "userId" ]
        }
    },
    {
        name: "ui_create_adapter",
        description: "Create a NEW interactive Vertix UI at runtime from a JSON spec, and optionally post it right away. The bot turns the spec into a real adapter - an embed plus working buttons and select menus - registers it, and keeps handling clicks. Buttons and the select menu are optional: an embed on its own is a fine result or status panel. Clicks are recorded and readable with ui_get_interactions, and each element can carry a 'reply' text answered ephemerally to whoever clicked. Posting into a channel that already holds your panel rewrites that same message - new embed, new buttons - whatever the UI is named, so a multi-step conversation stays inside one message the user navigates instead of stacking a message per step. Use this for advanced conversation: polls, confirmations, menus, wizards-by-hand",
        inputSchema: {
            type: "object",
            properties: {
                spec: {
                    type: "object",
                    description: "The UI definition",
                    properties: {
                        name: { type: "string", description: "Short id, lowercase [a-z0-9-_], e.g. 'lunch-poll'. Also the handle for ui_get_interactions" },
                        title: { type: "string", description: "Embed title" },
                        description: { type: "string", description: "Embed description (markdown supported)" },
                        color: { type: "number", description: "Embed color as a decimal integer, e.g. 3369963" },
                        image: { type: "string", description: "Embed image URL" },
                        thumbnail: { type: "string", description: "Embed thumbnail URL" },
                        footer: { type: "string", description: "Embed footer text" },
                        channelTypes: {
                            type: "array",
                            description: "Allowed channel types, default ['GuildText','GuildVoice']",
                            items: { type: "string" }
                        },
                        requiredPermissions: { type: "string", description: "Decimal permissions bitfield the clicking member must hold, e.g. '8' for Administrator. Default: anyone can use it" },
                        buttons: {
                            type: "array",
                            description: "Up to 20 buttons, laid out 5 per row",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string", description: "Short id, lowercase [a-z0-9-_], unique within this UI" },
                                    label: { type: "string", description: "Button label, max 80 chars" },
                                    style: { type: "string", description: "primary | secondary | success | danger" },
                                    emoji: { type: "string", description: "Unicode emoji or <:name:id>" },
                                    reply: { type: "string", description: "Ephemeral reply on click. {user} and {values} are substituted" }
                                },
                                required: [ "id", "label" ]
                            }
                        },
                        select: {
                            type: "object",
                            description: "Optional string select menu, rendered on its own row",
                            properties: {
                                id: { type: "string", description: "Short id, lowercase [a-z0-9-_]" },
                                placeholder: { type: "string" },
                                minValues: { type: "number" },
                                maxValues: { type: "number" },
                                reply: { type: "string", description: "Ephemeral reply on select. {user} and {values} are substituted" },
                                options: {
                                    type: "array",
                                    description: "1-25 options",
                                    items: {
                                        type: "object",
                                        properties: {
                                            label: { type: "string" },
                                            value: { type: "string" },
                                            description: { type: "string" },
                                            emoji: { type: "string" }
                                        },
                                        required: [ "label", "value" ]
                                    }
                                }
                            },
                            required: [ "id", "options" ]
                        }
                    },
                    required: [ "name" ]
                },
                channelId: { type: "string", description: "Optional - post the UI to this channel immediately after creating it" }
            },
            required: [ "spec" ]
        }
    },
    {
        name: "ui_get_interactions",
        description: "Read what users did with the runtime-created UIs: which button was clicked or which values were selected, by whom and when. Poll this after posting a UI to continue the conversation based on the answer",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "Only interactions of this UI (the spec name used in ui_create_adapter)" },
                since: { type: "number", description: "Only interactions newer than this epoch-ms timestamp" },
                limit: { type: "number", description: "Max interactions to return (default 50)" }
            }
        }
    },
    {
        name: "ui_list_dynamic_adapters",
        description: "List the runtime-created UIs currently registered in the bot, with their element ids",
        inputSchema: {
            type: "object",
            properties: {}
        }
    },
    {
        name: "ui_delete_adapter",
        description: "Unregister a runtime-created UI. Messages already posted stop responding to clicks",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "The spec name used in ui_create_adapter" }
            },
            required: [ "name" ]
        }
    }
];

const readOnlyToolNames = new Set( uiReadOnlyToolDefinitions.map( ( tool ) => tool.name ) );

export function isReadOnlyUITool( name: string ): boolean {
    return readOnlyToolNames.has( name );
}
