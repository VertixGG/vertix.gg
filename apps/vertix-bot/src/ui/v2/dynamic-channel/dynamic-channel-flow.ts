import { ChannelType, PermissionsBitField } from "discord.js";

import {
    UIFlowBase,
    FlowIntegrationPointGeneric
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { UIArgsProviderRegistry } from "@vertix.gg/gui/src/runtime/ui-args-provider-registry";

import type { UIFlowIntegrationPointBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowVisualConnection, UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

export class DynamicChannelFlow extends UIFlowBase<string, string, UIFlowDataBase> {
    public static override getName(): string {
        return "VertixBot/UI-V2/DynamicChannelFlow";
    }

    public static override getComponents() {
        return [];
    }

    public static override getFlowType(): "system" {
        return "system";
    }

    public static override getArgsDataProviders(): Array<[ string, string ]> {
        return [
            [ "VertixBot/UI-V2/DynamicChannelAdapter", "VertixBot/Data/DynamicChannelUIData" ]
        ];
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelFlow/States/Default": [
                "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenRename",
                "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenLimit",
                "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenPermissions",
                "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ClearChat",
                "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ResetChannel",
                "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ClaimChannel",
                "VertixBot/UI-V2/DynamicChannelFlow/Transitions/TransferOwner"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenRename": "VertixBot/UI-V2/DynamicChannelMetaRenameFlow/States/Initial",
            "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenLimit": "VertixBot/UI-V2/DynamicChannelMetaLimitFlow/States/Default",
            "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenPermissions": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Default",
            "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ClearChat": "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/Default",
            "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ResetChannel": "VertixBot/UI-V2/DynamicChannelPremiumResetFlow/States/Default",
            "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ClaimChannel": "VertixBot/UI-V2/ClaimStartFlow/States/Default",
            "VertixBot/UI-V2/DynamicChannelFlow/Transitions/TransferOwner": "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Default"
        };
    }

    public static getRequiredData(): Record<string, ( keyof UIFlowDataBase )[]> {
        const required: Record<string, ( keyof UIFlowDataBase )[]> = {};

        ( this.getFlowTransitions()[ "VertixBot/UI-V2/DynamicChannelFlow/States/Default" ] || [] ).forEach( ( transition ) => {
            required[ transition ] = [];
        } );

        return required;
    }

    public static override getEntryPoints(): UIFlowIntegrationPointBase[] {
        return ( this.getFlowTransitions()[ "VertixBot/UI-V2/DynamicChannelFlow/States/Default" ] || [] ).map( ( transition ) =>
            new FlowIntegrationPointGeneric( {
                flowName: this.getName(),
                description: "Entry triggered from DynamicChannel primary message interaction.",
                transition: transition,
                targetState: "VertixBot/UI-V2/DynamicChannelFlow/States/Default",
                requiredData: []
            } )
        );
    }

    public static override getHandoffPoints(): UIFlowIntegrationPointBase[] {
        const handoff: UIFlowIntegrationPointBase[] = [];
        const transitions = this.getFlowTransitions()[ "VertixBot/UI-V2/DynamicChannelFlow/States/Default" ] || [];
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
                sourceState: "VertixBot/UI-V2/DynamicChannelFlow/States/Default",
                targetState: targetState,
                requiredData: ( this.getRequiredData()[ transition ] || [] ) as string[]
            } ) );
        } );

        return handoff;
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        return [
            {
                triggeringElementId: "VertixBot/UI-V2/DynamicChannelMetaRenameButton",
                transitionName: "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenRename",
                targetFlowName: "VertixBot/UI-V2/DynamicChannelMetaRenameFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V2/DynamicChannelMetaLimitButton",
                transitionName: "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenLimit",
                targetFlowName: "VertixBot/UI-V2/DynamicChannelMetaLimitFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton",
                transitionName: "VertixBot/UI-V2/DynamicChannelFlow/Transitions/OpenPermissions",
                targetFlowName: "VertixBot/UI-V2/DynamicChannelPermissionsFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V2/DynamicChannelMetaClearChatButton",
                transitionName: "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ClearChat",
                targetFlowName: "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton",
                transitionName: "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ResetChannel",
                targetFlowName: "VertixBot/UI-V2/DynamicChannelPremiumResetFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton",
                transitionName: "VertixBot/UI-V2/DynamicChannelFlow/Transitions/ClaimChannel",
                targetFlowName: "VertixBot/UI-V2/ClaimStartFlow"
            },
            {
                triggeringElementId: "VertixBot/UI-V2/DynamicChannelTransferOwnerButton",
                transitionName: "VertixBot/UI-V2/DynamicChannelFlow/Transitions/TransferOwner",
                targetFlowName: "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow"
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
        return "VertixBot/UI-V2/DynamicChannelFlow/States/Default";
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
        return DynamicChannelFlow.getNextStates()[ transition ] || "VertixBot/UI-V2/DynamicChannelFlow/States/Default";
    }

    public override getRequiredData( transition: string ): ( keyof UIFlowDataBase )[] {
        return DynamicChannelFlow.getRequiredData()[ transition ] || [];
    }
}

export default DynamicChannelFlow;

if ( !UIArgsProviderRegistry.$.has( "VertixBot/UI-V2/DynamicChannelAdapter" ) ) {
    UIArgsProviderRegistry.$.registerDataProvider(
        "VertixBot/UI-V2/DynamicChannelAdapter",
        "VertixBot/Data/DynamicChannelUIData"
    );
}
