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
    answer: z.string(),
    grantRoleId: z.string().optional()
} );

const GRANT_GUIDANCE: Record<AIVerifyCaptchaAnswerResponse[ "grant" ], string> = {
    granted: "The role has been given to them - say so; do not try to add it again.",
    "already-held": "They already had the role, so nothing changed. Tell them they are set.",
    "not-in-prompt": "Refused: this channel's prompt does not name that role. Do not try another role id - tell them an admin needs to fix the channel's setup.",
    failed: "Discord refused the role change - usually the bot's own role sits below it, or it lacks Manage Roles. Tell them an admin needs to look.",
    "not-requested": "No role was asked for."
};

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
            const { channelId, userId, answer, grantRoleId } = VerifyAnswerSchema.parse( args ?? {} );

            const response = await requestAICaptcha<AIVerifyCaptchaAnswerResponse>( {
                action: AI_CAPTCHA_IPC_ACTIONS.VERIFY_ANSWER,
                channelId,
                userId,
                answer,
                grantRoleId
            } );

            return {
                ...response,
                state: "not-requested" === response.grant
                    ? VERDICT_GUIDANCE[ response.verdict ]
                    : `${ VERDICT_GUIDANCE[ response.verdict ] } ${ GRANT_GUIDANCE[ response.grant ] }`
            };
        }

        default:
            throw new Error( `Unknown captcha tool: ${ name }` );
    }
}
