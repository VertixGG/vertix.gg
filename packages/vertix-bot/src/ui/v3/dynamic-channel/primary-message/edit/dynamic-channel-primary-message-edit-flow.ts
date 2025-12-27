import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPrimaryMessageEditComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-component";
import { DynamicChannelPrimaryMessageEditDescriptionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-component";
import { DynamicChannelPrimaryMessageEditTitleComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { UIFlowVisualConnection, UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelPrimaryMessageEditFlowData extends UIFlowDataBase {
    title?: string;
    description?: string;
}

/**
 * Flow that edits the dynamic channel primary message in a two-step wizard.
 */
export class DynamicChannelPrimaryMessageEditFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelPrimaryMessageEditFlowData
> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/Confirm": [
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/BeginEditing"
            ],
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditTitle": [
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/SubmitTitle",
                "VertixGUI/UIWizardFlowBase/Transitions/Next",
                "VertixGUI/UIWizardFlowBase/Transitions/Back",
                "VertixGUI/UIWizardFlowBase/Transitions/Error"
            ],
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditDescription": [
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/SubmitDescription",
                "VertixGUI/UIWizardFlowBase/Transitions/Back",
                "VertixGUI/UIWizardFlowBase/Transitions/Finish",
                "VertixGUI/UIWizardFlowBase/Transitions/Error"
            ],
            "VertixGUI/UIWizardFlowBase/States/Completed": [],
            "VertixGUI/UIWizardFlowBase/States/Error": [
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/BeginEditing"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/BeginEditing": "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditTitle",
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/SubmitTitle": "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditDescription",
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/SubmitDescription": "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditDescription",
            "VertixGUI/UIWizardFlowBase/Transitions/Next": "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditDescription",
            "VertixGUI/UIWizardFlowBase/Transitions/Back": "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditTitle",
            "VertixGUI/UIWizardFlowBase/Transitions/Finish": "VertixGUI/UIWizardFlowBase/States/Completed",
            "VertixGUI/UIWizardFlowBase/Transitions/Error": "VertixGUI/UIWizardFlowBase/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPrimaryMessageEditFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/SubmitTitle": [ "title" ],
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/SubmitDescription": [ "description" ],
            "VertixGUI/UIWizardFlowBase/Transitions/Finish": [ "title", "description" ],
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/BeginEditing": [],
            "VertixGUI/UIWizardFlowBase/Transitions/Next": [],
            "VertixGUI/UIWizardFlowBase/Transitions/Back": [],
            "VertixGUI/UIWizardFlowBase/Transitions/Error": []
        };
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/Confirm": {
                executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditComponent",
                transitionHandles: {
                    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/Transitions/BeginEditing": "VertixBot/UI-General/YesButton"
                }
            },
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditTitle": {
                executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent"
            },
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditDescription": {
                executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent"
            }
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [
            DynamicChannelPrimaryMessageEditComponent,
            DynamicChannelPrimaryMessageEditTitleComponent,
            DynamicChannelPrimaryMessageEditDescriptionComponent
        ];
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        const flowName = this.getName();

        return [
            {
                triggeringElementId: "VertixBot/UI-General/YesButton",
                transitionName: `${ flowName }/Transitions/BeginEditing`,
                targetFlowName: flowName
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
        return [ ChannelType.GuildVoice ];
    }

    protected override getInitialState(): string {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/Confirm";
    }

    protected override getInitialData(): DynamicChannelPrimaryMessageEditFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelPrimaryMessageEditFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelPrimaryMessageEditFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelPrimaryMessageEditFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelPrimaryMessageEditFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPrimaryMessageEditFlowData )[] {
        return DynamicChannelPrimaryMessageEditFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelPrimaryMessageEditFlow;

