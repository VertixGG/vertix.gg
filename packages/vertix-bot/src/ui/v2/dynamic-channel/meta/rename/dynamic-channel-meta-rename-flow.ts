import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelMetaRenameComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelMetaRenameFlowData extends UIFlowDataBase {
    badword?: string;
    retryAfter?: number;
    masterChannelId?: string;
}

export class DynamicChannelMetaRenameFlow extends UIFlowBase<string, string, DynamicChannelMetaRenameFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V2/DynamicChannelMetaRenameFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/Initial": [
                "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameSuccess",
                "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameBadword",
                "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameRateLimited"
            ],
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/Success": [],
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/Badword": [],
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/RateLimited": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameSuccess": "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/Success",
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameBadword": "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/Badword",
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameRateLimited": "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/RateLimited"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelMetaRenameFlowData )[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameSuccess": [],
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameBadword": [ "badword" ],
            "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/Transitions/SubmitRenameRateLimited": [ "retryAfter", "masterChannelId" ]
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelMetaRenameComponent ];
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
        return "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/Initial";
    }

    protected override getInitialData(): DynamicChannelMetaRenameFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelMetaRenameFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelMetaRenameFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelMetaRenameFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelMetaRenameFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelMetaRenameFlowData )[] {
        return DynamicChannelMetaRenameFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelMetaRenameFlow;
