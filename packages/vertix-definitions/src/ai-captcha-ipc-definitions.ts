export const AI_CAPTCHA_IPC_CHANNELS = {
    AI_CAPTCHA_REQUEST: "vertix:ai-captcha:request",
    AI_CAPTCHA_RESPONSE: "vertix:ai-captcha:response"
} as const;

/**
 * Tools the bot lets through despite read-only mode, comma separated.
 *
 * Read-only is otherwise all-or-nothing, and verification needs neither half: the assistant that
 * answers a stranger must not gain the mutating Discord surface, but it does need to post a
 * challenge and check an answer. Named here so the bot and the MCP server agree on the spelling.
 */
export const AI_EXTRA_TOOLS_ENV_VAR = "VERTIX_MCP_EXTRA_TOOLS";

export const AI_CAPTCHA_IPC_ACTIONS = {
    SEND_CHALLENGE: "captcha_send_challenge",
    VERIFY_ANSWER: "captcha_verify_answer"
} as const;

/** Long enough to read an image and type a word, short enough that a stolen one is useless. */
export const AI_CAPTCHA_TTL_MS = 300000;

/** Wrong answers allowed before the challenge is burned and a new one must be posted. */
export const AI_CAPTCHA_MAX_ATTEMPTS = 3;

export const AI_CAPTCHA_IMAGE_WIDTH = 320;
export const AI_CAPTCHA_IMAGE_HEIGHT = 110;

/**
 * Real words rather than random characters, so someone reading a smeared image is recognising
 * something they know instead of guessing between `rn` and `m`.
 *
 * Deliberately short, common, and free of letters that look like each other once distorted.
 */
export const AI_CAPTCHA_WORDS: readonly string[] = [
    "anchor", "bridge", "candle", "danger", "eagle", "falcon", "garden", "hammer",
    "island", "jacket", "kitten", "ladder", "magnet", "nectar", "orbit", "pepper",
    "quartz", "rabbit", "saddle", "temple", "umbrella", "velvet", "walnut", "yellow",
    "zebra", "acorn", "basket", "cactus", "dolphin", "ember", "forest", "glacier",
    "harbor", "ignite", "jungle", "kernel", "lantern", "meadow", "noble", "otter",
    "packet", "quiver", "ribbon", "silver", "thunder", "unique", "violet", "wonder",
    "yonder", "zephyr", "amber", "beacon", "copper", "dragon", "engine", "frost",
    "gravel", "helmet", "indigo", "jasper", "kettle", "linen", "marble", "needle",
    "onyx", "prism", "quilt", "rocket", "summit", "timber", "urban", "vessel",
    "willow", "yeast", "zenith", "arrow", "breeze", "cobalt", "dusk", "echo"
];

export interface AISendCaptchaChallengeRequest {
    action: typeof AI_CAPTCHA_IPC_ACTIONS.SEND_CHALLENGE;
    channelId: string;
    /** Who is being asked - mentioned in the post, and what a later answer is matched against. */
    userId: string;
}

export interface AIVerifyCaptchaAnswerRequest {
    action: typeof AI_CAPTCHA_IPC_ACTIONS.VERIFY_ANSWER;
    channelId: string;
    userId: string;
    answer: string;
    /**
     * Granted only on a correct answer, and only if the channel's own prompt names it.
     *
     * The grant lives behind the comparison rather than in the caller's hands: a tool that adds a
     * role on request is a role anybody can talk their way into, and the whole point of the image
     * is that talking is not enough. Checking it against the prompt is what stops a different role
     * being named than the one the channel was set up to hand out.
     */
    grantRoleId?: string;
}

export type AICaptchaIPCRequestPayload =
    | AISendCaptchaChallengeRequest
    | AIVerifyCaptchaAnswerRequest;

export interface AISendCaptchaChallengeResponse {
    posted: boolean;
    channelId: string;
    userId: string;
    expiresInSeconds: number;
    maxAttempts: number;
    /** The word is never returned. Nothing the model holds can be echoed into the channel. */
    messageId: string;
}

/**
 * `none` means nothing was pending - a stale reply, or an answer to a challenge that already
 * passed. Told apart from `incorrect` so the bot does not accuse someone of failing.
 */
export type AICaptchaVerdict = "correct" | "incorrect" | "expired" | "exhausted" | "none";

/** Why a role was or was not handed over, so the bot can say something true about it. */
export type AICaptchaGrantOutcome = "granted" | "already-held" | "not-in-prompt" | "failed" | "not-requested";

export interface AIVerifyCaptchaAnswerResponse {
    verdict: AICaptchaVerdict;
    channelId: string;
    userId: string;
    attemptsUsed: number;
    attemptsRemaining: number;
    grant: AICaptchaGrantOutcome;
    grantedRoleId?: string;
}

export type AICaptchaIPCResponsePayload =
    | AISendCaptchaChallengeResponse
    | AIVerifyCaptchaAnswerResponse;
