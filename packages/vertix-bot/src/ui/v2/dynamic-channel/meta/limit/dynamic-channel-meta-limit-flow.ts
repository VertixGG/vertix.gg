import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelMetaLimitComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelMetaLimitFlowData extends UIFlowDataBase {
    minValue?: number;
    maxValue?: number;
    userLimit?: number;
}

export class DynamicChannelMetaLimitFlow extends UIFlowBase<string, string, DynamicChannelMetaLimitFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V2/DynamicChannelMetaLimitFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/Default": [
                "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitInvalid",
                "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitSuccess",
                "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitError"
            ],
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/InvalidInput": [
                "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitSuccess",
                "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitError"
            ],
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/Success": [],
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitInvalid": "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/InvalidInput",
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitSuccess": "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/Success",
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitError": "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelMetaLimitFlowData )[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitInvalid": [ "minValue", "maxValue" ],
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitSuccess": [ "userLimit" ],
            "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/Transitions/SubmitError": []
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelMetaLimitComponent ];
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
        return "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelMetaLimitFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelMetaLimitFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelMetaLimitFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelMetaLimitFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelMetaLimitFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelMetaLimitFlowData )[] {
        return DynamicChannelMetaLimitFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelMetaLimitFlow;
