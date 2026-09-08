import { CommandBase } from "@zenflux/react-commander/command-base";

import type { ScalingSettings } from "@vertix.gg/dashboard/src/features/generators/types";

export interface ScalingDetailsPanelState {
    isEditing: boolean;
    showDeleteConfirm: boolean;
    tick: number;
}

export const SCALING_DETAILS_PANEL_INITIAL_STATE: ScalingDetailsPanelState = {
    isEditing: false,
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

export class StartEditingCommand extends CommandBase<ScalingDetailsPanelState, { settings: ScalingSettings | null }> {
    public static getName() {
        return "Dashboard/Generators/ScalingDetailsPanel/StartEditing";
    }

    public apply() {
        return this.setState( { isEditing: true } );
    }
}

export class StopEditingCommand extends CommandBase<ScalingDetailsPanelState> {
    public static getName() {
        return "Dashboard/Generators/ScalingDetailsPanel/StopEditing";
    }

    public apply() {
        return this.setState( { isEditing: false } );
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
    StartEditingCommand,
    StopEditingCommand,
    ShowDeleteConfirmCommand,
    HideDeleteConfirmCommand
] as const;
