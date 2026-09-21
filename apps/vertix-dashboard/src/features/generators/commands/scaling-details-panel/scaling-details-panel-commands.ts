import { CommandBase } from "@zenflux/react-commander/command-base";

export interface ScalingDetailsPanelState {
    showDeleteConfirm: boolean;
    tick: number;
}

export const SCALING_DETAILS_PANEL_INITIAL_STATE: ScalingDetailsPanelState = {
    showDeleteConfirm: false,
    tick: 0
};

export class TickCommand extends CommandBase<ScalingDetailsPanelState> {
    public static getName() {
        return "Dashboard/Generators/ScalingDetailsPanel/Tick";
    }

    public apply() {
        return this.setState( { tick: this.state.tick + 1 } );
    }
}

export class ShowDeleteConfirmCommand extends CommandBase<ScalingDetailsPanelState> {
    public static getName() {
        return "Dashboard/Generators/ScalingDetailsPanel/ShowDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: true } );
    }
}

export class HideDeleteConfirmCommand extends CommandBase<ScalingDetailsPanelState> {
    public static getName() {
        return "Dashboard/Generators/ScalingDetailsPanel/HideDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: false } );
    }
}

export const SCALING_DETAILS_PANEL_COMMANDS = [
    TickCommand,
    ShowDeleteConfirmCommand,
    HideDeleteConfirmCommand
] as const;
