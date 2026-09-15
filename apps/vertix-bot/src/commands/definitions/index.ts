import { GENERAL_COMMAND_DEFINITIONS } from "@vertix.gg/bot/src/commands/definitions/general-commands";
import { VOICE_COMMAND_GROUP } from "@vertix.gg/bot/src/commands/definitions/voice-commands";
import { MANAGE_COMMAND_GROUP } from "@vertix.gg/bot/src/commands/definitions/manage-commands";

import type {
    ICommandDefinition,
    ICommandGroupDefinition
} from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/**
 * Every command the bot has, as data.
 *
 * Two readers: the builder, which turns these into the commands Discord registers, and the flow
 * router, which turns the same list into its transitions. Neither keeps a second copy - a command
 * that is not here does not exist, in either of them.
 */
export const COMMAND_DEFINITIONS: ICommandDefinition[] = GENERAL_COMMAND_DEFINITIONS;

export const COMMAND_GROUP_DEFINITIONS: ICommandGroupDefinition[] = [ VOICE_COMMAND_GROUP, MANAGE_COMMAND_GROUP ];

/**
 * Function getAllCommandDefinitions() :: Every command, flattened out of its group.
 *
 * What a caller typed is `/voice rename`, but what the flow router routes is the one command that
 * reaches the rename interface. A group is how commands are arranged, not a thing that runs.
 */
export function getAllCommandDefinitions(): ICommandDefinition[] {
    return [
        ...COMMAND_DEFINITIONS,
        ...COMMAND_GROUP_DEFINITIONS.flatMap( ( group ) => group.subcommands )
    ];
}
