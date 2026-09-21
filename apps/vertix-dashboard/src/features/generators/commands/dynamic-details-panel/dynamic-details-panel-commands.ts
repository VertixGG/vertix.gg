import { CommandBase } from "@zenflux/react-commander/command-base";

export interface DynamicDetailsPanelState {
    showDeleteConfirm: boolean;
    tick: number;
}

export const DYNAMIC_DETAILS_PANEL_INITIAL_STATE: DynamicDetailsPanelState = {
    showDeleteConfirm: false,
    tick: 0
};

export class TickCommand extends CommandBase<DynamicDetailsPanelState> {
    public static getName() {
        return "Dashboard/Generators/DynamicDetailsPanel/Tick";
    }

    public apply() {
        return this.setState( { tick: this.state.tick + 1 } );
    }
}

export class ShowDeleteConfirmCommand extends CommandBase<DynamicDetailsPanelState> {
    public static getName() {
        return "Dashboard/Generators/DynamicDetailsPanel/ShowDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: true } );
    }
}

export class HideDeleteConfirmCommand extends CommandBase<DynamicDetailsPanelState> {
    public static getName() {
        return "Dashboard/Generators/DynamicDetailsPanel/HideDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: false } );
    }
}

export const DYNAMIC_DETAILS_PANEL_COMMANDS = [
    TickCommand,
    ShowDeleteConfirmCommand,
    HideDeleteConfirmCommand
] as const;
