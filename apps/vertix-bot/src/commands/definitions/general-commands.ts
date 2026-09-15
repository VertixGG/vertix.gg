import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";

import type { ICommandDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/**
 * The commands that stand on their own, under no group.
 *
 * `setup` stays here rather than becoming `/manage setup`, and it is not the alias of one that
 * `spec/commands-spec.md` row `G-04` first called for. The two open different interfaces:
 * `SetupAdapter` is the hub, which shows the whole configuration at once and has a way through to
 * each part of it, while `/manage setup` opens the wizard that creates a single new generator.
 * Repointing this at the wizard would take the command servers already know and drop whoever typed
 * it into the middle of one task. So it keeps what it opens, and `/manage` holds the narrower rows.
 *
 * `help` and `welcome` are open to anyone - `G-01` and `G-02`. A member who cannot manage the guild
 * could not read the help before that.
 */
export const GENERAL_COMMAND_DEFINITIONS: ICommandDefinition[] = [
    {
        name: "setup",
        description: "Set up and configure VoiceChannels for this server.",
        tier: COMMAND_TIERS.ADMIN,
        adapterName: "VertixBot/UI-General/SetupAdapter",
        flowTransition: "VertixBot/Commands/Setup",
        flowTargetState: "VertixBot/UI-General/SetupFlow/States/Initial"
    },
    {
        name: "help",
        description: "Get help with VoiceChannels.",
        tier: COMMAND_TIERS.ANY,
        adapterName: "VertixBot/UI-General/FeedbackAdapter",
        flowTransition: "VertixBot/Commands/Help",
        flowTargetState: "VertixBot/UI-General/FeedbackFlow/States/Default"
    },
    {
        name: "welcome",
        description: "Show what VoiceChannels does and how to start.",
        tier: COMMAND_TIERS.ANY,
        adapterName: "VertixBot/UI-General/WelcomeAdapter",
        flowTransition: "VertixBot/Commands/Welcome",
        flowTargetState: "VertixBot/UI-General/WelcomeFlow/States/Initial"
    }
];
