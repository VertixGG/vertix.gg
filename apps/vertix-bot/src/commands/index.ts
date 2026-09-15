import { createAdapterCommand, createCommandGroup } from "@vertix.gg/bot/src/commands/base/command-builder";

import {
    COMMAND_DEFINITIONS,
    COMMAND_GROUP_DEFINITIONS
} from "@vertix.gg/bot/src/commands/definitions";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";

/**
 * What Discord is told the bot has.
 *
 * Built from the definitions rather than written out a second time, so a command cannot be
 * registered without the flow router knowing about it or the other way round.
 */
export const Commands: ICommand[] = [
    ...COMMAND_DEFINITIONS.map( createAdapterCommand ),
    ...COMMAND_GROUP_DEFINITIONS.map( createCommandGroup )
];
