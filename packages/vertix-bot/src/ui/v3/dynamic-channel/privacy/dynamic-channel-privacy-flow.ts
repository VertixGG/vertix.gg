import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPrivacyComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

type DynamicChannelPrivacyFlowData = UIFlowData;

/**
 * Flow that captures privacy toggles for a dynamic channel.
 */
export class DynamicChannelPrivacyFlow extends UIFlowBase<string, string, DynamicChannelPrivacyFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelPrivacyFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState": "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPrivacyFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState": [ "state" ]
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelPrivacyComponent ];
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
        return "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelPrivacyFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        this.setTransitionsForState(
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default",
            new Set( DynamicChannelPrivacyFlow.getFlowTransitions()[ "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default" ] )
        );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelPrivacyFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelPrivacyFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelPrivacyFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPrivacyFlowData )[] {
        return DynamicChannelPrivacyFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelPrivacyFlow;

