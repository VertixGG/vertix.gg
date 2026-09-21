import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";

import type { ICommandGroupDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/**
 * `/manage` :: what an admin does to the server's setup.
 *
 * Admin throughout, so the group declares the permission and Discord refuses the rest before the
 * bot is reached. No row names a v2 adapter: these are about the server rather than any one channel,
 * so there is no channel to read a version off - the setup interfaces ask which generator is meant
 * and handle its version themselves.
 *
 * There is no `scaling`. A scaling generator is one of the things `edit` lists, and picking it
 * opens the scaling editor - the menu behind that command already routes by what was chosen, so a
 * command of its own was a second way in that could not ask which pool it meant.
 *
 * `setup` is `/setup` under the admin group - the same interface, reached by the name an admin
 * looking through `/manage` would try first.
 *
 * `new-generator` opens the setup interface rather than the v3 wizard behind it, because which kind
 * of generator to make is a question the member has to answer first - v2, v3, or auto-scaling - and
 * `SetupMasterCreateSelectMenu` is where it is already asked. Opening the wizard skipped it and
 * chose v3 on their behalf.
 *
 * `roles`, `server-options` and `badwords` are screens inside the setup interface rather than
 * interfaces of their own, so they name the step to open at. `roles` and `server-options` share a
 * menu: it shows the three role settings on the roles step and all five on the other, because what
 * a choice does is one switch and a second menu would need a second copy of it. `spec/commands-spec.md` rows `M-06` (buttons) and `M-08` (logs)
 * are absent: both are select-menu choices rather than screens, so there is nothing to open them at.
 */
export const MANAGE_COMMAND_GROUP: ICommandGroupDefinition = {
    name: "manage",

    description: "Configure VoiceChannels for this server.",

    subcommands: [
        {
            name: "setup",
            description: "Set up and configure VoiceChannels for this server.",
            tier: COMMAND_TIERS.ADMIN,
            adapterName: "VertixBot/UI-General/SetupAdapter",
            flowTransition: "VertixBot/Commands/ManageSetup",
            flowTargetState: "VertixBot/UI-General/SetupFlow/States/Initial"
        },
        {
            name: "new-generator",
            description: "Create a new channel generator.",
            tier: COMMAND_TIERS.ADMIN,
            adapterName: "VertixBot/UI-General/SetupAdapter",
            executionStep: "VertixBot/UI-General/SetupMasterCreate",
            flowTransition: "VertixBot/Commands/ManageNewGenerator",
            flowTargetState: "VertixBot/UI-General/SetupFlow/States/MasterCreate"
        },
        {
            name: "edit",
            description: "Edit an existing channel generator.",
            tier: COMMAND_TIERS.ADMIN,
            adapterName: "VertixBot/UI-General/SetupAdapter",
            executionStep: "VertixBot/UI-General/SetupMasterEdit",
            flowTransition: "VertixBot/Commands/ManageEdit",
            flowTargetState: "VertixBot/UI-General/SetupFlow/States/MasterEdit"
        },
        {
            name: "roles",
            description: "Set this server's voice, verified and staff roles.",
            tier: COMMAND_TIERS.ADMIN,
            adapterName: "VertixBot/UI-General/SetupAdapter",
            executionStep: "VertixBot/UI-General/SetupServerOptionsRoles",
            flowTransition: "VertixBot/Commands/ManageRoles",
            flowTargetState: "VertixBot/UI-General/SetupFlow/States/ServerOptionsRoles"
        },
        {
            name: "server-options",
            description: "Set this server's roles, bad words and claim timings.",
            tier: COMMAND_TIERS.ADMIN,
            adapterName: "VertixBot/UI-General/SetupAdapter",
            executionStep: "VertixBot/UI-General/SetupServerOptions",
            flowTransition: "VertixBot/Commands/ManageServerOptions",
            flowTargetState: "VertixBot/UI-General/SetupFlow/States/ServerOptions"
        },
        {
            name: "badwords",
            description: "Set the words this server will not allow.",
            tier: COMMAND_TIERS.ADMIN,
            adapterName: "VertixBot/UI-General/SetupAdapter",
            executionStep: "VertixBot/UI-General/SetupBadwords",
            flowTransition: "VertixBot/Commands/ManageBadwords",
            flowTargetState: "VertixBot/UI-General/SetupFlow/States/ServerOptionsBadwords"
        },
        {
            name: "language",
            description: "Set the language VoiceChannels speaks in this server.",
            tier: COMMAND_TIERS.ADMIN,
            adapterName: "VertixBot/UI-General/LanguageAdapter",
            flowTransition: "VertixBot/Commands/ManageLanguage",
            flowTargetState: "VertixBot/UI-General/LanguageFlow/States/Initial"
        }
    ]
};
