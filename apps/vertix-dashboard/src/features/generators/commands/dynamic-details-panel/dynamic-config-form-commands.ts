import { CommandBase } from "@zenflux/react-commander/command-base";

import type { ChannelPrivacyState, DynamicSettings } from "@vertix.gg/dashboard/src/features/generators/types";

export interface DynamicConfigFormState {
    nameTemplate: string;
    autoSave: boolean;
    autoStatus: boolean;
    mentionable: boolean;
    defaultPrivacyState: ChannelPrivacyState;
    /** Null is "copy the generator's own limit"; the field is empty for it. */
    defaultUserLimit: number | null;
    verifiedRoles: string[];
    staffRoles: string[];
    /** Null defers to the guild wide voice role. */
    voiceRoleId: string | null;
    logsChannelId: string | null;
    /** Empty until the catalogue lands, which is why the form initialises from the settings. */
    buttons: string[];
}

/**
 * What a generator's settings are when the stored row says nothing - the same defaults the bot
 * falls back to, so an untouched form saves what the channel already does.
 */
export const DYNAMIC_CONFIG_FORM_INITIAL_STATE: DynamicConfigFormState = {
    nameTemplate: "{user}'s Channel",
    autoSave: true,
    autoStatus: true,
    mentionable: false,
    defaultPrivacyState: "public",
    defaultUserLimit: null,
    verifiedRoles: [],
    staffRoles: [],
    voiceRoleId: null,
    logsChannelId: null,
    buttons: []
};

export class InitializeCommand extends CommandBase<DynamicConfigFormState, { settings: DynamicSettings | null }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/Initialize";
    }

    public apply( args: { settings: DynamicSettings | null } ) {
        return this.setState( {
            nameTemplate: args.settings?.dynamicChannelNameTemplate || "{user}'s Channel",
            autoSave: args.settings?.dynamicChannelAutoSave ?? true,
            autoStatus: args.settings?.dynamicChannelAutoStatus ?? true,
            mentionable: args.settings?.dynamicChannelMentionable ?? false,
            defaultPrivacyState: args.settings?.dynamicChannelDefaultPrivacyState ?? "public",
            defaultUserLimit: args.settings?.dynamicChannelDefaultUserLimit ?? null,
            verifiedRoles: args.settings?.dynamicChannelVerifiedRoles ?? [],
            staffRoles: args.settings?.dynamicChannelStaffRoles ?? [],
            voiceRoleId: args.settings?.dynamicChannelVoiceRoleId ?? null,
            logsChannelId: args.settings?.dynamicChannelLogsChannelId ?? null,
            buttons: args.settings?.dynamicChannelButtonsTemplate ?? []
        } );
    }
}

export class UpdateNameTemplateCommand extends CommandBase<DynamicConfigFormState, { value: string }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateNameTemplate";
    }

    public apply( args: { value: string } ) {
        return this.setState( { nameTemplate: args.value } );
    }
}

export class UpdateAutoSaveCommand extends CommandBase<DynamicConfigFormState, { value: boolean }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateAutoSave";
    }

    public apply( args: { value: boolean } ) {
        return this.setState( { autoSave: args.value } );
    }
}

export class UpdateAutoStatusCommand extends CommandBase<DynamicConfigFormState, { value: boolean }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateAutoStatus";
    }

    public apply( args: { value: boolean } ) {
        return this.setState( { autoStatus: args.value } );
    }
}

export class UpdateMentionableCommand extends CommandBase<DynamicConfigFormState, { value: boolean }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateMentionable";
    }

    public apply( args: { value: boolean } ) {
        return this.setState( { mentionable: args.value } );
    }
}

export class UpdateDefaultPrivacyStateCommand extends CommandBase<DynamicConfigFormState, { value: ChannelPrivacyState }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateDefaultPrivacyState";
    }

    public apply( args: { value: ChannelPrivacyState } ) {
        return this.setState( { defaultPrivacyState: args.value } );
    }
}

export class UpdateDefaultUserLimitCommand extends CommandBase<DynamicConfigFormState, { value: number | null }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateDefaultUserLimit";
    }

    public apply( args: { value: number | null } ) {
        return this.setState( { defaultUserLimit: args.value } );
    }
}

export class UpdateVerifiedRolesCommand extends CommandBase<DynamicConfigFormState, { value: string[] }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateVerifiedRoles";
    }

    public apply( args: { value: string[] } ) {
        return this.setState( { verifiedRoles: args.value } );
    }
}

export class UpdateStaffRolesCommand extends CommandBase<DynamicConfigFormState, { value: string[] }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateStaffRoles";
    }

    public apply( args: { value: string[] } ) {
        return this.setState( { staffRoles: args.value } );
    }
}

export class UpdateVoiceRoleCommand extends CommandBase<DynamicConfigFormState, { value: string | null }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateVoiceRole";
    }

    public apply( args: { value: string | null } ) {
        return this.setState( { voiceRoleId: args.value } );
    }
}

export class UpdateLogsChannelCommand extends CommandBase<DynamicConfigFormState, { value: string | null }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateLogsChannel";
    }

    public apply( args: { value: string | null } ) {
        return this.setState( { logsChannelId: args.value } );
    }
}

export class UpdateButtonsCommand extends CommandBase<DynamicConfigFormState, { value: string[] }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateButtons";
    }

    public apply( args: { value: string[] } ) {
        return this.setState( { buttons: args.value } );
    }
}

export const DYNAMIC_CONFIG_FORM_COMMANDS = [
    InitializeCommand,
    UpdateNameTemplateCommand,
    UpdateAutoSaveCommand,
    UpdateAutoStatusCommand,
    UpdateMentionableCommand,
    UpdateDefaultPrivacyStateCommand,
    UpdateDefaultUserLimitCommand,
    UpdateVerifiedRolesCommand,
    UpdateStaffRolesCommand,
    UpdateVoiceRoleCommand,
    UpdateLogsChannelCommand,
    UpdateButtonsCommand
] as const;
