import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { MCPProvider } from "@vertix.gg/ai/src/providers/mcp-provider";

import { InteractiveMessageManager } from "@vertix.gg/ai/src/managers/interactive-message-manager";

import type { JsonObject, OllamaToolDefinition } from "@vertix.gg/ai/src/definitions/ollama-definitions";

const MAX_PURGE_COUNT = 100;

type LocalToolHandler = ( args: JsonObject ) => Promise<string>;

type LocalTool = {
    definition: OllamaToolDefinition;
    handler: LocalToolHandler;
};

/**
 * Tools this app implements itself, alongside the ones vertix-mcp exposes.
 *
 * These exist where a task is trivial in code but unreliable for a model to
 * assemble. Deleting a channel's messages is the motivating case: the MCP tool
 * takes an explicit array of message ids, so the model would have to read ~5K
 * tokens of JSON and reproduce 99 exact snowflakes in one tool argument. It
 * gives up and narrates instead. One `count` parameter is something it can
 * always get right.
 */
export class LocalToolsProvider extends InitializeBase {
    private static instance: LocalToolsProvider;

    private readonly tools = new Map<string, LocalTool>();

    public static getName() {
        return "VertixAI/Providers/LocalToolsProvider";
    }

    public static getInstance(): LocalToolsProvider {
        if ( !LocalToolsProvider.instance ) {
            LocalToolsProvider.instance = new LocalToolsProvider();
            LocalToolsProvider.instance.register();
        }

        return LocalToolsProvider.instance;
    }

    public static get $() {
        return LocalToolsProvider.getInstance();
    }

    public getTools(): OllamaToolDefinition[] {
        return [ ...this.tools.values() ].map( ( tool ) => tool.definition );
    }

    public has( name: string ): boolean {
        return this.tools.has( name );
    }

    public async call( name: string, args: JsonObject ): Promise<string> {
        const tool = this.tools.get( name );

        if ( !tool ) {
            throw new Error( `Unknown local tool: '${ name }'` );
        }

        return await tool.handler( args );
    }

    private register(): void {
        this.tools.set( "purge_channel_messages", {
            definition: {
                type: "function",
                function: {
                    name: "purge_channel_messages",
                    description:
                        "Delete the most recent messages in a channel. Use this instead of " +
                        "discord_get_messages plus discord_bulk_delete_messages - it finds the " +
                        "messages and deletes them in one step. Note: Discord refuses to " +
                        "BULK DELETE messages older than 14 days. That limit applies to " +
                        "deletion only - reading messages has no age limit at all.",
                    parameters: {
                        type: "object",
                        properties: {
                            channelId: { type: "string", description: "Discord Channel ID" },
                            count: {
                                type: "number",
                                description: `How many recent messages to delete (1-${ MAX_PURGE_COUNT })`
                            }
                        },
                        required: [ "channelId", "count" ]
                    }
                }
            },
            handler: ( args ) => this.purgeChannelMessages( args )
        } );

        this.tools.set( "send_interactive_message", {
            definition: {
                type: "function",
                function: {
                    name: "send_interactive_message",
                    description:
                        "Post an embed with working buttons, as this bot. Use this whenever " +
                        "someone asks for a UI, a panel, buttons, or an interactive message. " +
                        "Each button needs the text to reply with when it is clicked; that " +
                        "reply is shown only to the person who clicked. Maximum 5 buttons.",
                    parameters: {
                        type: "object",
                        properties: {
                            channelId: { type: "string", description: "Discord Channel ID" },
                            title: { type: "string", description: "Embed title" },
                            description: { type: "string", description: "Embed body" },
                            color: { type: "number", description: "Embed colour as a decimal integer" },
                            footer: { type: "string", description: "Small text under the embed" },
                            fields: {
                                type: "array",
                                description: "Named sections inside the embed",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        value: { type: "string" },
                                        inline: { type: "boolean" }
                                    },
                                    required: [ "name", "value" ]
                                }
                            },
                            buttons: {
                                type: "array",
                                description: "Up to 5 buttons",
                                items: {
                                    type: "object",
                                    properties: {
                                        label: { type: "string", description: "Button text" },
                                        response: { type: "string", description: "Reply shown when clicked" },
                                        style: { type: "string", enum: [ "primary", "secondary", "success", "danger" ] },
                                        emoji: { type: "string" }
                                    },
                                    required: [ "label", "response" ]
                                }
                            }
                        },
                        required: [ "channelId", "description" ]
                    }
                }
            },
            handler: ( args ) => this.sendInteractiveMessage( args )
        } );
    }

    private async sendInteractiveMessage( args: JsonObject ): Promise<string> {
        const channelId = args.channelId;

        if ( "string" !== typeof channelId ) {
            return "Tool error: channelId is required and must be a string.";
        }

        const buttons = Array.isArray( args.buttons )
            ? args.buttons.flatMap( ( entry ) =>
                entry && "object" === typeof entry && !Array.isArray( entry )
                    && "string" === typeof entry.label && "string" === typeof entry.response
                    ? [ {
                        label: entry.label,
                        response: entry.response,
                        style: "string" === typeof entry.style ? entry.style : undefined,
                        emoji: "string" === typeof entry.emoji ? entry.emoji : undefined
                    } ]
                    : [] )
            : [];

        const fields = Array.isArray( args.fields )
            ? args.fields.flatMap( ( entry ) =>
                entry && "object" === typeof entry && !Array.isArray( entry )
                    && "string" === typeof entry.name && "string" === typeof entry.value
                    ? [ { name: entry.name, value: entry.value, inline: true === entry.inline } ]
                    : [] )
            : [];

        return await InteractiveMessageManager.$.send( channelId, {
            title: "string" === typeof args.title ? args.title : undefined,
            description: "string" === typeof args.description ? args.description : undefined,
            color: "number" === typeof args.color ? args.color : undefined,
            footer: "string" === typeof args.footer ? args.footer : undefined,
            fields
        }, buttons );
    }

    private async purgeChannelMessages( args: JsonObject ): Promise<string> {
        const channelId = args.channelId;
        const requested = args.count;

        if ( "string" !== typeof channelId ) {
            return "Tool error: channelId is required and must be a string.";
        }

        const count = Math.min(
            "number" === typeof requested ? requested : MAX_PURGE_COUNT,
            MAX_PURGE_COUNT
        );

        if ( count < 1 ) {
            return "Tool error: count must be at least 1.";
        }

        const listed = await MCPProvider.$.callTool( "discord_get_messages", { channelId, limit: count } );

        // Surface the underlying failure rather than reporting "no messages" -
        // the model cannot tell an empty channel from an unreachable one, and
        // will invent an explanation for whichever it is given.
        if ( listed.startsWith( "Tool error:" ) ) {
            return `Could not read channel ${ channelId }, so nothing was deleted. ${ listed }`;
        }

        const ids = this.extractMessageIds( listed );

        if ( !ids.length ) {
            return `Channel ${ channelId } has no messages to delete; nothing was deleted.`;
        }

        const result = await MCPProvider.$.callTool( "discord_bulk_delete_messages", {
            channelId,
            messageIds: ids
        } );

        if ( result.startsWith( "Tool error:" ) ) {
            this.logger.warn( this.purgeChannelMessages, `Bulk delete failed for '${ channelId }': ${ result }` );

            return `Found ${ ids.length } message(s) but the delete failed, so nothing was removed. ${ result }`;
        }

        this.logger.log( this.purgeChannelMessages, `Purged '${ ids.length }' messages from '${ channelId }'` );

        return `Deleted ${ ids.length } message(s) from channel ${ channelId }.`;
    }

    /**
     * The MCP tool returns JSON text; ids are read from it rather than re-fetched.
     *
     * `discord_get_messages` wraps its rows as `{ channelId, messages, count }`,
     * but a bare array is accepted too so a shape change upstream degrades to
     * "found nothing" rather than a crash.
     */
    private extractMessageIds( payload: string ): string[] {
        try {
            const parsed: unknown = JSON.parse( payload );

            const rows = Array.isArray( parsed )
                ? parsed
                : ( parsed && "object" === typeof parsed && "messages" in parsed && Array.isArray( parsed.messages )
                    ? parsed.messages
                    : [] );

            if ( !rows.length ) {
                this.logger.warn(
                    this.extractMessageIds,
                    `No message rows found in the MCP payload (${ payload.length } chars)`
                );

                return [];
            }

            return rows
                .map( ( entry: unknown ) =>
                    entry && "object" === typeof entry && "id" in entry && "string" === typeof entry.id
                        ? entry.id
                        : null
                )
                .filter( ( id: string | null ): id is string => null !== id );
        } catch {
            this.logger.warn( this.extractMessageIds, "Could not parse the message list returned by MCP" );

            return [];
        }
    }
}

export default LocalToolsProvider;
