import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { SetupComponent } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";

import type {
    UIFlowIntegrationPointBase
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIFlowVisualConnection, UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

export interface SetupFlowData extends UIFlowDataBase {}

export class SetupFlow extends UIFlowBase<string, string, SetupFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/SetupFlow";
    }

    public static override getComponents() {
        return [ SetupComponent ];
    }

    public static override getEntryPoints(): UIFlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Setup",
                targetState: "VertixBot/UI-General/SetupFlow/States/Initial",
                description: "Entry point triggered by CommandsFlow via Setup command"
            } )
        ];
    }

    public static override getHandoffPoints(): UIFlowIntegrationPointBase[] {
        return [
            // V3 handoffs
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/SetupNewWizardFlow",
                description: "Handoff to V3 Setup Wizard when Create V3 button is clicked",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV3",
                targetState: "VertixGUI/UIWizardFlowBase/States/Initial",
                requiredData: []
            } ),
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-V3/SetupEditFlow",
                description: "Handoff to V3 Setup Edit flow when editing an existing master channel",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster",
                targetState: "VertixBot/UI-V3/SetupEditFlow/States/SelectMaster",
                requiredData: []
            } ),
            // V2 handoffs
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/SetupNewWizardFlowV2",
                description: "Handoff to V2 Setup Wizard when Create V2 button is clicked",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV2",
                targetState: "VertixGUI/UIWizardFlowBase/States/Initial",
                requiredData: []
            } ),
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/SetupEditFlowV2",
                description: "Handoff to V2 Setup Edit flow when editing an existing master channel",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster",
                targetState: "VertixBot/UI-General/SetupEditFlowV2/States/SelectMaster",
                requiredData: []
            } ),
            // Other handoffs
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/LanguageFlow",
                description: "Handoff to Language selection flow",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                requiredData: []
            } )
        ];
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        return [
            // V2 edges
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterCreateButton",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV2",
                targetFlowName: "VertixBot/UI-General/SetupNewWizardFlowV2"
            },
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterEditSelectMenu",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster",
                targetFlowName: "VertixBot/UI-General/SetupEditFlowV2"
            },
            // V3 edges
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterCreateV3Button",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannelV3",
                targetFlowName: "VertixBot/UI-General/SetupNewWizardFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterEditSelectMenu",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            },
            // Other edges
            {
                triggeringElementId: "VertixBot/UI-General/LanguageChooseButton",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                targetFlowName: "VertixBot/UI-General/LanguageFlow"
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
