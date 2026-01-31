import { CommandBase } from "@zenflux/react-commander/command-base";

import type { ManagementState, CreateModalType } from "./base";

export class ShowCreateModalCommand extends CommandBase<ManagementState, { type: CreateModalType }> {
    public static getName(): string {
        return "Dashboard/Management/ShowCreateModal";
    }

    public apply( args: { type: CreateModalType } ) {
        return this.setState( { showCreateModal: true, createModalType: args.type } );
    }
}
