import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { SetupNewWizardFlow } from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-flow";
import { LanguageFlow } from "@vertix.gg/bot/src/ui/general/language/language-flow";

import { SetupComponent } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";

import type {
    UIFlowData,
    FlowIntegrationPointBase
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { VisualConnection } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

export interface SetupFlowData extends UIFlowData {}

export class SetupFlow extends UIFlowBase<string, string, SetupFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/SetupFlow";
    }

    public static override getComponents() {
        return [ SetupComponent ];
    }

    public static override getEntryPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Setup",
                targetState: "VertixBot/UI-General/SetupFlow/States/Initial",
                description: "Entry point triggered by CommandsFlow via Setup command"
            } )
        ];
    }

    public static override getHandoffPoints(): FlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: SetupNewWizardFlow.getName(),
                description: "Handoff to V3 Setup Wizard when Create V3 button is clicked",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV3",
                requiredData: []
            } ),
            new FlowIntegrationPointGeneric( {
                flowName: LanguageFlow.getName(),
                description: "Handoff to Language selection flow",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                requiredData: []
            } )
        ];
    }

    public static override getEdgeSourceMappings(): VisualConnection[] {
        return [
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterCreateButton",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV2",
                targetFlowName: "VertixBot/UI-General/SetupFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterCreateV3Button",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV3",
                targetFlowName: SetupNewWizardFlow.getName()
            },
            {
                triggeringElementId: "VertixBot/UI-General/LanguageChooseButton",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                targetFlowName: LanguageFlow.getName()
            },
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterEditSelectMenu",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            }
        ];
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-General/SetupFlow/States/Initial": [
                "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV2",
                "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV3",
                "VertixBot/UI-General/SetupFlow/Transitions/EditMaster",
                "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                "VertixBot/UI-General/SetupFlow/Transitions/OpenBadwordsModal",
                "VertixBot/UI-General/SetupFlow/Transitions/SubmitBadwords"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV2": "VertixBot/UI-General/SetupFlow/States/Initial",
            "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV3": "VertixBot/UI-General/SetupFlow/States/Initial",
            "VertixBot/UI-General/SetupFlow/Transitions/EditMaster": "VertixBot/UI-General/SetupFlow/States/Initial",
            "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage": "VertixBot/UI-General/SetupFlow/States/Initial",
            "VertixBot/UI-General/SetupFlow/Transitions/OpenBadwordsModal": "VertixBot/UI-General/SetupFlow/States/Initial",
            "VertixBot/UI-General/SetupFlow/Transitions/SubmitBadwords": "VertixBot/UI-General/SetupFlow/States/Initial"
        };
    }

    public static getRequiredData(): Record<string, ( keyof SetupFlowData )[]> {
        return {
            "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV2": [],
            "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV3": [],
            "VertixBot/UI-General/SetupFlow/Transitions/EditMaster": [],
            "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage": [],
            "VertixBot/UI-General/SetupFlow/Transitions/OpenBadwordsModal": [],
            "VertixBot/UI-General/SetupFlow/Transitions/SubmitBadwords": []
        };
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages );
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildText ];
    }

    protected override getInitialState(): string {
        return "VertixBot/UI-General/SetupFlow/States/Initial";
    }

    protected override getInitialData(): SetupFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( SetupFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return SetupFlow.getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    public override getNextState( transition: string ): string {
        return SetupFlow.getNextStates()[ transition ] || "VertixBot/UI-General/SetupFlow/States/Initial";
    }

    public override getRequiredData( transition: string ): ( keyof SetupFlowData )[] {
        return SetupFlow.getRequiredData()[ transition ] || [];
    }
}
