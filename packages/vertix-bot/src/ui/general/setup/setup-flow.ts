import {
    UIFlowBase,
    FlowIntegrationPointStandard
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import type { UIFlowData ,
    FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions as _TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

const STATE_INITIAL = "VertixBot/UI-General/SetupFlow/States/Initial";
const STATE_DONE = "VertixBot/UI-General/SetupFlow/States/Done";

export interface SetupFlowData extends UIFlowData {}

export class SetupFlow extends UIFlowBase<string, string, SetupFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/SetupFlow";
    }
    public static override getComponents() { return []; }

    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointStandard( {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Setup",
                targetState: STATE_INITIAL,
                description: "Entry point triggered by CommandsFlow via Setup command"
            } )
        ];
    }

    public override getPermissions(): PermissionsBitField { return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages ); }
    public override getChannelTypes(): ChannelType[] { return [ ChannelType.GuildText ]; }
    protected override getInitialState(): string { return STATE_INITIAL; }
    protected override getInitialData(): SetupFlowData { return {}; }
    protected override initializeTransitions(): void { this.addTransitions( STATE_INITIAL, [] ); }
    public override getAvailableTransitions(): string[] { return Array.from( this.getTransitionsForState( this.getCurrentState() ) || [] ); }
    public override getNextState( _transition: string ): string { return STATE_DONE; }
    public override getRequiredData( _transition: string ): ( keyof SetupFlowData )[] { return []; }
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) { this.setTransitionsForState( state, new Set() ); }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) { transitions.forEach( ( transition ) => stateTransitions.add( transition ) ); this.setTransitionsForState( state, stateTransitions ); }
    }
}
