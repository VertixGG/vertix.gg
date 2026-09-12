import {
    AI_CAPTCHA_MAX_ATTEMPTS,
    AI_CAPTCHA_TTL_MS
} from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const TTL_MINUTES = Math.round( AI_CAPTCHA_TTL_MS / 60000 );

/**
 * Both tools act - they post a message and they spend an attempt - so neither survives read-only
 * mode, and the read-only public assistant never sees them.
 */
export const captchaToolDefinitions: Tool[] = [
    {
        name: "captcha_send_challenge",
        description:
            "Post a CAPTCHA image to a channel: a random word drawn distorted, addressed to one " +
            "person, for them to read and type back. Use this to check somebody is human. The " +
            "word is generated and kept by the bot and is NOT returned to you - you cannot see " +
            "it, so do not claim to know it or try to guess it. Check whatever they reply with " +
            `using captcha_verify_answer. The challenge lasts ${ TTL_MINUTES } minutes and allows ` +
            `${ AI_CAPTCHA_MAX_ATTEMPTS } attempts. Posting a new one for the same person in the ` +
            "same channel replaces the old one",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord channel id to post the image in" },
                userId: { type: "string", description: "Discord user id of the person being asked" }
            },
            required: [ "channelId", "userId" ]
        }
    },
    {
        name: "captcha_verify_answer",
        description:
            "Check what somebody typed against the CAPTCHA they were sent. Pass their message " +
            "text as the answer; case and surrounding spaces do not matter. Returns a verdict: " +
            "'correct' (they are human - proceed), 'incorrect' (wrong word, attemptsRemaining " +
            "says how many tries are left), 'exhausted' (no tries left, post a new challenge " +
            "with captcha_send_challenge), 'expired' (too slow, post a new one), or 'none' " +
            "(nothing was pending for them - do not tell them they failed). Only a 'correct' " +
            "verdict means they passed; never treat anything else as passing, and never verify " +
            "somebody on your own judgement without calling this",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: "Discord channel id the challenge was posted in" },
                userId: { type: "string", description: "Discord user id of the person answering" },
                answer: { type: "string", description: "Exactly what they typed" }
            },
            required: [ "channelId", "userId", "answer" ]
        }
    }
];

const captchaToolNames = new Set( captchaToolDefinitions.map( ( tool ) => tool.name ) );

export function isCaptchaTool( name: string ): boolean {
    return captchaToolNames.has( name );
}
