import { runVoiceClaim } from "@vertix.gg/bot/src/commands/handlers/voice-claim-handler";
import { runKnock } from "@vertix.gg/bot/src/commands/handlers/knock-handler";
import { runVoiceReset } from "@vertix.gg/bot/src/commands/handlers/voice-reset-handler";
import { runVoiceClearChat } from "@vertix.gg/bot/src/commands/handlers/voice-clear-chat-handler";
import { runVoiceInvite } from "@vertix.gg/bot/src/commands/handlers/voice-invite-handler";
import { runVoiceTransfer } from "@vertix.gg/bot/src/commands/handlers/voice-transfer-handler";
import { runVoiceTemplates } from "@vertix.gg/bot/src/commands/handlers/voice-templates-handler";

import type { TAdapterMapping } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * A command that does something other than open an interface.
 *
 * Handed what the bridge has already worked out: the channel, the adapter for that channel's
 * interface version - fetched, not named - and which version that turned out to be.
 *
 * The adapter arrives resolved because every handler wanted the same twelve lines to resolve it,
 * and `isV2` arrives because they were otherwise reading it back out of the adapter's name. A name
 * compared as a string is a name that fails silently: renamed, the comparison does not error, it
 * goes false, and a v2 channel is quietly answered with v3's screens.
 */
export type TCommandHandler = (
    interaction: CommandInteraction<"cached">,
    channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    isV2: boolean
) => Promise<void>;

/**
 * The commands that are not an interface opening, by the transition that names them.
 *
 * Kept apart from the definitions because the definitions are read by the flow router as well, and
 * that must not drag behaviour in behind it. A command absent from here opens its adapter, which is
 * nearly all of them.
 */
export const COMMAND_HANDLERS: Record<string, TCommandHandler> = {
    "VertixBot/Commands/VoiceClaim": runVoiceClaim,
    "VertixBot/Commands/VoiceKnock": runKnock,
    "VertixBot/Commands/VoiceReset": runVoiceReset,
    "VertixBot/Commands/VoiceClearChat": runVoiceClearChat,
    "VertixBot/Commands/VoiceInvite": runVoiceInvite,
    "VertixBot/Commands/VoiceTransfer": runVoiceTransfer,
    "VertixBot/Commands/VoiceTemplates": runVoiceTemplates
};
