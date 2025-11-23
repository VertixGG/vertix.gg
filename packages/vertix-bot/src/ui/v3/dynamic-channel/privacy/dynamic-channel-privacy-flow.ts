import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPrivacyComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

type DynamicChannelPrivacyFlowData = UIFlowData;

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelPrivacyFlow";

const STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;
const TRANSITION_UPDATE = `${ FLOW_NAME }/Transitions/UpdatePrivacyState`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_DEFAULT ]: [ TRANSITION_UPDATE ]
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_UPDATE ]: STATE_DEFAULT
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelPrivacyFlowData )[]> = {};

/**
 * Flow that captures privacy toggles for a dynamic channel.
 */
export class DynamicChannelPrivacyFlow extends UIFlowBase<string, string, DynamicChannelPrivacyFlowData> {
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

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPrivacyFlowData )[]> {
        return REQUIRED_DATA;
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
        return STATE_DEFAULT;
    }

    protected override getInitialData(): DynamicChannelPrivacyFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        this.setTransitionsForState( STATE_DEFAULT, new Set( FLOW_TRANSITIONS[ STATE_DEFAULT ] ) );
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

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPrivacyFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelPrivacyFlow;

