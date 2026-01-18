import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { SetupEditComponent } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface SetupEditFlowData extends UIFlowDataBase {
    masterChannelId?: string;
    dynamicChannelButtonsTemplate?: string[];
    dynamicChannelVerifiedRoles?: string[];
}

export class SetupEditFlow extends UIFlowBase<string, string, SetupEditFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V2/SetupEditFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/SetupEditFlow/States/SelectMaster": [
                "VertixBot/UI-V2/SetupEditFlow/Transitions/SelectMaster"
            ],
            "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview": [
                "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenButtons",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenVerifiedRoles",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/ConfigExtrasUpdated",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/LogChannelUpdated",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/NameTemplateSubmitted",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/Done",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenNameModal",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenDeleteModal",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/DeleteConfirmed"
            ],
            "VertixBot/UI-V2/SetupEditFlow/States/Buttons": [
                "VertixBot/UI-V2/SetupEditFlow/Transitions/ShowButtonsEffect",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/Done"
            ],
            "VertixBot/UI-V2/SetupEditFlow/States/ButtonsEffect": [
                "VertixBot/UI-V2/SetupEditFlow/Transitions/ButtonsImmediateApplied",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/ButtonsNewApplied"
            ],
            "VertixBot/UI-V2/SetupEditFlow/States/VerifiedRoles": [
                "VertixBot/UI-V2/SetupEditFlow/Transitions/VerifiedRolesUpdated",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/Back",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/Finish",
                "VertixBot/UI-V2/SetupEditFlow/Transitions/Done"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/SetupEditFlow/Transitions/SelectMaster": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenNameModal": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenButtons": "VertixBot/UI-V2/SetupEditFlow/States/Buttons",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenVerifiedRoles": "VertixBot/UI-V2/SetupEditFlow/States/VerifiedRoles",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/ShowButtonsEffect": "VertixBot/UI-V2/SetupEditFlow/States/ButtonsEffect",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/ButtonsImmediateApplied": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/ButtonsNewApplied": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/ConfigExtrasUpdated": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/LogChannelUpdated": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/VerifiedRolesUpdated": "VertixBot/UI-V2/SetupEditFlow/States/VerifiedRoles",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled": "VertixBot/UI-V2/SetupEditFlow/States/VerifiedRoles",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/NameTemplateSubmitted": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/Done": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenDeleteModal": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/DeleteConfirmed": "VertixBot/UI-V2/SetupEditFlow/States/SelectMaster",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/Back": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview",
            "VertixBot/UI-V2/SetupEditFlow/Transitions/Finish": "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview"
        };
    }

    public static getRequiredData(): Record<string, ( keyof SetupEditFlowData )[]> {
        return {
            "VertixBot/UI-V2/SetupEditFlow/Transitions/SelectMaster": [ "masterChannelId" ],
            "VertixBot/UI-V2/SetupEditFlow/Transitions/OpenNameModal": [ "masterChannelId" ],
            "VertixBot/UI-V2/SetupEditFlow/Transitions/ShowButtonsEffect": [ "dynamicChannelButtonsTemplate" ],
            "VertixBot/UI-V2/SetupEditFlow/Transitions/VerifiedRolesUpdated": [ "dynamicChannelVerifiedRoles" ],
            "VertixBot/UI-V2/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled": [ "dynamicChannelVerifiedRoles" ],
            "VertixBot/UI-V2/SetupEditFlow/Transitions/NameTemplateSubmitted": [ "masterChannelId" ],
            "VertixBot/UI-V2/SetupEditFlow/Transitions/DeleteConfirmed": [ "masterChannelId" ]
        };
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return {
            "VertixBot/UI-V2/SetupEditFlow/States/SelectMaster": {
                executionStep: "default"
            },
            "VertixBot/UI-V2/SetupEditFlow/States/MasterOverview": {
                executionStep: "VertixBot/UI-V2/SetupEditMaster"
            },
            "VertixBot/UI-V2/SetupEditFlow/States/Buttons": {
                executionStep: "VertixBot/UI-V2/SetupEditButtons"
            },
            "VertixBot/UI-V2/SetupEditFlow/States/ButtonsEffect": {
                executionStep: "VertixBot/UI-V2/SetupEditButtonsEffect"
            },
            "VertixBot/UI-V2/SetupEditFlow/States/VerifiedRoles": {
                executionStep: "VertixBot/UI-V2/SetupEditVerifiedRoles"
            }
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ SetupEditComponent ];
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
        return "VertixBot/UI-V2/SetupEditFlow/States/SelectMaster";
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
