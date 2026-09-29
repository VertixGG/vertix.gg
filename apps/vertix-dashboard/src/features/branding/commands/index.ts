import { LoadBrandingCommand } from "@vertix.gg/dashboard/src/features/branding/commands/load-branding-command";
import { PickImageCommand } from "@vertix.gg/dashboard/src/features/branding/commands/pick-image-command";
import { SaveBrandingCommand } from "@vertix.gg/dashboard/src/features/branding/commands/save-branding-command";

import {
    ClearImageCommand,
    DiscardChangesCommand,
    UpdateBioCommand,
    UpdateNickCommand
} from "@vertix.gg/dashboard/src/features/branding/commands/draft-commands";

import {
    HideRemoveConfirmCommand,
    RemoveBrandingCommand,
    ShowRemoveConfirmCommand
} from "@vertix.gg/dashboard/src/features/branding/commands/remove-branding-commands";

import {
    ClearErrorCommand,
    DismissReportCommand
} from "@vertix.gg/dashboard/src/features/branding/commands/notice-commands";

export { BRANDING_INITIAL_STATE } from "@vertix.gg/dashboard/src/features/branding/commands/base";
export type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands/base";

export const BRANDING_COMMANDS = [
    LoadBrandingCommand,
    UpdateNickCommand,
    UpdateBioCommand,
    PickImageCommand,
    ClearImageCommand,
    DiscardChangesCommand,
    SaveBrandingCommand,
    ShowRemoveConfirmCommand,
    HideRemoveConfirmCommand,
    RemoveBrandingCommand,
    ClearErrorCommand,
    DismissReportCommand
] as const;
