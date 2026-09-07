import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { AIGuildDataManager } from "@vertix.gg/ai/src/managers/ai-guild-data-manager";

import { PromptManager } from "@vertix.gg/ai/src/managers/prompt-manager";
import { DestructiveActionManager } from "@vertix.gg/ai/src/managers/destructive-action-manager";

import { isDestructiveTool } from "@vertix.gg/ai/src/definitions/destructive-tool-definitions";
import { isExplicitConfirmation } from "@vertix.gg/ai/src/definitions/confirmation-definitions";

import { PROMPT_NAMES } from "@vertix.gg/ai/src/definitions/prompt-definitions";

import { OllamaProvider } from "@vertix.gg/ai/src/providers/ollama-provider";
import { MCPProvider } from "@vertix.gg/ai/src/providers/mcp-provider";
import { LocalToolsProvider } from "@vertix.gg/ai/src/providers/local-tools-provider";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import { TRIGGER_EVENT_DEFINITIONS } from "@vertix.gg/ai/src/definitions/trigger-event-definitions";

import type { JsonObject, OllamaMessage } from "@vertix.gg/ai/src/definitions/ollama-definitions";
import type { E_AI_TRIGGER_EVENT } from "@vertix.gg/prisma/._ai-client-internal";

/** Discord rejects anything longer, so replies are split rather than truncated. */
const DISCORD_MESSAGE_LIMIT = 2000;

/**
 * Sentinel returned when the model narrated an action twice instead of calling
 * a tool. Not shown to anyone - it triggers one retry with history removed.
 */
const NARRATION_GAVE_UP = "\u0000narration-gave-up";

/**
 * A yes/no decision plus its reason.
 *
 * Was 64, which truncated the JSON mid-string - the parse then failed and the
 * bot silently stayed quiet, which looks exactly like being ignored.
 */
const DECISION_MAX_TOKENS = 200;

/** How much conversation the gate sees - enough to resolve "yes" and "do it". */
const DECISION_HISTORY_TURNS = 6;

/**
 * Phrasings that mean the model offered to look something up instead of doing
 * it. Reading is free and reversible, so an offer is never the right answer.
 */
/**
 * Phrasings that assert an action is under way or finished.
 *
 * If the model writes one of these without having called a tool, nothing
 * happened - it described the action instead of taking it, which reads to the
 * user as the bot lying.
 */
const UNBACKED_ACTION_PATTERNS = [
    /\bi'?\s*(ll|m|am|will|ve|have)\b[^.!?]{0,40}\b(proceed|delet|remov|purg|clear|ban|kick|renam|edit)/i,
    /\bproceed(ing)?\b/i,
    /\b(deleting|removing|purging|clearing|banning|kicking)\b/i,
    /\b(done|completed|executed)\b[^.!?]{0,25}(deletion|removal|purge|cleanup)/i
];

const UNFULFILLED_OFFER_PATTERNS = [
    /would you like me to/i,
    /want me to (pull|fetch|check|count|look|get|retrieve)/i,
    /shall i (pull|fetch|check|count|look|get|retrieve)/i,
    /if you.{0,3}d like,? i (can|could)/i,
    /let me know if you.{0,3}d like me to/i,
    /i can (pull|fetch|retrieve|count) .{0,60}\?/i
];

const DECISION_SCHEMA = {
    type: "object",
    properties: {
        respond: { type: "boolean" },
        reason: { type: "string" }
    },
    required: [ "respond", "reason" ]
};

export type ReplyUsage = {
    /** Tokens the model read: prompt, history, tool schemas and tool results. */
    promptTokens: number;
    /** Tokens the model wrote, summed across every tool-loop iteration. */
    outputTokens: number;
    /** The configured window these are measured against. */
    contextLimit: number;
    /** How many tools were actually invoked answering this. */
    toolCalls: number;
};

export type AIReply = {
    content: string;
    usage: ReplyUsage;
};

export type TriggerContext = {
    guildId: string;
    event: E_AI_TRIGGER_EVENT;
    /** What happened, in plain language - this is what the model actually reads. */
    summary: string;
    /** The bot's own display name, so it can recognise being addressed by it. */
    botName: string;
    /** The person's message verbatim, for confirmation matching. */
    rawMessage?: string;
    /** Prior channel messages, oldest first. Empty for events with no channel. */
    history?: OllamaMessage[];
    /**
     * Where this happened. Every Discord tool takes ids, and the model cannot
     * infer them from a channel name - without these it invents them.
     */
    location: {
        guildName: string;
        channelId: string;
        channelName: string;
        userId: string;
        userName: string;
    };
};

/**
 * Turns a Discord event into a model turn.
 *
 * Owns the prompt assembly so every trigger reaches the model the same way: the
 * guild's system prompt, then a description of what happened.
 */
export class AIService extends InitializeBase {
    private static instance: AIService;

    public static getName() {
        return "VertixAI/Services/AIService";
    }

    public static getInstance(): AIService {
        if ( !AIService.instance ) {
            AIService.instance = new AIService();
        }

        return AIService.instance;
    }

    public static get $() {
        return AIService.getInstance();
    }

    /**
     * Asks the model whether a message is even meant for it, before any typing
     * indicator or full generation.
     *
     * Without this, a watched channel gets a reply to every message - including
     * ones addressed to other bots. Fails closed: an unparseable or errored
     * decision means stay quiet.
     */
    public async shouldRespond( context: TriggerContext ): Promise<boolean> {
        try {
            const response = await OllamaProvider.$.chat( {
                messages: [
                    { role: "system", content: PromptManager.$.get( PROMPT_NAMES.Decision, { botName: context.botName } ) },
                    // The gate needs the conversation, not just the line: "yes"
                    // is only meaningful next to the question that prompted it.
                    ...this.getRecentHistory( context ),
                    { role: "user", content: this.buildUserContent( context ) }
                ],
                format: DECISION_SCHEMA,
                numPredict: DECISION_MAX_TOKENS
            } );

            const raw = response.message.content;

            const decision = this.parseDecision( raw );

            if ( !decision ) {
                // Truncated or malformed JSON. The `respond` field comes first, so
                // it is usually still readable - recovering it beats staying silent.
                const salvaged = /"respond"\s*:\s*(true|false)/i.exec( raw );

                this.logger.warn( this.shouldRespond, `Decision JSON unparseable; salvaged: '${ salvaged?.[ 1 ] ?? "none" }'` );

                return "true" === salvaged?.[ 1 ]?.toLowerCase();
            }

            this.logger.debug(
                this.shouldRespond,
                `Decision for '${ context.event }': respond='${ decision.respond }' reason='${ decision.reason ?? "" }'`
            );

            return true === decision.respond;
        } catch( error ) {
            this.logger.warn( this.shouldRespond, `Decision failed, staying quiet - ${ String( error ) }` );

            return false;
        }
    }

    /**
     * Runs an open proposal when the person's own words agreed to it.
     *
     * Returns a line describing what happened, for the model to report - or null
     * when there is nothing pending or the message was not a plain agreement.
     */
    private async executeConfirmedAction( context: TriggerContext ): Promise<string | null> {
        const userId = context.location.userId;

        const pending = await DestructiveActionManager.$.getPending( context.guildId, userId );

        const confirmed = isExplicitConfirmation( context.rawMessage ?? "" );

        if ( !pending ) {
            if ( confirmed ) {
                // They agreed to something that is no longer on offer - expired,
                // already run, or proposed before a restart. Saying so beats
                // letting the model invent what it thinks was agreed.
                this.logger.warn(
                    this.executeConfirmedAction,
                    "Confirmation received with no pending action"
                );

                return [
                    "The user just confirmed, but there is NO pending action - it expired or was already done.",
                    "Nothing has been performed.",
                    "Tell them plainly that there is nothing waiting, and ask them to state the request again.",
                    "Do not guess what they meant and do not claim anything was done."
                ].join( "\n" );
            }

            return null;
        }

        if ( !confirmed ) {
            return null;
        }

        const args = this.parseArgs( pending.argsJson );

        if ( !args ) {
            return null;
        }

        await DestructiveActionManager.$.clear( context.guildId, userId );

        this.logger.log(
            this.executeConfirmedAction,
            `Confirmation accepted - executing '${ pending.toolName }' directly`
        );

        const result = await this.callTool( pending.toolName, args );

        return [
            `The user confirmed, so '${ pending.toolName }' has ALREADY BEEN EXECUTED.`,
            `Result: ${ result }`,
            "",
            "Report this result to them. Do not call the tool again and do not ask for confirmation."
        ].join( "\n" );
    }

    private parseArgs( argsJson: string ): JsonObject | null {
        try {
            const parsed: unknown = JSON.parse( argsJson );

            return parsed && "object" === typeof parsed && !Array.isArray( parsed )
                ? parsed as JsonObject
                : null;
        } catch {
            return null;
        }
    }

    /**
     * The tail of the conversation, for the decision gate only.
     *
     * Full history would make every gate call expensive; the last few turns are
     * enough to tell a reply-to-the-bot from unrelated chatter.
     */
    private getRecentHistory( context: TriggerContext ): OllamaMessage[] {
        return ( context.history ?? [] ).slice( -DECISION_HISTORY_TURNS );
    }

    public async respondTo( context: TriggerContext ): Promise<AIReply | null> {
        const systemPrompt = await AIGuildDataManager.$.getSystemPrompt( context.guildId );

        const messages: OllamaMessage[] = [
            { role: "system", content: `${ PromptManager.$.get( PROMPT_NAMES.IdentityPreamble, { botName: context.botName } ) }\n\n${ systemPrompt }` },
            { role: "system", content: this.buildLocationBlock( context ) },
            ...( context.history ?? [] ),
            ...( context.history?.length
                ? [ { role: "system" as const, content: PromptManager.$.get( PROMPT_NAMES.GroundingReminder, { botName: context.botName } ) } ]
                : [] ),
            // Last, on purpose. Placed before the history it loses to the 50-odd
            // messages that follow it, and the model narrates the action instead
            // of calling the tool - the same failure the grounding reminder fixes.
            ...await this.buildPendingActionBlock( context ),
            { role: "user", content: this.buildUserContent( context ) }
        ];

        // If a proposal is open and the person plainly agreed, run it here rather
        // than asking the model to restate the call. It has proved unable to
        // reproduce identical arguments, which left confirmations looping
        // forever - and the exact tool and arguments are already stored.
        const executed = await this.executeConfirmedAction( context );

        if ( executed ) {
            messages.push( { role: "system", content: executed } );
        }

        let reply = await this.runToolLoop( messages, context );

        // Replayed history is full of this bot promising to act and not acting,
        // and it learns from that: after two refusals to call a tool, the
        // history is the problem, not the request. An action request is
        // self-contained, so retry once without it.
        if ( NARRATION_GAVE_UP === reply.content && context.history?.length ) {
            this.logger.warn( this.respondTo, "Retrying without replayed history - it was teaching the model to narrate" );

            const clean = messages.filter( ( message ) => !( context.history ?? [] ).includes( message ) );

            reply = await this.runToolLoop( clean, { ...context, history: [] } );
        }

        if ( NARRATION_GAVE_UP === reply.content ) {
            return {
                content: [
                    "I did not do that - nothing happened.",
                    "",
                    "I kept describing the action instead of running it. Please say what you want again,",
                    "in one short message, and I will act on it directly."
                ].join( "\n" ),
                usage: reply.usage
            };
        }

        if ( !reply.content.length ) {
            this.logger.debug( this.respondTo, `Model returned nothing for event '${ context.event }'` );

            return null;
        }

        return reply;
    }

    /**
     * Runs the model until it answers in words rather than tool calls.
     *
     * Tool results are appended as `tool` turns and the model is asked again,
     * so it can chain - read a channel list, then act on one of them. Bounded,
     * because a model that keeps calling the same tool would otherwise never
     * return.
     */
    private parseDecision( raw: string ): { respond?: boolean; reason?: string } | null {
        try {
            const parsed: unknown = JSON.parse( raw );

            return parsed && "object" === typeof parsed ? parsed as { respond?: boolean; reason?: string } : null;
        } catch {
            return null;
        }
    }

    private async runToolLoop( messages: OllamaMessage[], context: TriggerContext ): Promise<AIReply> {
        // Local tools first: where both offer a way to do something, the model
        // should reach for the one-step version.
        const tools = AIConfig.$.isMcpEnabled()
            ? [ ...LocalToolsProvider.$.getTools(), ...MCPProvider.$.getTools() ]
            : LocalToolsProvider.$.getTools();
        const maxIterations = AIConfig.$.getMaxToolIterations();

        const conversation = [ ...messages ];

        // Output accumulates across iterations; prompt does not - the last call
        // already includes everything before it.
        let outputTokens = 0;
        let promptTokens = 0;
        let executedCalls = 0;
        // Calls that were refused by the confirmation gate. They must not count
        // as acting: a turn whose only call was blocked has changed nothing, and
        // is exactly when the model tends to claim it did.
        let blockedCalls = 0;
        let nudged = false;

        // A proposal open at the start of the turn means the model was handed an
        // explicit "call this tool now" instruction. If it then calls nothing,
        // it narrated - regardless of how it phrased that.
        const hadPendingAction = null !== await DestructiveActionManager.$.getPending(
            context.guildId,
            context.location.userId
        );

        for ( let iteration = 0; iteration < maxIterations; iteration++ ) {
            const response = await OllamaProvider.$.chat( {
                messages: conversation,
                ...( tools.length ? { tools } : {} )
            } );

            outputTokens += response.eval_count ?? 0;
            promptTokens = response.prompt_eval_count ?? promptTokens;

            const toolCalls = response.message.tool_calls ?? [];

            if ( !toolCalls.length ) {
                const content = response.message.content.trim();

                // One nudge, only for read offers. A destructive proposal is
                // supposed to ask, so it is left alone.
                if ( !nudged && await this.isUnfulfilledReadOffer( content, context ) ) {
                    nudged = true;

                    this.logger.warn( this.runToolLoop, "Model offered to read instead of reading; forcing the call" );

                    conversation.push( response.message );
                    conversation.push( {
                        role: "system",
                        content: [
                            "You offered to look something up instead of doing it.",
                            "Reading changes nothing and never needs permission.",
                            "Call the tool now and answer the question with the real result.",
                            "Do not state limits you have not observed - in particular, there is",
                            "no age limit on reading messages; the 14-day rule applies only to",
                            "bulk deletion."
                        ].join( " " )
                    } );

                    continue;
                }

                // Claiming an action without having called a tool is the worst
                // failure here: the user believes it happened and it did not.
                //
                // Two ways in. The pending check is the reliable one - it does not
                // depend on phrasing, which the pattern list kept losing to
                // ("I'm now deleting", "proceeding immediately"). The patterns
                // still catch claims made with no proposal open.
                const performedSomething = executedCalls > blockedCalls;

                // A call blocked THIS turn means a proposal was just recorded, and
                // describing it and asking is exactly what should happen next.
                // Without this, the broadened claim patterns match that perfectly
                // correct question and replace it with a failure message.
                const justProposed = blockedCalls > 0;

                const claimedWithoutActing = !performedSomething && !justProposed
                    && ( hadPendingAction || UNBACKED_ACTION_PATTERNS.some( ( p ) => p.test( content ) ) );

                // The nudge already happened and it still called nothing. Never
                // send the claim: the user would believe it was done. Replace it
                // with the truth.
                if ( nudged && claimedWithoutActing ) {
                    this.logger.error(
                        this.runToolLoop,
                        "Model claimed an action twice without calling a tool; replacing the reply"
                    );

                    return {
                        content: NARRATION_GAVE_UP,
                        usage: {
                            promptTokens,
                            outputTokens,
                            contextLimit: AIConfig.$.getOllamaNumCtx(),
                            toolCalls: executedCalls
                        }
                    };
                }

                if ( !nudged && claimedWithoutActing ) {
                    nudged = true;

                    this.logger.warn( this.runToolLoop, "Model claimed an action without calling a tool; forcing the call" );

                    conversation.push( response.message );
                    conversation.push( {
                        role: "system",
                        content: [
                            "You said you would perform an action but called no tool, so NOTHING happened.",
                            "Writing that you are proceeding does not perform anything - only a tool call does.",
                            "Call the tool now with the correct arguments.",
                            "If you cannot, say plainly that you did not do it and why. Never imply it is done."
                        ].join( " " )
                    } );

                    continue;
                }

                return {
                    content,
                    usage: {
                        promptTokens,
                        outputTokens,
                        contextLimit: AIConfig.$.getOllamaNumCtx(),
                        toolCalls: executedCalls
                    }
                };
            }

            executedCalls += toolCalls.length;

            conversation.push( response.message );

            for ( const call of toolCalls ) {
                const result = await this.executeTool( call.function.name, call.function.arguments, context );

                if ( result.startsWith( "NOT EXECUTED" ) ) {
                    blockedCalls++;
                }

                conversation.push( {
                    role: "tool",
                    tool_name: call.function.name,
                    content: this.clipToolResult( result )
                } );
            }
        }

        this.logger.warn( this.runToolLoop, `Hit the '${ maxIterations }' tool-call ceiling without an answer` );

        // Ask once more with tools withheld, so the user gets words rather than silence.
        const final = await OllamaProvider.$.chat( { messages: conversation } );

        return {
            content: final.message.content.trim(),
            usage: {
                promptTokens: final.prompt_eval_count ?? promptTokens,
                outputTokens: outputTokens + ( final.eval_count ?? 0 ),
                contextLimit: AIConfig.$.getOllamaNumCtx(),
                toolCalls: executedCalls
            }
        };
    }

    /**
     * Keeps a large tool result from dominating the prefill, without destroying
     * the parts of it that carry the answer.
     *
     * Cutting JSON at a byte offset drops whatever sits after the big array -
     * and that is exactly where the useful scalars live. `discord_get_messages`
     * puts `count` after `messages`, so a blind clip left the model with a
     * partial list and no total, and it answered with the `limit` it had asked
     * for instead. Rows are dropped here; sibling fields are kept.
     */
    private clipToolResult( result: string ): string {
        const limit = AIConfig.$.getToolResultMaxChars();

        if ( result.length <= limit ) {
            return result;
        }

        return this.clipJsonRows( result, limit ) ?? this.clipText( result, limit );
    }

    /** Trims the longest array in a JSON object, preserving every other field. */
    private clipJsonRows( result: string, limit: number ): string | null {
        try {
            const parsed: unknown = JSON.parse( result );

            if ( !parsed || "object" !== typeof parsed || Array.isArray( parsed ) ) {
                return null;
            }

            const entries = Object.entries( parsed as Record<string, unknown> );

            const longest = entries
                .filter( ( [ , value ] ) => Array.isArray( value ) )
                .sort( ( a, b ) => ( b[ 1 ] as unknown[] ).length - ( a[ 1 ] as unknown[] ).length )
                .at( 0 );

            if ( !longest ) {
                return null;
            }

            const [ key, rows ] = longest as [ string, unknown[] ];

            const kept: unknown[] = [];

            let size = result.length - JSON.stringify( rows ).length;

            for ( const row of rows ) {
                const rowSize = JSON.stringify( row ).length + 1;

                if ( size + rowSize > limit ) {
                    break;
                }

                kept.push( row );
                size += rowSize;
            }

            const clipped = { ...( parsed as Record<string, unknown> ), [ key ]: kept };

            const note = kept.length < rows.length
                ? `\n\n[Only ${ kept.length } of ${ rows.length } '${ key }' entries are shown, to keep this short. Every other field above is complete and accurate - use them for totals rather than counting the entries shown.]`
                : "";

            return `${ JSON.stringify( clipped ) }${ note }`;
        } catch {
            return null;
        }
    }

    private clipText( result: string, limit: number ): string {
        return `${ result.slice( 0, limit ) }\n\n[TRUNCATED. This is only the first ${ limit } of ${ result.length } characters. What is shown is NOT the complete set - do not count it as a total.]`;
    }

    /**
     * A failing tool is reported back to the model, not thrown - it can recover.
     *
     * Destructive calls never execute on the first attempt. The first call
     * records a proposal and returns a refusal; only an identical call, made
     * after the same person has confirmed, is allowed through.
     */
    private async executeTool( name: string, args: JsonObject, context: TriggerContext ): Promise<string> {
        this.logger.log( this.executeTool, `Tool call: '${ name }' args: '${ JSON.stringify( args ) }'` );

        if ( isDestructiveTool( name ) ) {
            const userId = context.location.userId;

            const approved = await DestructiveActionManager.$.consumeApproval( context.guildId, userId, name, args );

            if ( !approved ) {
                const description = await DestructiveActionManager.$.propose( context.guildId, userId, name, args );

                this.logger.warn( this.executeTool, `Blocked unconfirmed destructive call: '${ name }'` );

                return [
                    "NOT EXECUTED - this action needs confirmation and has not been performed.",
                    `Proposed: ${ description }`,
                    "",
                    "Tell the user exactly what this will do and ask them to confirm.",
                    "Do not claim it is done. If they confirm, call this tool again with identical arguments."
                ].join( "\n" );
            }
        }

        return await this.callTool( name, args );
    }

    /**
     * Raw dispatch, with no confirmation gate - callers must have cleared it.
     *
     * Local tools are checked first: they are this app's own, and the MCP server
     * has never heard of them.
     */
    private async callTool( name: string, args: JsonObject ): Promise<string> {
        try {
            return LocalToolsProvider.$.has( name )
                ? await LocalToolsProvider.$.call( name, args )
                : await MCPProvider.$.callTool( name, args );
        } catch( error ) {
            this.logger.error( this.callTool, `Tool '${ name }' failed`, error );

            return `Tool error: ${ String( error ) }`;
        }
    }

    /**
     * The usage line appended under a reply, as Discord subtext.
     *
     * Shows context pressure rather than a raw total: the useful question is
     * how close this conversation is to filling the window, since that is what
     * makes the bot start forgetting.
     */
    public formatUsage( usage: ReplyUsage ): string {
        const used = usage.promptTokens + usage.outputTokens;

        const parts = [ `${ this.formatTokens( used ) }/${ this.formatTokens( usage.contextLimit ) } tok` ];

        if ( usage.toolCalls ) {
            parts.push( `${ usage.toolCalls } tool${ 1 === usage.toolCalls ? "" : "s" }` );
        }

        return `-# ${ parts.join( " · " ) }`;
    }

    /**
     * 1024-based on purpose: the context limit is 65536, and rendering that as
     * "66k" next to a number everyone reads as 64k looks like a bug.
     */
    private formatTokens( count: number ): string {
        return count >= 1024 ? `${ Math.round( count / 1024 ) }k` : String( count );
    }

    /** Splits a reply on paragraph boundaries where it can, hard-cuts where it cannot. */
    public splitForDiscord( content: string ): string[] {
        if ( content.length <= DISCORD_MESSAGE_LIMIT ) {
            return [ content ];
        }

        const chunks: string[] = [];

        let remaining = content;

        while ( remaining.length ) {
            if ( remaining.length <= DISCORD_MESSAGE_LIMIT ) {
                chunks.push( remaining );

                break;
            }

            const window = remaining.slice( 0, DISCORD_MESSAGE_LIMIT );
            const breakAt = window.lastIndexOf( "\n" );
            const cut = breakAt > DISCORD_MESSAGE_LIMIT / 2 ? breakAt : DISCORD_MESSAGE_LIMIT;

            chunks.push( remaining.slice( 0, cut ) );

            remaining = remaining.slice( cut ).trimStart();
        }

        return chunks;
    }

    /**
     * The ids the tools need, stated as fact.
     *
     * Discord tools are all id-addressed, and names are not ids - a model given
     * only "#welcome" will pass "welcome", or invent a snowflake, and every call
     * fails.
     */
    /**
     * True when the reply is an offer to read rather than the answer.
     *
     * Deliberately narrow: a pending destructive proposal is *supposed* to end
     * in a question, so those are excluded and only read offers are retried.
     */
    private async isUnfulfilledReadOffer( content: string, context: TriggerContext ): Promise<boolean> {
        if ( await DestructiveActionManager.$.getPending( context.guildId, context.location.userId ) ) {
            return false;
        }

        return UNFULFILLED_OFFER_PATTERNS.some( ( pattern ) => pattern.test( content ) );
    }

    /**
     * Replays an open proposal into the next turn.
     *
     * State the tool name and arguments verbatim: the model has to reproduce
     * them exactly for the approval to match, and it cannot recover them from
     * its own prose.
     */
    private async buildPendingActionBlock( context: TriggerContext ): Promise<OllamaMessage[]> {
        const pending = await DestructiveActionManager.$.getPending( context.guildId, context.location.userId );

        if ( !pending ) {
            return [];
        }

        this.logger.log(
            this.buildPendingActionBlock,
            `Replaying pending '${ pending.toolName }' into this turn for confirmation`
        );

        return [ {
            role: "system",
            content: [
                "You previously proposed this action and it has NOT been performed:",
                `  tool: ${ pending.toolName }`,
                `  arguments: ${ pending.argsJson }`,
                "",
                `If ${ context.location.userName } has just agreed - "yes", "confirm", "do it",`,
                "\"go ahead\", \"please delete them\" - call that tool NOW with exactly those",
                "arguments. Do not describe it, do not say you are proceeding, do not ask again.",
                "Calling the tool is the only thing that performs it.",
                "",
                "If they said something else, treat the proposal as abandoned."
            ].join( "\n" )
        } ];
    }

    private buildLocationBlock( context: TriggerContext ): string {
        return PromptManager.$.get( PROMPT_NAMES.LocationContext, {
            guildId: context.guildId,
            guildName: context.location.guildName,
            channelId: context.location.channelId,
            channelName: context.location.channelName,
            userId: context.location.userId,
            userName: context.location.userName
        } );
    }

    private buildUserContent( context: TriggerContext ): string {
        const definition = TRIGGER_EVENT_DEFINITIONS[ context.event ];

        return `[Event: ${ definition.label }]\n${ context.summary }`;
    }
}

export default AIService;
