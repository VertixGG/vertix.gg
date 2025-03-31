import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import type { FlowIntegrationPoint , UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions as _TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

const STATE_INITIAL = "VertixBot/UI-General/HelpFlow/States/Initial";

export interface HelpFlowData extends UIFlowData {}

export class HelpFlow extends UIFlowBase<string, string, HelpFlowData> {
    public static getName(): string {
        return "VertixBot/UI-General/HelpFlow";
    }
    public static getComponents() { return []; }

    public static getEntryPoints(): FlowIntegrationPoint[] {
        return [
            {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Help",
                description: "Entry point triggered by CommandsFlow via Help transition"
            }
        ];
    }

    public getPermissions(): PermissionsBitField { return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages ); }
    public getChannelTypes(): ChannelType[] { return [ ChannelType.GuildText ]; }
    protected getInitialState(): string { return STATE_INITIAL; }
    protected getInitialData(): HelpFlowData { return {}; }
    protected initializeTransitions(): void { this.addTransitions( STATE_INITIAL, [] ); }
    public getAvailableTransitions(): string[] { return Array.from( this.getTransitionsForState( this.getCurrentState() ) || [] ); }
    public getNextState( _transition: string ): string { return STATE_INITIAL; } // Stay initial
    public getRequiredData( _transition: string ): ( keyof HelpFlowData )[] { return []; }
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) { this.setTransitionsForState( state, new Set() ); }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) { transitions.forEach( ( transition ) => stateTransitions.add( transition ) ); this.setTransitionsForState( state, stateTransitions ); }
    }
    protected showModal(): Promise<void> { return Promise.resolve(); }
}
