import { CommandBase } from "@zenflux/react-commander/command-base";

import type { DynamicChannelVersion } from "@vertix.gg/dashboard/src/features/management/types";

export interface CreateDynamicFormState {
    version: DynamicChannelVersion;
    nameTemplate: string;
    autoSave: boolean;
    mentionable: boolean;
}

export const CREATE_DYNAMIC_FORM_INITIAL_STATE: CreateDynamicFormState = {
    version: "v3",
    nameTemplate: "{user}'s Channel",
    autoSave: false,
    mentionable: false
};

export class UpdateNameTemplateCommand extends CommandBase<CreateDynamicFormState, { value: string }> {
    public static getName() {
        return "Dashboard/Management/CreateDynamicForm/UpdateNameTemplate";
    }

    public apply( args: { value: string } ) {
        return this.setState( { nameTemplate: args.value } );
    }
}

export class UpdateAutoSaveCommand extends CommandBase<CreateDynamicFormState, { value: boolean }> {
    public static getName() {
        return "Dashboard/Management/CreateDynamicForm/UpdateAutoSave";
    }

    public apply( args: { value: boolean } ) {
        return this.setState( { autoSave: args.value } );
    }
}

export class UpdateMentionableCommand extends CommandBase<CreateDynamicFormState, { value: boolean }> {
    public static getName() {
        return "Dashboard/Management/CreateDynamicForm/UpdateMentionable";
    }

    public apply( args: { value: boolean } ) {
        return this.setState( { mentionable: args.value } );
    }
}

export class UpdateVersionCommand extends CommandBase<CreateDynamicFormState, { value: DynamicChannelVersion }> {
    public static getName() {
        return "Dashboard/Management/CreateDynamicForm/UpdateVersion";
    }

    public apply( args: { value: DynamicChannelVersion } ) {
        return this.setState( { version: args.value } );
    }
}

export const CREATE_DYNAMIC_FORM_COMMANDS = [
    UpdateNameTemplateCommand,
    UpdateAutoSaveCommand,
    UpdateMentionableCommand,
    UpdateVersionCommand
] as const;
