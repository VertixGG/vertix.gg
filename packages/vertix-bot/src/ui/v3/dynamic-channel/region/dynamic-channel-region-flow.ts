import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelRegionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelRegionFlowData extends UIFlowData {
    region?: string;
}

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelRegionFlow";

const STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;
const TRANSITION_SELECT_REGION = `${ FLOW_NAME }/Transitions/SelectRegion`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_DEFAULT ]: [ TRANSITION_SELECT_REGION ]
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_SELECT_REGION ]: STATE_DEFAULT
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelRegionFlowData )[]> = {
    [ TRANSITION_SELECT_REGION ]: [ "region" ]
};

/**
 * Flow that persists the selected region for a dynamic voice channel.
 */
export class DynamicChannelRegionFlow extends UIFlowBase<string, string, DynamicChannelRegionFlowData> {
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

    public static getRequiredData(): Record<string, ( keyof DynamicChannelRegionFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelRegionComponent ];
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

    protected override getInitialData(): DynamicChannelRegionFlowData {
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

    public override getRequiredData( transition: string ): ( keyof DynamicChannelRegionFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelRegionFlow;

