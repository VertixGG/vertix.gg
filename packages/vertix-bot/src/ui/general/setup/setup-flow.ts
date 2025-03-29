import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";
import type { TAdapterRegisterOptions as _TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";

const STATE_INITIAL = "VertixBot/UI-General/SetupFlow/States/Initial";
const STATE_DONE = "VertixBot/UI-General/SetupFlow/States/Done";

export interface SetupFlowData extends UIFlowData {}

export class SetupFlow extends UIFlowBase<string, string, SetupFlowData> {
    public static getName(): string {
        return "VertixBot/UI-General/SetupFlow";
    }
    public static getComponents() { return []; }
    public getPermissions(): PermissionsBitField { return new PermissionsBitField(PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages); }
    public getChannelTypes(): ChannelType[] { return [ ChannelType.GuildText ]; }
    protected getInitialState(): string { return STATE_INITIAL; }
    protected getInitialData(): SetupFlowData { return {}; }
    protected initializeTransitions(): void { this.addTransitions(STATE_INITIAL, []); }
    public getAvailableTransitions(): string[] { return Array.from(this.getTransitionsForState(this.getCurrentState()) || []); }
    public getNextState( _transition: string ): string { return STATE_DONE; }
    public getRequiredData( _transition: string ): ( keyof SetupFlowData )[] { return []; }
    protected addTransitions( state: string, transitions: string[] ): void {
        if ( !this.hasTransitions( state ) ) { this.setTransitionsForState( state, new Set() ); }
        const stateTransitions = this.getTransitionsForState( state );
        if ( stateTransitions ) { transitions.forEach( ( transition ) => stateTransitions.add( transition ) ); this.setTransitionsForState( state, stateTransitions ); }
    }
    protected showModal(): Promise<void> { return Promise.resolve(); }
}
