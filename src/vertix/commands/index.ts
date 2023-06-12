import { ICommand } from "@vertix/interfaces/command";

import { Setup } from "@vertix/commands/setup";
import { Help } from "@vertix/commands/help";

export const Commands: ICommand[] = [
    Setup,
    Help,
];
