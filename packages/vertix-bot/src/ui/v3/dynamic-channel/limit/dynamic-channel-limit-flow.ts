import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelLimitComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelLimitFlowData extends UIFlowDataBase {
    minValue?: number;
    maxValue?: number;
    userLimit?: number;
}

/**
 * Flow that handles the validation lifecycle for the dynamic channel limit modal.
 */
export class DynamicChannelLimitFlow extends UIFlowBase<string, string, DynamicChannelLimitFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelLimitFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitInvalid",
                "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitSuccess",
                "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitError"
            ],
            "VertixBot/UI-V3/DynamicChannelLimitFlow/States/InvalidInput": [
                "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitSuccess",
                "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitError"
            ],
            "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Success": [],
            "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitInvalid": "VertixBot/UI-V3/DynamicChannelLimitFlow/States/InvalidInput",
            "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitSuccess": "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Success",
            "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitError": "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelLimitFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitInvalid": [ "minValue", "maxValue" ],
            "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitSuccess": [ "userLimit" ],
            "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitError": []
        };
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
        return "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelLimitFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelLimitFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelLimitFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelLimitFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelLimitFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelLimitFlowData )[] {
        return DynamicChannelLimitFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelLimitFlow;

