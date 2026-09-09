import { LoadServerConfigCommand } from "./load-server-config-command";
import { UpdateServerConfigCommand } from "./update-server-config-command";

export { SERVER_CONFIG_INITIAL_STATE } from "./base";
export type { ServerConfigState } from "./base";

export {
    LoadServerConfigCommand,
    UpdateServerConfigCommand
};

export const SERVER_CONFIG_COMMANDS = [
    LoadServerConfigCommand,
    UpdateServerConfigCommand
] as const;
