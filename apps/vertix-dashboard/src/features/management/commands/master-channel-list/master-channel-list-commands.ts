import { CommandBase } from "@zenflux/react-commander/command-base";

export interface MasterChannelListState {
    searchTerm: string;
}

export const MASTER_CHANNEL_LIST_INITIAL_STATE: MasterChannelListState = {
    searchTerm: ""
};

export class SetSearchTermCommand extends CommandBase<MasterChannelListState, { value: string }> {
    public static getName() {
        return "Dashboard/Management/MasterChannelList/SetSearchTerm";
    }

    public apply( args: { value: string } ) {
        return this.setState( { searchTerm: args.value } );
    }
}

export class ClearSearchTermCommand extends CommandBase<MasterChannelListState> {
    public static getName() {
        return "Dashboard/Management/MasterChannelList/ClearSearchTerm";
    }

    public apply() {
        return this.setState( { searchTerm: "" } );
    }
}

export const MASTER_CHANNEL_LIST_COMMANDS = [
    SetSearchTermCommand,
    ClearSearchTermCommand
] as const;
