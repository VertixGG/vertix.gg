import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { ClaimStartComponent } from "@vertix.gg/bot/src/ui/v3/claim/start/claim-start-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface ClaimStartFlowData extends UIFlowData {}

const FLOW_NAME = "VertixBot/UI-V3/ClaimStartFlow";

const STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;
const TRANSITION_REQUEST = `${ FLOW_NAME }/Transitions/RequestClaim`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_DEFAULT ]: [ TRANSITION_REQUEST ]
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_REQUEST ]: STATE_DEFAULT
};

const REQUIRED_DATA: Record<string, ( keyof ClaimStartFlowData )[]> = {};

/**
 * Flow that models the claim start interaction for dynamic channel ownership.
 */
export class ClaimStartFlow extends UIFlowBase<string, string, ClaimStartFlowData> {
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

    public static getRequiredData(): Record<string, ( keyof ClaimStartFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ ClaimStartComponent ];
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

    protected override getInitialData(): ClaimStartFlowData {
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

    public override getRequiredData( transition: string ): ( keyof ClaimStartFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default ClaimStartFlow;

