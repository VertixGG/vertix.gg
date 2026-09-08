import { CommandBase } from "@zenflux/react-commander/command-base";

import type { GeneratorsState, CreateModalType } from "./base";

export class ShowCreateModalCommand extends CommandBase<GeneratorsState, { type: CreateModalType }> {
    public static getName(): string {
        return "Dashboard/Generators/ShowCreateModal";
    }

    public apply( args: { type: CreateModalType } ) {
        return this.setState( { showCreateModal: true, createModalType: args.type } );
    }
}
