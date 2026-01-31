import { CommandBase } from "@zenflux/react-commander/command-base";

export interface CreateScalingFormState {
    prefix: string;
    maxMembers: number;
}

export const CREATE_SCALING_FORM_INITIAL_STATE: CreateScalingFormState = {
    prefix: "### Room - {index} ###",
    maxMembers: 10
};

export class UpdatePrefixCommand extends CommandBase<CreateScalingFormState, { value: string }> {
    public static getName() {
        return "Dashboard/Management/CreateScalingForm/UpdatePrefix";
    }

    public apply( args: { value: string } ) {
        return this.setState( { prefix: args.value } );
    }
}

export class UpdateMaxMembersCommand extends CommandBase<CreateScalingFormState, { value: number }> {
    public static getName() {
        return "Dashboard/Management/CreateScalingForm/UpdateMaxMembers";
    }

    public apply( args: { value: number } ) {
        return this.setState( { maxMembers: Math.max( 0, args.value ) } );
    }
}

export const CREATE_SCALING_FORM_COMMANDS = [
    UpdatePrefixCommand,
    UpdateMaxMembersCommand
] as const;
