import { CommandBase } from "@zenflux/react-commander/command-base";

import type { GeneratorsState } from "./base";

export class HideCreateModalCommand extends CommandBase<GeneratorsState> {
    public static getName(): string {
        return "Dashboard/Generators/HideCreateModal";
    }

    public apply() {
        return this.setState( { showCreateModal: false, createModalType: null } );
    }
}
