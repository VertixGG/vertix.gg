import { ICommand } from "@dynamico/interfaces/command";

import { Config } from "@dynamico/commands/config";
import { Setup } from "@dynamico/commands/setup";

import Logger from "@internal/modules/logger";

export const Commands: ICommand[] = [
    Config,
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
