import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { SetupEditComponent } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-adapter";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";

interface SetupEditFlowData extends UIFlowData {
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
                "VertixBot/UI-V3/SetupEditFlow/Transitions/OpenNameModal"
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
            "VertixBot/UI-V3/SetupEditFlow/Transitions/NameTemplateSubmitted": [ "masterChannelId" ]
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

