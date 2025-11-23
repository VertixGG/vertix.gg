import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelRenameComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelRenameFlowData extends UIFlowData {
    badword?: string;
    retryAfter?: number;
    masterChannelId?: string;
}

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelRenameFlow";

const STATE_INITIAL = `${ FLOW_NAME }/States/Initial`;
const STATE_SUCCESS = `${ FLOW_NAME }/States/Success`;
const STATE_BADWORD = `${ FLOW_NAME }/States/Badword`;
const STATE_RATE_LIMITED = `${ FLOW_NAME }/States/RateLimited`;

const TRANSITION_SUCCESS = `${ FLOW_NAME }/Transitions/SubmitRenameSuccess`;
const TRANSITION_BADWORD = `${ FLOW_NAME }/Transitions/SubmitRenameBadword`;
const TRANSITION_RATE_LIMITED = `${ FLOW_NAME }/Transitions/SubmitRenameRateLimited`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_INITIAL ]: [
        TRANSITION_SUCCESS,
        TRANSITION_BADWORD,
        TRANSITION_RATE_LIMITED
    ],
    [ STATE_SUCCESS ]: [],
    [ STATE_BADWORD ]: [],
    [ STATE_RATE_LIMITED ]: []
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_SUCCESS ]: STATE_SUCCESS,
    [ TRANSITION_BADWORD ]: STATE_BADWORD,
    [ TRANSITION_RATE_LIMITED ]: STATE_RATE_LIMITED
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelRenameFlowData )[]> = {
    [ TRANSITION_SUCCESS ]: [],
    [ TRANSITION_BADWORD ]: [ "badword" ],
    [ TRANSITION_RATE_LIMITED ]: [ "retryAfter", "masterChannelId" ]
};

/**
 * Flow that captures the rename submission lifecycle for dynamic channels.
 */
export class DynamicChannelRenameFlow extends UIFlowBase<string, string, DynamicChannelRenameFlowData> {
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

    public static getRequiredData(): Record<string, ( keyof DynamicChannelRenameFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelRenameComponent ];
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
        return STATE_INITIAL;
    }

    protected override getInitialData(): DynamicChannelRenameFlowData {
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

    public override getRequiredData( transition: string ): ( keyof DynamicChannelRenameFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelRenameFlow;

