import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

// import type { FlowIntegrationPoint , UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIFlowData ,
    FlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions as _TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

const STATE_INITIAL = "VertixBot/UI-General/HelpFlow/States/Initial";

export interface HelpFlowData extends UIFlowData {}

export class HelpFlow extends UIFlowBase<string, string, HelpFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/HelpFlow";
    }
    public static override getComponents() { return []; }

    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Help",
                targetState: STATE_INITIAL,
                description: "Entry point triggered by CommandsFlow via Help command"
            } )
        ];
    }

    public override getPermissions(): PermissionsBitField { return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages ); }
    public override getChannelTypes(): ChannelType[] { return [ ChannelType.GuildText ]; }
    protected override getInitialState(): string { return STATE_INITIAL; }
    protected override getInitialData(): HelpFlowData { return {}; }
    protected override initializeTransitions(): void { this.addTransitions( STATE_INITIAL, [] ); }
    public override getAvailableTransitions(): string[] { return Array.from( this.getTransitionsForState( this.getCurrentState() ) || [] ); }
    public override getNextState( _transition: string ): string { return STATE_INITIAL; }
    public override getRequiredData( _transition: string ): ( keyof HelpFlowData )[] { return []; }
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) { this.setTransitionsForState( state, new Set() ); }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) { transitions.forEach( ( transition ) => stateTransitions.add( transition ) ); this.setTransitionsForState( state, stateTransitions ); }
    }
}
