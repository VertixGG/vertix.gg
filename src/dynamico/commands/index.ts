import { ICommand } from "@dynamico/interfaces/command";

import { Config } from "@dynamico/commands/config";
import { Setup } from "@dynamico/commands/setup";
import { Welcome } from "@dynamico/commands/welcome";

import Logger from "@internal/modules/logger";

export const Commands: ICommand[] = [
    Config,
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
