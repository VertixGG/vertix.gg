import { ChannelType, PermissionsBitField } from "discord.js";

import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { UIArgsProviderRegistry } from "@vertix.gg/gui/src/runtime/ui-args-provider-registry";

import type { UIFlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowVisualConnection, UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

/**
 * Entry flow for dynamic channel primary message actions. Each transition
 * represents one of the action buttons rendered in the primary message embed,
 * handing off into the dedicated V3 flow for that action.
 */
export class DynamicChannelFlow extends UIFlowBase<string, string, UIFlowDataBase> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelFlow";
    }

    public static override getComponents() {
        return [];
    }

    public static override getFlowType(): "system" {
        return "system";
    }

    public static override getArgsDataProviders(): Array<[ string, string ]> {
        return [
            [ "VertixBot/UI-V3/DynamicChannelAdapter", "VertixBot/Data/DynamicChannelUIData" ]
        ];
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRename",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenLimit",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPermissions",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrivacy",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRegion",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrimaryMessageEdit",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClearChat",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ResetChannel",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClaimChannel",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/TransferOwner"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRename": "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Initial",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenLimit": "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPermissions": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrivacy": "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRegion": "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrimaryMessageEdit": "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/Confirm",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClearChat": "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ResetChannel": "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClaimChannel": "VertixBot/UI-V3/ClaimStartFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/TransferOwner": "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/SelectUser"
        };
    }

    public static getRequiredData(): Record<string, ( keyof UIFlowDataBase )[]> {
        const required: Record<string, ( keyof UIFlowDataBase )[]> = {};

        ( this.getFlowTransitions()[ "VertixBot/UI-V3/DynamicChannelFlow/States/Default" ] || [] ).forEach( ( transition ) => {
            required[ transition ] = [];
        } );

        return required;
    }

    public static override getEntryPoints(): UIFlowIntegrationPointBase[] {
        return ( this.getFlowTransitions()[ "VertixBot/UI-V3/DynamicChannelFlow/States/Default" ] || [] ).map( ( transition ) =>
            new FlowIntegrationPointGeneric( {
                flowName: this.getName(),
                description: "Entry triggered from DynamicChannel primary message interaction.",
                transition: transition,
                targetState: "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
                requiredData: []
            } )
        );
    }

    public static override getHandoffPoints(): UIFlowIntegrationPointBase[] {
        const handoff: UIFlowIntegrationPointBase[] = [];
        const transitions = this.getFlowTransitions()[ "VertixBot/UI-V3/DynamicChannelFlow/States/Default" ] || [];
        const nextStates = this.getNextStates();

        transitions.forEach( ( transition ) => {
            const targetState = nextStates[ transition ];
            if ( !targetState ) {
                return;
            }

            const targetFlowName = targetState.split( "/States/" )[ 0 ];

            handoff.push( new FlowIntegrationPointGeneric( {
                flowName: targetFlowName,
                description: `Handoff from DynamicChannel: ${ transition.split( "/" ).pop() }`,
                transition: transition,
                sourceState: "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
                targetState: targetState,
                requiredData: ( this.getRequiredData()[ transition ] || [] ) as string[]
            } ) );
        } );

        return handoff;
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        return [
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelRenameButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRename",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelRenameFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelLimitMetaButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenLimit",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelLimitFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelPrivacyButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrivacy",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelPrivacyFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPermissions",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelPermissionsFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelRegionButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRegion",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelRegionFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrimaryMessageEdit",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelClearChatButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClearChat",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelClearChatFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelResetChannelButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ResetChannel",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelResetChannelFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelClaimChannelButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClaimChannel",
                targetFlowName: "VertixBot/UI-V3/ClaimStartFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelFlow/Transitions/TransferOwner",
                targetFlowName: "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow"
            }
        ];
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
        this.initializeTransitions();
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField();
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildVoice ];
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelFlow.getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    protected override getInitialState(): string {
        return "VertixBot/UI-V3/DynamicChannelFlow/States/Default";
    }

    protected override getInitialData(): UIFlowDataBase {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getNextState( transition: string ): string {
        return DynamicChannelFlow.getNextStates()[ transition ] || "VertixBot/UI-V3/DynamicChannelFlow/States/Default";
    }

    public override getRequiredData( transition: string ): ( keyof UIFlowDataBase )[] {
        return DynamicChannelFlow.getRequiredData()[ transition ] || [];
    }
}

export default DynamicChannelFlow;

// Register args provider for the DynamicChannel adapter (export/runtime support).
if ( !UIArgsProviderRegistry.$.has( "VertixBot/UI-V3/DynamicChannelAdapter" ) ) {
    UIArgsProviderRegistry.$.registerDataProvider(
        "VertixBot/UI-V3/DynamicChannelAdapter",
        "VertixBot/Data/DynamicChannelUIData"
    );
}
