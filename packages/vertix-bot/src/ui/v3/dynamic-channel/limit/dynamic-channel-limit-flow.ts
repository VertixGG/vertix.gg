import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelLimitComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelLimitFlowData extends UIFlowData {
    minValue?: number;
    maxValue?: number;
    userLimit?: number;
}

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelLimitFlow";

const STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;
const STATE_INVALID = `${ FLOW_NAME }/States/InvalidInput`;
const STATE_SUCCESS = `${ FLOW_NAME }/States/Success`;
const STATE_ERROR = `${ FLOW_NAME }/States/Error`;

const TRANSITION_INVALID = `${ FLOW_NAME }/Transitions/SubmitInvalid`;
const TRANSITION_SUCCESS = `${ FLOW_NAME }/Transitions/SubmitSuccess`;
const TRANSITION_ERROR = `${ FLOW_NAME }/Transitions/SubmitError`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_DEFAULT ]: [ TRANSITION_INVALID, TRANSITION_SUCCESS, TRANSITION_ERROR ],
    [ STATE_INVALID ]: [ TRANSITION_SUCCESS, TRANSITION_ERROR ],
    [ STATE_SUCCESS ]: [],
    [ STATE_ERROR ]: []
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_INVALID ]: STATE_INVALID,
    [ TRANSITION_SUCCESS ]: STATE_SUCCESS,
    [ TRANSITION_ERROR ]: STATE_ERROR
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelLimitFlowData )[]> = {
    [ TRANSITION_INVALID ]: [ "minValue", "maxValue" ],
    [ TRANSITION_SUCCESS ]: [ "userLimit" ],
    [ TRANSITION_ERROR ]: []
};

/**
 * Flow that handles the validation lifecycle for the dynamic channel limit modal.
 */
export class DynamicChannelLimitFlow extends UIFlowBase<string, string, DynamicChannelLimitFlowData> {
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

    public static getRequiredData(): Record<string, ( keyof DynamicChannelLimitFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelLimitComponent ];
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
        return STATE_DEFAULT;
    }

    protected override getInitialData(): DynamicChannelLimitFlowData {
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

    public override getRequiredData( transition: string ): ( keyof DynamicChannelLimitFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelLimitFlow;

