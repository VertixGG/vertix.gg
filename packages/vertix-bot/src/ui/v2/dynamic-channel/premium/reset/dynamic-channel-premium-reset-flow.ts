import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPremiumResetChannelComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelPremiumResetFlowData extends UIFlowDataBase {}

export class DynamicChannelPremiumResetFlow extends UIFlowBase<string, string, DynamicChannelPremiumResetFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V2/DynamicChannelPremiumResetFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/States/Default": [
                "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/Transitions/ResetSuccess",
                "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/Transitions/ResetError"
            ],
            "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/States/Success": [],
            "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/Transitions/ResetSuccess": "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/States/Success",
            "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/Transitions/ResetError": "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPremiumResetFlowData )[]> {
        return {};
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelPremiumResetChannelComponent ];
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
        return "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelPremiumResetFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelPremiumResetFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelPremiumResetFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelPremiumResetFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelPremiumResetFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPremiumResetFlowData )[] {
        return DynamicChannelPremiumResetFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelPremiumResetFlow;
