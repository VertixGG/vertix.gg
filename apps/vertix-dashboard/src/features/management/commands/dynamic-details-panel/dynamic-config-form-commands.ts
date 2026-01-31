import { CommandBase } from "@zenflux/react-commander/command-base";

import type { DynamicSettings } from "@vertix.gg/dashboard/src/features/management/types";

export interface DynamicConfigFormState {
    nameTemplate: string;
    autoSave: boolean;
    mentionable: boolean;
}

export const DYNAMIC_CONFIG_FORM_INITIAL_STATE: DynamicConfigFormState = {
    nameTemplate: "{username}'s Channel",
    autoSave: true,
    mentionable: false
};

export class InitializeCommand extends CommandBase<DynamicConfigFormState, { settings: DynamicSettings | null }> {
    public static getName() {
        return "Dashboard/Management/DynamicConfigForm/Initialize";
    }

    public apply( args: { settings: DynamicSettings | null } ) {
        return this.setState( {
            nameTemplate: args.settings?.dynamicChannelNameTemplate || "{username}'s Channel",
            autoSave: args.settings?.dynamicChannelAutoSave ?? true,
            mentionable: args.settings?.dynamicChannelMentionable ?? false
        } );
    }
}

export class UpdateNameTemplateCommand extends CommandBase<DynamicConfigFormState, { value: string }> {
    public static getName() {
        return "Dashboard/Management/DynamicConfigForm/UpdateNameTemplate";
    }

    public apply( args: { value: string } ) {
        return this.setState( { nameTemplate: args.value } );
    }
}

export class UpdateAutoSaveCommand extends CommandBase<DynamicConfigFormState, { value: boolean }> {
    public static getName() {
        return "Dashboard/Management/DynamicConfigForm/UpdateAutoSave";
    }

    public apply( args: { value: boolean } ) {
        return this.setState( { autoSave: args.value } );
    }
}

export class UpdateMentionableCommand extends CommandBase<DynamicConfigFormState, { value: boolean }> {
    public static getName() {
        return "Dashboard/Management/DynamicConfigForm/UpdateMentionable";
    }

    public apply( args: { value: boolean } ) {
        return this.setState( { mentionable: args.value } );
    }
}

export const DYNAMIC_CONFIG_FORM_COMMANDS = [
    InitializeCommand,
    UpdateNameTemplateCommand,
    UpdateAutoSaveCommand,
    UpdateMentionableCommand
] as const;
