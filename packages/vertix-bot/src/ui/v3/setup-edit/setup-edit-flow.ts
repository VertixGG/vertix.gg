import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase, FlowIntegrationPointGeneric } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { SetupEditComponent } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-adapter";

import type { UIFlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { UIFlowVisualConnection, UIFlowInputRequirementDefinition, UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface SetupEditFlowData extends UIFlowDataBase {
    masterChannelId?: string;
    dynamicChannelButtonsTemplate?: string[];
    dynamicChannelVerifiedRoles?: string[];
}

export class SetupEditFlow extends UIFlowBase<string, string, SetupEditFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/SetupEditFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static override getEntryPoints(): UIFlowIntegrationPointBase[] {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/SetupFlow",
                description: "Triggered via Setup flow Edit Master transition",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster",
                targetState: "VertixBot/UI-V3/SetupEditFlow/States/SelectMaster",
                requiredData: [ "guildId", "masterChannelId" ]
            } )
        ];
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/SetupEditFlow/States/SelectMaster": [
                "VertixBot/UI-V3/SetupEditFlow/Transitions/SelectMaster"
            ],
            "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview": [
                "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenButtons",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenVerifiedRoles",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/ConfigExtrasUpdated",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/LogChannelUpdated",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/NameTemplateSubmitted",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/Done",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenNameModal",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenDeleteModal",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/DeleteConfirmed"
            ],
            "VertixBot/UI-V3/SetupEditFlow/States/Buttons": [
                "VertixBot/UI-V3/SetupEditFlow/Transitions/ShowButtonsEffect",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/Done"
            ],
            "VertixBot/UI-V3/SetupEditFlow/States/ButtonsEffect": [
                "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsImmediateApplied",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsNewApplied"
            ],
            "VertixBot/UI-V3/SetupEditFlow/States/VerifiedRoles": [
                "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesUpdated",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/Back",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/Finish",
                "VertixBot/UI-V3/SetupEditFlow/Transitions/Done"
            ]
        };
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        const flowName = SetupEditFlow.getName();

        return [
            {
                triggeringElementId: "VertixBot/UI-General/SetupMasterEditSelectMenu",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/SelectMaster",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/SetupEditOpenNameButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenNameModal",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/SetupEditOpenButtonsButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenButtons",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/SetupEditOpenVerifiedRolesButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenVerifiedRoles",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/ShowButtonsEffect",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/SetupEditButtonsEffectImmediatelyButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsImmediateApplied",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/SetupEditButtonsEffectNewlyButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsNewApplied",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/ConfigExtrasSelectMenu",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/ConfigExtrasUpdated",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/LogChannelSelectMenu",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/LogChannelUpdated",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/ChannelNameTemplateModal",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/NameTemplateSubmitted",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/VerifiedRolesMenu",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesUpdated",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/DoneButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/Done",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/DeleteButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenDeleteModal",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/DeleteConfirmModal",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/DeleteConfirmed",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/WizardBackButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/Back",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-General/WizardFinishButton",
                transitionName: "VertixBot/UI-V3/SetupEditFlow/Transitions/Finish",
                targetFlowName: flowName
            }
        ];
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/SetupEditFlow/Transitions/SelectMaster": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenNameModal": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenButtons": "VertixBot/UI-V3/SetupEditFlow/States/Buttons",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenVerifiedRoles": "VertixBot/UI-V3/SetupEditFlow/States/VerifiedRoles",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/ShowButtonsEffect": "VertixBot/UI-V3/SetupEditFlow/States/ButtonsEffect",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsImmediateApplied": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsNewApplied": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/ConfigExtrasUpdated": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/LogChannelUpdated": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesUpdated": "VertixBot/UI-V3/SetupEditFlow/States/VerifiedRoles",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled": "VertixBot/UI-V3/SetupEditFlow/States/VerifiedRoles",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/NameTemplateSubmitted": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/Done": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenDeleteModal": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/DeleteConfirmed": "VertixBot/UI-V3/SetupEditFlow/States/SelectMaster",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/Back": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V3/SetupEditFlow/Transitions/Finish": "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview"
        };
    }

    public static getRequiredData(): Record<string, ( keyof SetupEditFlowData )[]> {
        return {
            "VertixBot/UI-V3/SetupEditFlow/Transitions/SelectMaster": [ "masterChannelId" ],
            "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenNameModal": [ "masterChannelId" ],
            "VertixBot/UI-V3/SetupEditFlow/Transitions/ShowButtonsEffect": [ "dynamicChannelButtonsTemplate" ],
            "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesUpdated": [ "dynamicChannelVerifiedRoles" ],
            "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled": [ "dynamicChannelVerifiedRoles" ],
            "VertixBot/UI-V3/SetupEditFlow/Transitions/NameTemplateSubmitted": [ "masterChannelId" ],
            "VertixBot/UI-V3/SetupEditFlow/Transitions/DeleteConfirmed": [ "masterChannelId" ]
        };
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return {
            "VertixBot/UI-V3/SetupEditFlow/States/SelectMaster": {
                executionStep: "default"
            },
            "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview": {
                executionStep: "VertixBot/UI-V3/SetupEditMaster"
            },
            "VertixBot/UI-V3/SetupEditFlow/States/Buttons": {
                executionStep: "VertixBot/UI-V3/SetupEditButtons"
            },
            "VertixBot/UI-V3/SetupEditFlow/States/ButtonsEffect": {
                executionStep: "VertixBot/UI-V3/SetupEditButtonsEffect"
            },
            "VertixBot/UI-V3/SetupEditFlow/States/VerifiedRoles": {
                executionStep: "VertixBot/UI-V3/SetupEditVerifiedRoles"
            }
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ SetupEditComponent ];
    }

    public static override getRequiredDataComponents(): string[] {
        return [ "VertixBot/Data/DynamicChannelUIData" ];
    }

    public static override getArgsDataProviders(): Array<[ string, string ]> {
        return [
            [ "VertixBot/UI-V3/SetupEditAdapter", "VertixBot/Data/DynamicChannelUIData" ]
        ];
    }

    public static override getInputRequirements(): UIFlowInputRequirementDefinition[] {
        return [
            {
                key: "masterChannelId",
                label: "Master Channel",
                description: "Select which master channel to preview and edit.",
                inputType: "select",
                optionsDataComponent: "VertixBot/Data/SetupEditRequirementsData",
                optionsDataKey: "masterChannels",
                dependsOn: [ "guildId" ]
            }
        ];
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField();
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildText, ChannelType.GuildVoice ];
    }

    protected override getInitialState(): string {
        return "VertixBot/UI-V3/SetupEditFlow/States/SelectMaster";
    }

    protected override getInitialData(): SetupEditFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( SetupEditFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return SetupEditFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = SetupEditFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ SetupEditFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof SetupEditFlowData )[] {
        return SetupEditFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default SetupEditFlow;

