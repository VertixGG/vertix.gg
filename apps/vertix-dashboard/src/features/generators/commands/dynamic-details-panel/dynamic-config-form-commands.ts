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
    lfmChannelIds: string[];
    lfmPingRoleIds: string[];
    /** Null defers to the guild wide voice role. */
    voiceRoleId: string | null;
    logsChannelId: string | null;
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
    lfmChannelIds: [],
    lfmPingRoleIds: [],
    voiceRoleId: null,
    logsChannelId: null
};

export class InitializeCommand extends CommandBase<DynamicConfigFormState, { settings: DynamicSettings | null }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/Initialize";
    }

    /**
     * The settings as the api answered them, with nothing filled in here.
     *
     * The api resolves an unset setting against the bot's own configuration before it answers, so
     * every value below is what that generator would actually do. Filling a blank here instead
     * would be a third opinion about what a generator defaults to - and the one that had it wrong:
     * auto save and mentionable were both written the opposite way round from the bot, and this is
     * the state a save writes back.
     */
    public apply( args: { settings: DynamicSettings } ) {
        return this.setState( {
            nameTemplate: args.settings.dynamicChannelNameTemplate,
            autoSave: args.settings.dynamicChannelAutoSave,
            autoStatus: args.settings.dynamicChannelAutoStatus,
            mentionable: args.settings.dynamicChannelMentionable,
            defaultPrivacyState: args.settings.dynamicChannelDefaultPrivacyState,
            defaultUserLimit: args.settings.dynamicChannelDefaultUserLimit,
            verifiedRoles: args.settings.dynamicChannelVerifiedRoles,
            staffRoles: args.settings.dynamicChannelStaffRoles,
            lfmChannelIds: args.settings.dynamicChannelLfmChannelIds ?? [],
            lfmPingRoleIds: args.settings.dynamicChannelLfmPingRoleIds ?? [],
            voiceRoleId: args.settings.dynamicChannelVoiceRoleId,
            logsChannelId: args.settings.dynamicChannelLogsChannelId
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

export class UpdateLfmChannelsCommand extends CommandBase<DynamicConfigFormState, { value: string[] }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateLfmChannels";
    }

    public apply( args: { value: string[] } ) {
        return this.setState( { lfmChannelIds: args.value } );
    }
}

export class UpdateLfmPingRolesCommand extends CommandBase<DynamicConfigFormState, { value: string[] }> {
    public static getName() {
        return "Dashboard/Generators/DynamicConfigForm/UpdateLfmPingRoles";
    }

    public apply( args: { value: string[] } ) {
        return this.setState( { lfmPingRoleIds: args.value } );
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
    UpdateLfmChannelsCommand,
    UpdateLfmPingRolesCommand,
    UpdateVoiceRoleCommand,
    UpdateLogsChannelCommand
] as const;
