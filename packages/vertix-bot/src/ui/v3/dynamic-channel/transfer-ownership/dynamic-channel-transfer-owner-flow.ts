import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

type DynamicChannelTransferOwnerFlowData = UIFlowData;

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow";

const STATE_SELECT_USER = `${ FLOW_NAME }/States/SelectUser`;
const STATE_CONFIRM = `${ FLOW_NAME }/States/Confirm`;
const STATE_SUCCESS = `${ FLOW_NAME }/States/Success`;
const STATE_CANCELLED = `${ FLOW_NAME }/States/Cancelled`;

const TRANSITION_OPEN = `${ FLOW_NAME }/Transitions/Open`;
const TRANSITION_USER_SELECTED = `${ FLOW_NAME }/Transitions/UserSelected`;
const TRANSITION_CONFIRM = `${ FLOW_NAME }/Transitions/Confirm`;
const TRANSITION_CANCEL = `${ FLOW_NAME }/Transitions/Cancel`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_SELECT_USER ]: [ TRANSITION_USER_SELECTED, TRANSITION_CANCEL ],
    [ STATE_CONFIRM ]: [ TRANSITION_CONFIRM, TRANSITION_CANCEL ],
    [ STATE_SUCCESS ]: [],
    [ STATE_CANCELLED ]: []
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_OPEN ]: STATE_SELECT_USER,
    [ TRANSITION_USER_SELECTED ]: STATE_CONFIRM,
    [ TRANSITION_CONFIRM ]: STATE_SUCCESS,
    [ TRANSITION_CANCEL ]: STATE_CANCELLED
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelTransferOwnerFlowData )[]> = {};

/**
 * Flow that guides an owner through transferring a dynamic channel.
 */
export class DynamicChannelTransferOwnerFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelTransferOwnerFlowData
> {
    public static override getName(): string {
        return FLOW_NAME;
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return FLOW_TRANSITIONS;
    }

    public static getNextStates(): Record<string, string> {
        return NEXT_STATES;
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelTransferOwnerFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelTransferOwnerComponent ];
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField();
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildVoice ];
    }

    protected override getInitialState(): string {
        return STATE_SELECT_USER;
    }

    protected override getInitialData(): DynamicChannelTransferOwnerFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( FLOW_TRANSITIONS ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return FLOW_TRANSITIONS[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = NEXT_STATES[ transition ];
        if ( !next ) {
            throw new Error( `${ FLOW_NAME }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelTransferOwnerFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelTransferOwnerFlow;

