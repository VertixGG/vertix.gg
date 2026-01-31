import { CommandBase } from "@zenflux/react-commander/command-base";

import type { ManagementState } from "./base";

export class ClearErrorCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/ClearError";
    }

    public apply() {
        return this.setState( { error: null } );
    }
}
