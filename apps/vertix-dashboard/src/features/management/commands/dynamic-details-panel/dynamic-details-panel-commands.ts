import { CommandBase } from "@zenflux/react-commander/command-base";

import type { DynamicSettings } from "@vertix.gg/dashboard/src/features/management/types";

export interface DynamicDetailsPanelState {
    isEditing: boolean;
    showDeleteConfirm: boolean;
    tick: number;
}

export const DYNAMIC_DETAILS_PANEL_INITIAL_STATE: DynamicDetailsPanelState = {
    isEditing: false,
    showDeleteConfirm: false,
    tick: 0
};

export class TickCommand extends CommandBase<DynamicDetailsPanelState> {
    public static getName() {
        return "Dashboard/Management/DynamicDetailsPanel/Tick";
    }

    public apply() {
        return this.setState( { tick: this.state.tick + 1 } );
    }
}

export class StartEditingCommand extends CommandBase<DynamicDetailsPanelState, { settings: DynamicSettings | null }> {
    public static getName() {
        return "Dashboard/Management/DynamicDetailsPanel/StartEditing";
    }

    public apply() {
        return this.setState( { isEditing: true } );
    }
}

export class StopEditingCommand extends CommandBase<DynamicDetailsPanelState> {
    public static getName() {
        return "Dashboard/Management/DynamicDetailsPanel/StopEditing";
    }

    public apply() {
        return this.setState( { isEditing: false } );
    }
}

export class ShowDeleteConfirmCommand extends CommandBase<DynamicDetailsPanelState> {
    public static getName() {
        return "Dashboard/Management/DynamicDetailsPanel/ShowDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: true } );
    }
}

export class HideDeleteConfirmCommand extends CommandBase<DynamicDetailsPanelState> {
    public static getName() {
        return "Dashboard/Management/DynamicDetailsPanel/HideDeleteConfirm";
    }

    public apply() {
        return this.setState( { showDeleteConfirm: false } );
    }
}

export const DYNAMIC_DETAILS_PANEL_COMMANDS = [
    TickCommand,
    StartEditingCommand,
    StopEditingCommand,
    ShowDeleteConfirmCommand,
    HideDeleteConfirmCommand
] as const;
