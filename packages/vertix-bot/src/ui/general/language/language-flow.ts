import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { LanguageComponent } from "@vertix.gg/bot/src/ui/general/language/language-component";

import type {
    UIFlowData,
    FlowIntegrationPointBase
} from "@vertix.gg/gui/src/bases/ui-flow-base";

export interface LanguageFlowData extends UIFlowData {
    selectedLanguage?: string;
}

export class LanguageFlow extends UIFlowBase<string, string, LanguageFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/LanguageFlow";
    }

    public static override getComponents() {
        return [ LanguageComponent ];
    }

    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/SetupFlow",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                targetState: "VertixBot/UI-General/LanguageFlow/States/Initial",
                description: "Entry point triggered by SetupFlow via Choose Language button"
            } )
        ];
    }

    public static getFlowTransitions(): Record<string, string[]> {
        const selectLanguage = "VertixBot/UI-General/LanguageFlow/Transitions/SelectLanguage";
        const done = "VertixBot/UI-General/LanguageFlow/Transitions/Done";

        return {
            "VertixBot/UI-General/LanguageFlow/States/Initial": [
                selectLanguage,
                done
            ],
            "VertixBot/UI-General/LanguageFlow/States/LanguageSelected": [
                selectLanguage,
                done
            ],
            "VertixBot/UI-General/LanguageFlow/States/Completed": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-General/LanguageFlow/Transitions/SelectLanguage": "VertixBot/UI-General/LanguageFlow/States/LanguageSelected",
            "VertixBot/UI-General/LanguageFlow/Transitions/Done": "VertixBot/UI-General/LanguageFlow/States/Completed"
        };
    }

    public static getRequiredData(): Record<string, ( keyof LanguageFlowData )[]> {
        return {
            "VertixBot/UI-General/LanguageFlow/Transitions/SelectLanguage": [ "selectedLanguage" ],
            "VertixBot/UI-General/LanguageFlow/Transitions/Done": []
        };
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages );
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildText ];
    }

    protected override getInitialState(): string {
        return "VertixBot/UI-General/LanguageFlow/States/Initial";
    }

    protected override getInitialData(): LanguageFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( LanguageFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return LanguageFlow.getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    public override getNextState( transition: string ): string {
        return LanguageFlow.getNextStates()[ transition ] || this.getCurrentState();
    }

    public override getRequiredData( transition: string ): ( keyof LanguageFlowData )[] {
        return LanguageFlow.getRequiredData()[ transition ] || [];
    }
}
