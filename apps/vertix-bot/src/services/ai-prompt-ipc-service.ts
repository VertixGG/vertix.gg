import { PermissionsBitField } from "discord.js";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { AIChannelPromptModel } from "@vertix.gg/data/src/models/ai-channel-prompt-model";

import {
    AI_CHANNEL_PROMPT_MAX_LENGTH,
    AI_PROMPT_IPC_ACTIONS,
    AI_PROMPT_IPC_CHANNELS
} from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

import { resetChannelSession } from "@vertix.gg/bot/src/listeners/mention-handler-private";

import type { Client } from "discord.js";

import type { IPCRequest, IPCService } from "@vertix.gg/base/src/modules/ipc";

import type {
    AIGetChannelPromptResponse,
    AIPromptCaller,
    AIPromptIPCRequestPayload,
    AIPromptIPCResponsePayload,
    AIResetChannelPromptResponse,
    AISetChannelPromptRequest,
    AISetChannelPromptResponse
} from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

const OWNER_ID = process.env.OWNERD_ID;

const PERMISSION_DENIED_MESSAGE =
    "You need the Manage Server permission in that channel's server to change the AI's channel prompt.";

type PromptTarget = {
    channelId: string;
    channelName: string;
    guildId: string;
};

/**
 * Lets the agent read and rewrite a channel's prompt while it is being talked to.
 *
 * The MCP server is a separate process with no database of its own, so it asks over IPC the same
 * way the UI tools do - and asking here rather than there is what makes the permission check
 * meaningful: the bot resolves the channel, the guild and the member itself.
 */
export class AIPromptIPCService extends ServiceWithDependenciesBase<{
    ipcService: IPCService;
}> {
    /**
     * The AI Chat client, registered once it has authenticated.
     *
     * Its own membership is what resolves the caller - the main Vertix bot is not necessarily in
     * the servers this one was invited to.
     */
    private client: Client<true> | null = null;

    public static getName() {
        return "VertixBot/Services/AIPromptIPC";
    }

    public registerClient( client: Client<true> ) {
        this.client = client;

        this.logger.log( this.registerClient, `Resolving callers as '${ client.user.username }'` );
    }

    public getDependencies() {
        return {
            ipcService: "VertixBase/Modules/IPCService"
        };
    }

    protected async initialize() {
        await super.initialize();

        this.subscribeToIPCChannels().catch( () => {
            // Error already logged in subscribeToIPCChannels.
        } );
    }

    private async subscribeToIPCChannels() {
        if ( ! this.services.ipcService.isReady() ) {
            this.logger.warn(
                this.subscribeToIPCChannels,
                "IPC service not available - channel prompt tools will be disabled"
            );

            return;
        }

        try {
            await this.services.ipcService.onRequest<AIPromptIPCRequestPayload, AIPromptIPCResponsePayload>(
                AI_PROMPT_IPC_CHANNELS.AI_PROMPT_REQUEST,
                AI_PROMPT_IPC_CHANNELS.AI_PROMPT_RESPONSE,
                this.handleIPCRequest.bind( this )
            );

            this.logger.log( this.subscribeToIPCChannels, "Subscribed to AI prompt IPC channels" );
        } catch {
            this.logger.warn(
                this.subscribeToIPCChannels,
                "Failed to subscribe to AI prompt IPC channels - channel prompt tools will be disabled"
            );
        }
    }

    private async handleIPCRequest(
        request: IPCRequest<AIPromptIPCRequestPayload>
    ): Promise<AIPromptIPCResponsePayload> {
        const { payload } = request;

        this.logger.log( this.handleIPCRequest, `Received AI prompt IPC request: ${ payload.action }` );

        const target = await this.resolveTarget( payload.channelId ?? payload.caller.channelId );

        switch ( payload.action ) {
            case AI_PROMPT_IPC_ACTIONS.GET_CHANNEL_PROMPT:
                return await this.getChannelPrompt( target );

            case AI_PROMPT_IPC_ACTIONS.SET_CHANNEL_PROMPT:
                return await this.setChannelPrompt( payload, target );

            case AI_PROMPT_IPC_ACTIONS.RESET_CHANNEL_PROMPT:
                return await this.resetChannelPrompt( payload.caller, target );

            default:
                throw new Error(
                    `Unknown AI prompt request action: ${ ( payload as AIPromptIPCRequestPayload ).action }`
                );
        }
    }

    /**
     * Reading is open: a channel's own prompt is already part of the conversation the caller is
     * having, and another channel's is configuration its admins wrote, not a secret.
     */
    private async getChannelPrompt( target: PromptTarget ): Promise<AIGetChannelPromptResponse> {
        return {
            channelId: target.channelId,
            channelName: target.channelName,
            prompt: await AIChannelPromptModel.$.get( target.channelId )
        };
    }

    private async setChannelPrompt(
        payload: AISetChannelPromptRequest,
        target: PromptTarget
    ): Promise<AISetChannelPromptResponse> {
        await this.assertCanManage( payload.caller, target );

        const prompt = payload.prompt.trim();

        if ( ! prompt.length ) {
            throw new Error( "The prompt is empty - use the reset tool to remove a channel's prompt." );
        }

        if ( prompt.length > AI_CHANNEL_PROMPT_MAX_LENGTH ) {
            throw new Error(
                `That prompt is ${ prompt.length } characters; the limit is ${ AI_CHANNEL_PROMPT_MAX_LENGTH }.`
            );
        }

        const change = await AIChannelPromptModel.$.set(
            target.channelId,
            target.guildId,
            prompt,
            payload.caller.userId
        );

        this.applyImmediately( target );

        this.logger.admin(
            this.setChannelPrompt,
            `🧠  AI channel prompt modified - channelId: "${ target.channelId }", ` +
            `userId: "${ payload.caller.userId }", ` +
            `"${ change.previous?.length ?? 0 }" => "${ prompt.length }" chars`
        );

        return {
            channelId: target.channelId,
            channelName: target.channelName,
            previous: change.previous,
            current: prompt
        };
    }

    private async resetChannelPrompt(
        caller: AIPromptCaller,
        target: PromptTarget
    ): Promise<AIResetChannelPromptResponse> {
        await this.assertCanManage( caller, target );

        const previous = await AIChannelPromptModel.$.clear( target.channelId );

        if ( null === previous ) {
            return {
                channelId: target.channelId,
                channelName: target.channelName,
                previous: null,
                cleared: false
            };
        }

        this.applyImmediately( target );

        this.logger.admin(
            this.resetChannelPrompt,
            `🧠  AI channel prompt removed - channelId: "${ target.channelId }", userId: "${ caller.userId }"`
        );

        return {
            channelId: target.channelId,
            channelName: target.channelName,
            previous,
            cleared: true
        };
    }

    /**
     * The prompt only reaches the agent when a session starts, so a change made mid-conversation
     * would otherwise sit unused until the session timed out - looking, from the channel, exactly
     * like the change having been ignored.
     */
    private applyImmediately( target: PromptTarget ) {
        resetChannelSession( target.channelId );

        this.logger.debug( this.applyImmediately, `Reset the agent session for '${ target.channelId }'` );
    }

    private async resolveTarget( channelId: string ): Promise<PromptTarget> {
        const client = this.getClient();

        const channel = await client.channels.fetch( channelId ).catch( () => null );

        if ( ! channel ) {
            throw new Error( `Channel ${ channelId } could not be found.` );
        }

        if ( ! channel.isTextBased() || channel.isDMBased() ) {
            throw new Error( `Channel ${ channelId } is not a server text channel, so it cannot have a prompt.` );
        }

        return {
            channelId: channel.id,
            channelName: channel.name,
            guildId: channel.guildId
        };
    }

    /**
     * The bot owner passes anywhere; everyone else needs Manage Server in the server that owns the
     * channel being changed - which is not necessarily the one they are speaking in.
     */
    private async assertCanManage( caller: AIPromptCaller, target: PromptTarget ): Promise<void> {
        if ( OWNER_ID && caller.userId === OWNER_ID ) {
            return;
        }

        const client = this.getClient();

        const guild = await client.guilds.fetch( target.guildId ).catch( () => null );

        if ( ! guild ) {
            throw new Error( PERMISSION_DENIED_MESSAGE );
        }

        const member = await guild.members.fetch( caller.userId ).catch( () => null );

        if ( ! member?.permissions.has( PermissionsBitField.Flags.ManageGuild ) ) {
            this.logger.warn(
                this.assertCanManage,
                `Refused channel prompt change - userId: '${ caller.userId }' channelId: '${ target.channelId }'`
            );

            throw new Error( PERMISSION_DENIED_MESSAGE );
        }
    }

    private getClient(): Client<true> {
        if ( ! this.client ) {
            throw new Error( "The AI client has not authenticated yet - try again in a moment." );
        }

        return this.client;
    }
}

export default AIPromptIPCService;
