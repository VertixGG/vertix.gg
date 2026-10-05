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

    /**
     * Anyone in the server, and nothing is asked of the server either - not even that the bot can
     * manage channels. For a command that only describes the bot, which has to work in a server
     * that added it with no permissions at all: that is where somebody needs it most.
     */
    PUBLIC: "public",

    /** Server administrators. Discord enforces this one itself, from the command's declared permissions. */
    ADMIN: "admin"
} as const;

export type TCommandTier = typeof COMMAND_TIERS[ keyof typeof COMMAND_TIERS ];
