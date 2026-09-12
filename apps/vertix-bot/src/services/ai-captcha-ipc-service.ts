import { AttachmentBuilder } from "discord.js";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { AICaptchaChallengeModel } from "@vertix.gg/data/src/models/ai-captcha-challenge-model";

import {
    AI_CAPTCHA_IPC_ACTIONS,
    AI_CAPTCHA_IPC_CHANNELS,
    AI_CAPTCHA_MAX_ATTEMPTS,
    AI_CAPTCHA_TTL_MS
} from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

import { CaptchaManager } from "@vertix.gg/bot/src/managers/captcha-manager";

import type { Client } from "discord.js";

import type { IPCRequest, IPCService } from "@vertix.gg/base/src/modules/ipc";

import type {
    AICaptchaIPCRequestPayload,
    AICaptchaIPCResponsePayload,
    AISendCaptchaChallengeRequest,
    AISendCaptchaChallengeResponse,
    AIVerifyCaptchaAnswerRequest,
    AIVerifyCaptchaAnswerResponse
} from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

const ATTACHMENT_NAME = "captcha.png";

const EXPIRED_SWEEP_INTERVAL_MS = 600000;

/**
 * Poses a word-in-an-image challenge and remembers the answer.
 *
 * The answer stays in this process and in the database - it is never part of a tool result. The
 * agent asks for a challenge and later asks whether a reply matched; it cannot read the word out,
 * so it cannot post it into the channel by accident or be talked into revealing it.
 */
export class AICaptchaIPCService extends ServiceWithDependenciesBase<{
    ipcService: IPCService;
}> {
    private client: Client<true> | null = null;

    public static getName() {
        return "VertixBot/Services/AICaptchaIPC";
    }

    public registerClient( client: Client<true> ) {
        this.client = client;

        this.logger.log( this.registerClient, `Posting challenges as '${ client.user.username }'` );
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

        setInterval( () => void this.sweepExpired(), EXPIRED_SWEEP_INTERVAL_MS );
    }

    private async sweepExpired() {
        const removed = await AICaptchaChallengeModel.$.clearExpired().catch( () => 0 );

        if ( removed ) {
            this.logger.debug( this.sweepExpired, `Swept '${ removed }' expired challenge(s)` );
        }
    }

    private async subscribeToIPCChannels() {
        if ( ! this.services.ipcService.isReady() ) {
            this.logger.warn( this.subscribeToIPCChannels, "IPC service not available - captcha tools will be disabled" );

            return;
        }

        try {
            await this.services.ipcService.onRequest<AICaptchaIPCRequestPayload, AICaptchaIPCResponsePayload>(
                AI_CAPTCHA_IPC_CHANNELS.AI_CAPTCHA_REQUEST,
                AI_CAPTCHA_IPC_CHANNELS.AI_CAPTCHA_RESPONSE,
                this.handleIPCRequest.bind( this )
            );

            this.logger.log( this.subscribeToIPCChannels, "Subscribed to AI captcha IPC channels" );
        } catch {
            this.logger.warn( this.subscribeToIPCChannels, "Failed to subscribe to AI captcha IPC channels" );
        }
    }

    private async handleIPCRequest(
        request: IPCRequest<AICaptchaIPCRequestPayload>
    ): Promise<AICaptchaIPCResponsePayload> {
        const { payload } = request;

        this.logger.log( this.handleIPCRequest, `Received AI captcha IPC request: ${ payload.action }` );

        switch ( payload.action ) {
            case AI_CAPTCHA_IPC_ACTIONS.SEND_CHALLENGE:
                return await this.sendChallenge( payload );

            case AI_CAPTCHA_IPC_ACTIONS.VERIFY_ANSWER:
                return await this.verifyAnswer( payload );

            default:
                throw new Error( `Unknown AI captcha action: ${ ( payload as AICaptchaIPCRequestPayload ).action }` );
        }
    }

    private async sendChallenge( payload: AISendCaptchaChallengeRequest ): Promise<AISendCaptchaChallengeResponse> {
        const channel = await this.resolveChannel( payload.channelId );

        const word = CaptchaManager.$.pickWord();
        const image = CaptchaManager.$.render( word );

        const message = await channel.send( {
            content:
                `<@${ payload.userId }> please type the word shown in the image to verify you are human.\n` +
                `-# ${ Math.round( AI_CAPTCHA_TTL_MS / 60000 ) } minutes · ${ AI_CAPTCHA_MAX_ATTEMPTS } attempts`,
            files: [ new AttachmentBuilder( image, { name: ATTACHMENT_NAME } ) ]
        } );

        // Stored only after the image is actually on screen. Writing first would leave a pending
        // challenge nobody was ever shown, and the next reply would be judged against it.
        await AICaptchaChallengeModel.$.put(
            payload.channelId,
            payload.userId,
            channel.guildId,
            word.toLowerCase(),
            new Date( Date.now() + AI_CAPTCHA_TTL_MS )
        );

        this.logger.log(
            this.sendChallenge,
            `Posted a challenge - channelId: '${ payload.channelId }' userId: '${ payload.userId }'`
        );

        return {
            posted: true,
            channelId: payload.channelId,
            userId: payload.userId,
            expiresInSeconds: Math.round( AI_CAPTCHA_TTL_MS / 1000 ),
            maxAttempts: AI_CAPTCHA_MAX_ATTEMPTS,
            messageId: message.id
        };
    }

    private async verifyAnswer( payload: AIVerifyCaptchaAnswerRequest ): Promise<AIVerifyCaptchaAnswerResponse> {
        const challenge = await AICaptchaChallengeModel.$.get( payload.channelId, payload.userId );

        if ( ! challenge ) {
            return this.buildVerdict( payload, "none", 0 );
        }

        if ( challenge.expiresAt.getTime() < Date.now() ) {
            await AICaptchaChallengeModel.$.clear( payload.channelId, payload.userId );

            return this.buildVerdict( payload, "expired", challenge.attempts );
        }

        // Compared the way a person types: surrounding space and case are not part of the puzzle.
        if ( challenge.answer === payload.answer.trim().toLowerCase() ) {
            await AICaptchaChallengeModel.$.clear( payload.channelId, payload.userId );

            this.logger.log(
                this.verifyAnswer,
                `Challenge passed - channelId: '${ payload.channelId }' userId: '${ payload.userId }'`
            );

            return this.buildVerdict( payload, "correct", challenge.attempts );
        }

        const attempts = await AICaptchaChallengeModel.$.countAttempt( payload.channelId, payload.userId );

        if ( attempts >= AI_CAPTCHA_MAX_ATTEMPTS ) {
            await AICaptchaChallengeModel.$.clear( payload.channelId, payload.userId );

            return this.buildVerdict( payload, "exhausted", attempts );
        }

        return this.buildVerdict( payload, "incorrect", attempts );
    }

    private buildVerdict(
        payload: AIVerifyCaptchaAnswerRequest,
        verdict: AIVerifyCaptchaAnswerResponse[ "verdict" ],
        attemptsUsed: number
    ): AIVerifyCaptchaAnswerResponse {
        return {
            verdict,
            channelId: payload.channelId,
            userId: payload.userId,
            attemptsUsed,
            attemptsRemaining: Math.max( 0, AI_CAPTCHA_MAX_ATTEMPTS - attemptsUsed )
        };
    }

    private async resolveChannel( channelId: string ) {
        if ( ! this.client ) {
            throw new Error( "The AI client has not authenticated yet - try again in a moment." );
        }

        const channel = await this.client.channels.fetch( channelId ).catch( () => null );

        if ( ! channel ) {
            throw new Error( `Channel ${ channelId } could not be found.` );
        }

        if ( ! channel.isTextBased() || channel.isDMBased() ) {
            throw new Error( `Channel ${ channelId } is not a server text channel.` );
        }

        return channel;
    }
}

export default AICaptchaIPCService;
