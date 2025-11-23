import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelRegionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelRegionFlowData extends UIFlowData {
    region?: string;
}

/**
 * Flow that persists the selected region for a dynamic voice channel.
 */
export class DynamicChannelRegionFlow extends UIFlowBase<string, string, DynamicChannelRegionFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelRegionFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelRegionFlow/Transitions/SelectRegion"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelRegionFlow/Transitions/SelectRegion": "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelRegionFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelRegionFlow/Transitions/SelectRegion": [ "region" ]
        };
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
        return "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelRegionFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelRegionFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelRegionFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelRegionFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelRegionFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelRegionFlowData )[] {
        return DynamicChannelRegionFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelRegionFlow;

