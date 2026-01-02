import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelTemplatesComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

export class DynamicChannelTemplatesFlow extends UIFlowBase<string, string, UIFlowDataBase> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelTemplatesFlow";
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelTemplatesComponent ];
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/Menu": [
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenSaveModal",
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenApplyMenu",
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenManageMenu"
            ],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyMenu": [
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/ApplyTemplate"
            ],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ManageMenu": [
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/DeleteTemplate"
            ],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateSaved": [],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateApplied": [],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateDeleted": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenSaveModal":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateSaved",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenApplyMenu":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyMenu",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenManageMenu":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ManageMenu",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/ApplyTemplate":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateApplied",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/DeleteTemplate":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateDeleted"
        };
    }

    public static getRequiredData(): Record<string, ( keyof UIFlowDataBase )[]> {
        return {};
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
        return "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/Menu";
    }

    protected override getInitialData(): UIFlowDataBase {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelTemplatesFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelTemplatesFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelTemplatesFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelTemplatesFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof UIFlowDataBase )[] {
        return DynamicChannelTemplatesFlow.getRequiredData()[ transition ] ?? [];
    }
}

