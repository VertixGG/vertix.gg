import { ICommand } from "@vertix/interfaces/command";

import { Setup } from "@vertix/commands/setup";
import { Help } from "@vertix/commands/help";
import { Welcome } from "@vertix/commands/welcome";

export const Commands: ICommand[] = [
    Setup,
    Help,
    Welcome,
];
