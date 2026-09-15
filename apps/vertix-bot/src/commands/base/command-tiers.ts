/**
 * Who is allowed to run a command.
 *
 * A dynamic channel's control panel already answers this question for every button it draws, and
 * these are the same four answers it gives. Named here so a subcommand states which one it wants
 * rather than carrying its own copy of the check - the tier is a property of what is being asked
 * for, not of the way it was asked for, so a button and a slash command that do the same thing
 * clear the same gate.
 */
export const COMMAND_TIERS = {
    /** The caller must own the dynamic channel they are standing in. */
    OWNER_OF_DYNAMIC: "owner",

    /** Anyone in the server. The command's own handler decides what it will do for them. */
    ANY: "any",

    /** Anyone, but only from inside a dynamic channel - there is no channel a command typed elsewhere could mean. */
    IN_CHANNEL: "in-channel",

    /** Server administrators. Discord enforces this one itself, from the command's declared permissions. */
    ADMIN: "admin"
} as const;

export type TCommandTier = typeof COMMAND_TIERS[ keyof typeof COMMAND_TIERS ];
