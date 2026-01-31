import { CommandBase } from "@zenflux/react-commander/command-base";

import type { ManagementState } from "./base";

export class HideCreateModalCommand extends CommandBase<ManagementState> {
    public static getName(): string {
        return "Dashboard/Management/HideCreateModal";
    }

    public apply() {
        return this.setState( { showCreateModal: false, createModalType: null } );
    }
}
