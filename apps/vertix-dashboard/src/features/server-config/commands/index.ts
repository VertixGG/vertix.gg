import { LoadServerConfigCommand } from "./load-server-config-command";
import { UpdateServerConfigCommand } from "./update-server-config-command";
import { ClearErrorCommand } from "./clear-error-command";

export { SERVER_CONFIG_INITIAL_STATE } from "./base";
export type { ServerConfigState } from "./base";

export {
    LoadServerConfigCommand,
    UpdateServerConfigCommand,
    ClearErrorCommand
};

export const SERVER_CONFIG_COMMANDS = [
    LoadServerConfigCommand,
    UpdateServerConfigCommand,
    ClearErrorCommand
] as const;
