import { CommandBase } from "@zenflux/react-commander/command-base";

import type { ScalingSettings } from "@vertix.gg/dashboard/src/features/management/types";

export interface ScalingConfigFormState {
    prefix: string;
    maxMembers: number;
    minAvailable: number;
}

export const SCALING_CONFIG_FORM_INITIAL_STATE: ScalingConfigFormState = {
    prefix: "",
    maxMembers: 0,
    minAvailable: 1
};

export class InitializeCommand extends CommandBase<ScalingConfigFormState, { settings: ScalingSettings | null }> {
    public static getName() {
        return "Dashboard/Management/ScalingConfigForm/Initialize";
    }

    public apply( args: { settings: ScalingSettings | null } ) {
        return this.setState( {
            prefix: args.settings?.scalingChannelPrefix || "",
            maxMembers: args.settings?.scalingChannelMaxMembersPerChannel || 0,
            minAvailable: args.settings?.scalingChannelMinAvailableChannels || 1
        } );
    }
}

export class UpdatePrefixCommand extends CommandBase<ScalingConfigFormState, { value: string }> {
    public static getName() {
        return "Dashboard/Management/ScalingConfigForm/UpdatePrefix";
    }

    public apply( args: { value: string } ) {
        return this.setState( { prefix: args.value } );
    }
}

export class UpdateMaxMembersCommand extends CommandBase<ScalingConfigFormState, { value: number }> {
    public static getName() {
        return "Dashboard/Management/ScalingConfigForm/UpdateMaxMembers";
    }

    public apply( args: { value: number } ) {
        return this.setState( { maxMembers: Math.max( 0, args.value ) } );
    }
}

export class UpdateMinAvailableCommand extends CommandBase<ScalingConfigFormState, { value: number }> {
    public static getName() {
        return "Dashboard/Management/ScalingConfigForm/UpdateMinAvailable";
    }

    public apply( args: { value: number } ) {
        return this.setState( { minAvailable: Math.max( 1, args.value ) } );
    }
}

export const SCALING_CONFIG_FORM_COMMANDS = [
    InitializeCommand,
    UpdatePrefixCommand,
    UpdateMaxMembersCommand,
    UpdateMinAvailableCommand
] as const;
