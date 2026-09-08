import { CommandBase } from "@zenflux/react-commander/command-base";

import type { GeneratorsState } from "./base";

export class ClearErrorCommand extends CommandBase<GeneratorsState> {
    public static getName(): string {
        return "Dashboard/Generators/ClearError";
    }

    public apply() {
        return this.setState( { error: null } );
    }
}
