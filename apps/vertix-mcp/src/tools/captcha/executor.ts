import { z } from "zod";

import { AI_CAPTCHA_IPC_ACTIONS } from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

import { requestAICaptcha } from "@vertix.gg/mcp/src/tools/captcha/ipc-client";

import type {
    AISendCaptchaChallengeResponse,
    AIVerifyCaptchaAnswerResponse
} from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

const SendChallengeSchema = z.object( {
    channelId: z.string(),
    userId: z.string()
} );

const VerifyAnswerSchema = z.object( {
    channelId: z.string(),
    userId: z.string(),
    answer: z.string()
} );

const VERDICT_GUIDANCE: Record<AIVerifyCaptchaAnswerResponse[ "verdict" ], string> = {
    correct: "They typed the word correctly and are verified. Proceed with whatever verification grants.",
    incorrect: "Wrong word. Tell them, say how many attempts are left, and let them try again.",
    exhausted: "They used every attempt. Post a fresh challenge with captcha_send_challenge if you want to let them retry.",
    expired: "The challenge timed out before they answered. Post a fresh one with captcha_send_challenge.",
    none: "Nothing was pending for this person - they were never sent a challenge, or already passed one. Do not tell them they failed."
};

export async function executeCaptchaTool( name: string, args: Record<string, unknown> | undefined ): Promise<unknown> {
    switch ( name ) {
        case AI_CAPTCHA_IPC_ACTIONS.SEND_CHALLENGE: {
            const { channelId, userId } = SendChallengeSchema.parse( args ?? {} );

            const response = await requestAICaptcha<AISendCaptchaChallengeResponse>( {
                action: AI_CAPTCHA_IPC_ACTIONS.SEND_CHALLENGE,
                channelId,
                userId
            } );

            return {
                ...response,
                state:
                    "The image is posted. You do not know the word and cannot work it out - wait for them " +
                    "to reply, then pass their message to captcha_verify_answer."
            };
        }

        case AI_CAPTCHA_IPC_ACTIONS.VERIFY_ANSWER: {
            const { channelId, userId, answer } = VerifyAnswerSchema.parse( args ?? {} );

            const response = await requestAICaptcha<AIVerifyCaptchaAnswerResponse>( {
                action: AI_CAPTCHA_IPC_ACTIONS.VERIFY_ANSWER,
                channelId,
                userId,
                answer
            } );

            return {
                ...response,
                state: VERDICT_GUIDANCE[ response.verdict ]
            };
        }

        default:
            throw new Error( `Unknown captcha tool: ${ name }` );
    }
}
