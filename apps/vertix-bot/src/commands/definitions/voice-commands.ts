import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";

import type { ICommandGroupDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/**
 * `/voice` :: what a member does with a dynamic voice channel.
 *
 * Each of these opens the interface its button on the channel's own control panel opens - the same
 * adapter, reached a second way. The group declares no permission of its own: most of it is for the
 * channel's owner, `invite` and `knock` are for anyone, and Discord's permission is all-or-nothing
 * across a group, so the tier is cleared per subcommand when it runs instead.
 *
 * A generator carries its own interface version, so `adapterNameV2` names the same feature in the
 * older interface wherever v2 has it. The six rows without one - `privacy`, `invite`, `knock`,
 * `region`, `templates`, `message` - are features v2 never had, and on a v2 generator they say so
 * rather than opening a v3 interface onto a channel that is not one.
 *
 * `knock` is here despite asking about a channel somewhere in the guild rather than the one the
 * member is standing in. It stood on its own for a while for exactly that reason, and being alone
 * out there was worse: a member looking for what they can do with voice channels finds `/voice` and
 * has no reason to guess that one of them lives somewhere else.
 *
 * `claim` is the one row that opens nothing. A claim is a vote drawn by editing the message its
 * button sits on, which a command has no way to be, so it hands back that message instead - see
 * `runVoiceClaim()`, and `spec/commands-spec.md` row `V-08`.
 */
export const VOICE_COMMAND_GROUP: ICommandGroupDefinition = {
    name: "voice",

    description: "Manage the voice channel you are in.",

    subcommands: [
        {
            name: "rename",
            description: "Rename your channel.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelRenameAdapter",
            modalName: "VertixBot/UI-V3/DynamicChannelRenameModal",
            modalNameV2: "VertixBot/UI-V2/DynamicChannelMetaRenameModal",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelMetaRenameAdapter",
            flowTransition: "VertixBot/Commands/VoiceRename",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Default"
        },
        {
            name: "limit",
            description: "Set how many members may join your channel.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelLimitAdapter",
            modalName: "VertixBot/UI-V3/DynamicChannelLimitModal",
            modalNameV2: "VertixBot/UI-V2/DynamicChannelMetaLimitModal",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter",
            flowTransition: "VertixBot/Commands/VoiceLimit",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Default"
        },
        {
            name: "privacy",
            description: "Make your channel public, private or hidden.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelPrivacyAdapter",
            flowTransition: "VertixBot/Commands/VoicePrivacy",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default"
        },
        {
            name: "status",
            description: "Set the status shown on your channel.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelStatusAdapter",
            modalName: "VertixBot/UI-V3/DynamicChannelStatusModal",
            modalNameV2: "VertixBot/UI-V2/DynamicChannelMetaStatusModal",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelMetaStatusAdapter",
            flowTransition: "VertixBot/Commands/VoiceStatus",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelStatusFlow/States/Default"
        },
        {
            name: "access",
            description: "Grant, deny or kick members from your channel.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelPermissionsAdapter",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelPermissionsAccessCommandAdapter",
            flowTransition: "VertixBot/Commands/VoiceAccess",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Default"
        },
        {
            name: "invite",
            description: "Invite a member to a channel.",
            tier: COMMAND_TIERS.ANY,
            adapterName: "VertixBot/UI-V3/DynamicChannelInviteCommandAdapter",
            flowTransition: "VertixBot/Commands/VoiceInvite",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelInviteCommandFlow/States/SelectUser"
        },
        {
            name: "claim",
            description: "Take over a channel whose owner has left.",
            tier: COMMAND_TIERS.ANY,
            adapterName: "VertixBot/UI-V3/ClaimCommandAdapter",
            adapterNameV2: "VertixBot/UI-V3/ClaimCommandAdapter",
            // The same interface for both, and named twice rather than left out. What this opens is
            // a list of channels across the whole server and a link into whichever one is picked -
            // neither of which belongs to a version. Left out, a member standing in a v2 channel
            // would be told the feature is missing from their generator's interface, which is the
            // answer for a feature v2 never had rather than for one that does not care.
            flowTransition: "VertixBot/Commands/VoiceClaim",
            flowTargetState: "VertixBot/UI-V3/ClaimCommandFlow/States/SelectChannel"
        },
        {
            name: "transfer",
            description: "Hand your channel over to another member.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelTransferOwnerCommandAdapter",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelTransferOwnerCommandAdapter",
            flowTransition: "VertixBot/Commands/VoiceTransfer",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelTransferOwnerCommandFlow/States/SelectUser"
        },
        {
            name: "region",
            description: "Change where your channel is hosted.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelRegionAdapter",
            flowTransition: "VertixBot/Commands/VoiceRegion",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default"
        },
        {
            name: "templates",
            description: "Save and apply your channel's settings.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelTemplatesCommandAdapter",
            flowTransition: "VertixBot/Commands/VoiceTemplates",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelTemplatesCommandFlow/States/Default"
        },
        {
            name: "message",
            description: "Edit the message shown on channels you create.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter",
            flowTransition: "VertixBot/Commands/VoiceMessage",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/Confirm"
        },
        {
            name: "reset",
            description: "Put your channel back to its default settings.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelResetChannelCommandAdapter",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelCommandAdapter",
            flowTransition: "VertixBot/Commands/VoiceReset",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelResetChannelCommandFlow/States/Success"
        },
        {
            name: "clear-chat",
            description: "Clear the messages in your channel.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelClearChatCommandAdapter",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandAdapter",
            flowTransition: "VertixBot/Commands/VoiceClearChat",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelClearChatCommandFlow/States/Success"
        },
        {
            name: "knock",
            description: "Ask the owner of a channel to let you in.",
            tier: COMMAND_TIERS.ANY,
            adapterName: "VertixBot/UI-V3/DynamicChannelKnockCommandAdapter",
            // As with `claim`: asking after somebody else's channel is the same act whichever
            // generator made it, so the one interface answers for both.
            adapterNameV2: "VertixBot/UI-V3/DynamicChannelKnockCommandAdapter",
            flowTransition: "VertixBot/Commands/VoiceKnock",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelKnockCommandFlow/States/SelectChannel"
        },
        {
            name: "panel",
            description: "Show your channel's buttons privately.",
            tier: COMMAND_TIERS.OWNER_OF_DYNAMIC,
            adapterName: "VertixBot/UI-V3/DynamicChannelAdapter",
            adapterNameV2: "VertixBot/UI-V2/DynamicChannelAdapter",
            flowTransition: "VertixBot/Commands/VoicePanel",
            flowTargetState: "VertixBot/UI-V3/DynamicChannelFlow/States/Default"
        }
    ]
};
