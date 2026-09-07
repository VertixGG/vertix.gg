import { spawn } from "child_process";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import { MCPProvider } from "@vertix.gg/ai/src/providers/mcp-provider";

import { InteractiveMessageManager } from "@vertix.gg/ai/src/managers/interactive-message-manager";

import type { JsonObject, OllamaToolDefinition } from "@vertix.gg/ai/src/definitions/ollama-definitions";

const MAX_PURGE_COUNT = 100;

type LocalToolHandler = ( args: JsonObject ) => Promise<string>;

type LocalTool = {
    definition: OllamaToolDefinition;
    handler: LocalToolHandler;
    /** Withheld from everyone but the bot owner - never even listed to others. */
    ownerOnly?: boolean;
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

    /**
     * Owner-only tools are left out unless asked for, so nobody else's model
     * even sees them - and nobody else pays tokens for their schemas.
     */
    public getTools( includeOwnerOnly = false ): OllamaToolDefinition[] {
        return [ ...this.tools.values() ]
            .filter( ( tool ) => includeOwnerOnly || !tool.ownerOnly )
            .map( ( tool ) => tool.definition );
    }

    public isOwnerOnly( name: string ): boolean {
        return true === this.tools.get( name )?.ownerOnly;
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

        if ( AIConfig.$.isShellEnabled() ) {
            this.tools.set( "run_shell_command", {
                ownerOnly: true,
                definition: {
                    type: "function",
                    function: {
                        name: "run_shell_command",
                        description:
                            "Run a shell command on the machine hosting this bot and return its " +
                            "output. Only the bot owner has this. A command is killed after a " +
                            "timeout and long output is clipped, so prefer targeted commands " +
                            "over ones that stream, page, or wait for input.",
                        parameters: {
                            type: "object",
                            properties: {
                                command: {
                                    type: "string",
                                    description: "The command line, exactly as it would be typed in a terminal"
                                }
                            },
                            required: [ "command" ]
                        }
                    }
                },
                handler: ( args ) => this.runShellCommand( args )
            } );
        }
    }

    /**
     * Runs the owner's command in a child that is killed on timeout, with the
     * output clipped both while it streams and when it is returned.
     *
     * The child gets a minimal environment on purpose. Inheriting this process's
     * would hand the shell every value in .env - a plain `env` would print the
     * Discord token straight into the channel.
     */
    private runShellCommand( args: JsonObject ): Promise<string> {
        const command = args.command;

        if ( "string" !== typeof command || !command.trim().length ) {
            return Promise.resolve( "Tool error: command is required and must be a non-empty string." );
        }

        const timeoutMs = AIConfig.$.getShellTimeoutMs();
        const maxChars = AIConfig.$.getShellMaxOutputChars();
        const cwd = AIConfig.$.getShellCwd();

        this.logger.log( this.runShellCommand, `Running for the owner in '${ cwd }': ${ command }` );

        return new Promise( ( resolve ) => {
            const child = spawn( "/bin/zsh", [ "-c", command ], {
                cwd,
                env: {
                    PATH: process.env.PATH ?? "/usr/bin:/bin",
                    HOME: process.env.HOME ?? "",
                    USER: process.env.USER ?? "",
                    SHELL: "/bin/zsh",
                    LANG: process.env.LANG ?? "en_US.UTF-8",
                    TERM: "dumb"
                }
            } );

            let output = "";
            let settled = false;

            const terminate = () => {
                // ONLY ever signal the spawned child, and only when its pid is a
                // real, distinct process. `ps aux` (large output -> overflow ->
                // terminate) once took the whole bot down with SIGKILL: an
                // earlier version killed by a raw parent-pid via `pkill -P`,
                // which under `bun --watch` reached this process itself. No raw
                // pid arithmetic here, and never a pid that is this process.
                if ( !child.pid || child.pid <= 1 || child.pid === process.pid ) {
                    return;
                }

                try {
                    child.kill( "SIGKILL" );
                } catch {
                    // already gone
                }
            };

            /**
             * Resolves exactly once. Called by the timeout and overflow directly
             * rather than waiting for `close`: a child still holding the stdout
             * pipe (a backgrounded `sleep`) can keep `close` from firing long
             * after the command should have been abandoned.
             *
             * `kill` is true only for those forced paths - a clean `close` has
             * nothing left to kill, and running the synchronous tree-walk from
             * inside the close handler stalls the event loop.
             */
            const settle = ( status: string, kill: boolean ) => {
                if ( settled ) {
                    return;
                }

                settled = true;
                clearTimeout( timer );

                if ( kill ) {
                    terminate();
                }

                const clipped = output.length > maxChars
                    ? `${ output.slice( 0, maxChars ) }\n\n[output clipped: ${ output.length }+ chars, showing the first ${ maxChars }]`
                    : output;

                resolve( `$ ${ command }\n${ clipped.trim() }\n\n(${ status })` );
            };

            const append = ( chunk: Buffer ) => {
                if ( settled ) {
                    return;
                }

                output += chunk.toString();

                // Stop well before the clip point: a runaway `yes` would fill
                // memory for the whole timeout otherwise.
                if ( output.length > maxChars * 2 ) {
                    settle( "killed: output exceeded the limit", true );
                }
            };

            child.stdout?.on( "data", append );
            child.stderr?.on( "data", append );

            const timer = setTimeout( () => settle( `killed after the ${ timeoutMs }ms timeout`, true ), timeoutMs );

            child.on( "error", ( error ) => {
                if ( settled ) {
                    return;
                }

                settled = true;
                clearTimeout( timer );

                resolve( `Tool error: could not start the command - ${ error.message }` );
            } );

            child.on( "close", ( code ) => settle( `exit code ${ code ?? "unknown" }`, false ) );
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
