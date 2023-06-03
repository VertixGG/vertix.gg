import { ICommand } from "@vertix/interfaces/command";

import { Setup } from "@vertix/commands/setup";

import Logger from "@internal/modules/logger";

export const Commands: ICommand[] = [
    Setup,
];

export const commandsLogger = new class CommandsLoggers extends Logger {
    public static getName(): string {
        return "Commands/Logger";
    }

    public constructor() {
        super( CommandsLoggers );
    }
};
