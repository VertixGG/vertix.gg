import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { ClaimStartComponent } from "@vertix.gg/bot/src/ui/v3/claim/start/claim-start-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface ClaimStartFlowData extends UIFlowData {}

/**
 * Flow that models the claim start interaction for dynamic channel ownership.
 */
export class ClaimStartFlow extends UIFlowBase<string, string, ClaimStartFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/ClaimStartFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/ClaimStartFlow/States/Default": [
                "VertixBot/UI-V3/ClaimStartFlow/Transitions/RequestClaim"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/ClaimStartFlow/Transitions/RequestClaim": "VertixBot/UI-V3/ClaimStartFlow/States/Default"
        };
    }

    public static getRequiredData(): Record<string, ( keyof ClaimStartFlowData )[]> {
        return {};
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ ClaimStartComponent ];
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
        return "VertixBot/UI-V3/ClaimStartFlow/States/Default";
    }

    protected override getInitialData(): ClaimStartFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( ClaimStartFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return ClaimStartFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = ClaimStartFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ ClaimStartFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof ClaimStartFlowData )[] {
        return ClaimStartFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default ClaimStartFlow;

