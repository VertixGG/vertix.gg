import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

/** `apps/vertix-ai/assets/prompts` - resolved from this file, not the cwd. */
export const PROMPTS_PATH = path.resolve( __dirname, "../../assets/prompts" );

export const PROMPT_FILE_EXTENSION = ".md";

/**
 * Every prompt this app sends, one file each.
 *
 * Keys are the file basenames; adding a prompt means adding a file and a key,
 * and a missing file fails loudly at startup rather than at the first message.
 */
export const PROMPT_NAMES = {
    /** Fallback for a guild that has not customised its prompt. */
    SystemDefault: "system-default",
    /** Prepended to every system prompt so the bot knows its own name. */
    IdentityPreamble: "identity-preamble",
    /** Re-asserted after replayed history, which may contain its own mistakes. */
    GroundingReminder: "grounding-reminder",
    /** Decides whether a message deserves a reply at all. */
    Decision: "decision",
    /** The real Discord ids, so tool arguments are not guessed. */
    LocationContext: "location-context",
    /** Injected only when the speaker is the bot owner: act, do not ask. */
    OwnerContext: "owner-context"
} as const;

export type PromptName = ( typeof PROMPT_NAMES )[ keyof typeof PROMPT_NAMES ];

export const ALL_PROMPT_NAMES = Object.values( PROMPT_NAMES );
