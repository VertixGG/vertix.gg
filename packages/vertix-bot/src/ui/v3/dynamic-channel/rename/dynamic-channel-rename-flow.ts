import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelRenameComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelRenameFlowData extends UIFlowData {
    badword?: string;
    retryAfter?: number;
    masterChannelId?: string;
}

/**
 * Flow that captures the rename submission lifecycle for dynamic channels.
 */
export class DynamicChannelRenameFlow extends UIFlowBase<string, string, DynamicChannelRenameFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelRenameFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Initial": [
                "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameSuccess",
                "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameBadword",
                "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameRateLimited"
            ],
            "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Success": [],
            "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Badword": [],
            "VertixBot/UI-V3/DynamicChannelRenameFlow/States/RateLimited": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameSuccess": "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Success",
            "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameBadword": "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Badword",
            "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameRateLimited": "VertixBot/UI-V3/DynamicChannelRenameFlow/States/RateLimited"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelRenameFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameSuccess": [],
            "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameBadword": [ "badword" ],
            "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitRenameRateLimited": [ "retryAfter", "masterChannelId" ]
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelRenameComponent ];
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
        return "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Initial";
    }

    protected override getInitialData(): DynamicChannelRenameFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelRenameFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelRenameFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelRenameFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelRenameFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelRenameFlowData )[] {
        return DynamicChannelRenameFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelRenameFlow;

