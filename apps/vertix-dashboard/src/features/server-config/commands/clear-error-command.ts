import { CommandBase } from "@zenflux/react-commander/command-base";

import type { ServerConfigState } from "./base";

export class ClearErrorCommand extends CommandBase<ServerConfigState> {
    public static getName(): string {
        return "Dashboard/ServerConfig/ClearError";
    }

    public apply() {
        return this.setState( { error: null } );
    }
}
