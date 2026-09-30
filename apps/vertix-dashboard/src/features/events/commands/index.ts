import { LoadEventsCommand } from "@vertix.gg/dashboard/src/features/events/commands/load-events-command";
import { SaveEventsSettingsCommand } from "@vertix.gg/dashboard/src/features/events/commands/save-events-settings-command";

import {
    ClearErrorCommand,
    CloseRunCommand,
    LoadMoreRunsCommand,
    OpenRunCommand
} from "@vertix.gg/dashboard/src/features/events/commands/runs-commands";

export { EVENTS_INITIAL_STATE } from "@vertix.gg/dashboard/src/features/events/commands/base";
export type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands/base";

export const EVENTS_COMMANDS = [
    LoadEventsCommand,
    SaveEventsSettingsCommand,
    LoadMoreRunsCommand,
    OpenRunCommand,
    CloseRunCommand,
    ClearErrorCommand
] as const;
