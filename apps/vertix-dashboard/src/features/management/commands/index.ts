// Management Commands - Single source of truth for all management-related commands

// Import commands from individual files
import { LoadGuildCommand } from "./load-guild-command";
import { CreateScalingSetupCommand } from "./create-scaling-setup-command";
import { CreateDynamicSetupCommand } from "./create-dynamic-setup-command";
import { SelectMasterChannelCommand } from "./select-master-channel-command";
import { RefreshSelectedCommand } from "./refresh-selected-command";
import { UpdateScalingSettingsCommand } from "./update-scaling-settings-command";
import { TriggerReindexCommand } from "./trigger-reindex-command";
import { TriggerCleanupCommand } from "./trigger-cleanup-command";
import { DeleteScalingSetupCommand } from "./delete-scaling-setup-command";
import { UpdateDynamicSettingsCommand } from "./update-dynamic-settings-command";
import { DeleteDynamicSetupCommand } from "./delete-dynamic-setup-command";
import { ClearErrorCommand } from "./clear-error-command";
import { ShowCreateModalCommand } from "./show-create-modal-command";
import { HideCreateModalCommand } from "./hide-create-modal-command";

// State and types from base
export { MANAGEMENT_INITIAL_STATE } from "./base";
export type { ManagementState, CreateModalType } from "./base";

// Re-export commands
export {
    LoadGuildCommand,
    CreateScalingSetupCommand,
    CreateDynamicSetupCommand,
    SelectMasterChannelCommand,
    RefreshSelectedCommand,
    UpdateScalingSettingsCommand,
    TriggerReindexCommand,
    TriggerCleanupCommand,
    DeleteScalingSetupCommand,
    UpdateDynamicSettingsCommand,
    DeleteDynamicSetupCommand,
    ClearErrorCommand,
    ShowCreateModalCommand,
    HideCreateModalCommand
};

// Master Channel List commands
export {
    MASTER_CHANNEL_LIST_INITIAL_STATE,
    MASTER_CHANNEL_LIST_COMMANDS,
    SetSearchTermCommand as MasterChannelListSetSearchTermCommand,
    ClearSearchTermCommand as MasterChannelListClearSearchTermCommand
} from "./master-channel-list/master-channel-list-commands";

export type { MasterChannelListState } from "./master-channel-list/master-channel-list-commands";

// Scaling Details Panel commands
export {
    SCALING_CONFIG_FORM_INITIAL_STATE,
    SCALING_CONFIG_FORM_COMMANDS,
    InitializeCommand as ScalingConfigFormInitializeCommand,
    UpdatePrefixCommand as ScalingConfigFormUpdatePrefixCommand,
    UpdateMaxMembersCommand as ScalingConfigFormUpdateMaxMembersCommand,
    UpdateMinAvailableCommand as ScalingConfigFormUpdateMinAvailableCommand
} from "./scaling-details-panel/scaling-config-form-commands";

export type { ScalingConfigFormState } from "./scaling-details-panel/scaling-config-form-commands";

export {
    SCALING_DETAILS_PANEL_INITIAL_STATE,
    SCALING_DETAILS_PANEL_COMMANDS,
    TickCommand as ScalingDetailsPanelTickCommand,
    StartEditingCommand as ScalingDetailsPanelStartEditingCommand,
    StopEditingCommand as ScalingDetailsPanelStopEditingCommand,
    ShowDeleteConfirmCommand as ScalingDetailsPanelShowDeleteConfirmCommand,
    HideDeleteConfirmCommand as ScalingDetailsPanelHideDeleteConfirmCommand
} from "./scaling-details-panel/scaling-details-panel-commands";

export type { ScalingDetailsPanelState } from "./scaling-details-panel/scaling-details-panel-commands";

// Dynamic Details Panel commands
export {
    DYNAMIC_CONFIG_FORM_INITIAL_STATE,
    DYNAMIC_CONFIG_FORM_COMMANDS,
    InitializeCommand as DynamicConfigFormInitializeCommand,
    UpdateNameTemplateCommand as DynamicConfigFormUpdateNameTemplateCommand,
    UpdateAutoSaveCommand as DynamicConfigFormUpdateAutoSaveCommand,
    UpdateMentionableCommand as DynamicConfigFormUpdateMentionableCommand
} from "./dynamic-details-panel/dynamic-config-form-commands";

export type { DynamicConfigFormState } from "./dynamic-details-panel/dynamic-config-form-commands";

export {
    DYNAMIC_DETAILS_PANEL_INITIAL_STATE,
    DYNAMIC_DETAILS_PANEL_COMMANDS,
    TickCommand as DynamicDetailsPanelTickCommand,
    StartEditingCommand as DynamicDetailsPanelStartEditingCommand,
    StopEditingCommand as DynamicDetailsPanelStopEditingCommand,
    ShowDeleteConfirmCommand as DynamicDetailsPanelShowDeleteConfirmCommand,
    HideDeleteConfirmCommand as DynamicDetailsPanelHideDeleteConfirmCommand
} from "./dynamic-details-panel/dynamic-details-panel-commands";

export type { DynamicDetailsPanelState } from "./dynamic-details-panel/dynamic-details-panel-commands";

// Create Scaling Form commands
export {
    CREATE_SCALING_FORM_INITIAL_STATE,
    CREATE_SCALING_FORM_COMMANDS,
    UpdatePrefixCommand as CreateScalingFormUpdatePrefixCommand,
    UpdateMaxMembersCommand as CreateScalingFormUpdateMaxMembersCommand
} from "./create-scaling-form/create-scaling-form-commands";

export type { CreateScalingFormState } from "./create-scaling-form/create-scaling-form-commands";

// Create Dynamic Form commands
export {
    CREATE_DYNAMIC_FORM_INITIAL_STATE,
    CREATE_DYNAMIC_FORM_COMMANDS,
    UpdateNameTemplateCommand as CreateDynamicFormUpdateNameTemplateCommand,
    UpdateAutoSaveCommand as CreateDynamicFormUpdateAutoSaveCommand,
    UpdateMentionableCommand as CreateDynamicFormUpdateMentionableCommand,
    UpdateVersionCommand as CreateDynamicFormUpdateVersionCommand
} from "./create-dynamic-form/create-dynamic-form-commands";

export type { CreateDynamicFormState } from "./create-dynamic-form/create-dynamic-form-commands";

export const MANAGEMENT_COMMANDS = [
    LoadGuildCommand,
    CreateScalingSetupCommand,
    CreateDynamicSetupCommand,
    SelectMasterChannelCommand,
    RefreshSelectedCommand,
    UpdateScalingSettingsCommand,
    TriggerReindexCommand,
    TriggerCleanupCommand,
    DeleteScalingSetupCommand,
    UpdateDynamicSettingsCommand,
    DeleteDynamicSetupCommand,
    ClearErrorCommand,
    ShowCreateModalCommand,
    HideCreateModalCommand
] as const;
