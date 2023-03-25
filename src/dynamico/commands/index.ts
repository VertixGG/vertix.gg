import { ICommand } from "@dynamico/interfaces/command";

import { Setup } from "@dynamico/commands/setup";
import { Welcome } from "@dynamico/commands/welcome";

import Logger from "@internal/modules/logger";

// TODO: Use index.ts to export all commands.
export const Commands: ICommand[] = [
    Setup,
    Welcome,
];

export const commandsLogger = new class CommandsLoggers extends Logger {
    public static getName(): string {
        return "Commands/Logger";
    }

    public constructor() {
        super( CommandsLoggers );
    }
};
