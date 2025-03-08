import { Setup } from "@vertix.gg/bot/src/commands/setup";
import { Help } from "@vertix.gg/bot/src/commands/help";
import { Welcome } from "@vertix.gg/bot/src/commands/welcome";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";

export const Commands: ICommand[] = [Setup, Help, Welcome];
