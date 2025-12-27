import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { UIFlowBase, FlowIntegrationPointGeneric } from "@vertix.gg/gui/src/bases/ui-flow-base";

import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

type WelcomeFlowStates =
    | "VertixBot/UI-General/WelcomeFlow/States/Initial"
    | "VertixBot/UI-General/WelcomeFlow/States/SetupClicked"
    | "VertixBot/UI-General/WelcomeFlow/States/SupportClicked"
    | "VertixBot/UI-General/WelcomeFlow/States/InviteClicked";

type WelcomeFlowTransitions =
    | "VertixBot/UI-General/WelcomeFlow/Transitions/Start"
    | "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup"
    | "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport"
    | "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite";

export interface WelcomeFlowData extends UIFlowDataBase {}

export class WelcomeFlow extends UIFlowBase<WelcomeFlowStates, WelcomeFlowTransitions, WelcomeFlowData> {
    public static getName() {
        return "VertixBot/UI-General/WelcomeFlow";
    }

    public static getFlowType() {
        return "flow" as const;
    }

    protected static getFlowTransitions() {
        return {
            "VertixBot/UI-General/WelcomeFlow/States/Initial": [
                "VertixBot/UI-General/WelcomeFlow/Transitions/Start",
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport",
                "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite"
            ] as WelcomeFlowTransitions[]
        };
    }

    public static override getNextStates() {
        return {
            "VertixBot/UI-General/WelcomeFlow/Transitions/Start": "VertixBot/UI-General/WelcomeFlow/States/Initial" as WelcomeFlowStates,
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup": "VertixBot/UI-General/WelcomeFlow/States/SetupClicked" as WelcomeFlowStates,
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport": "VertixBot/UI-General/WelcomeFlow/States/SupportClicked" as WelcomeFlowStates,
            "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite": "VertixBot/UI-General/WelcomeFlow/States/InviteClicked" as WelcomeFlowStates
        };
    }

    public static override getHandoffPoints() {
        return [
            new FlowIntegrationPointGeneric( {
                flowName: "VertixBot/UI-General/SetupFlow",
                description: "Handoff to Setup flow when Setup button is clicked",
                sourceState: "VertixBot/UI-General/WelcomeFlow/States/Initial",
                targetState: "VertixBot/UI-General/WelcomeFlow/States/SetupClicked",
                transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup"
            } )
        ];
    }

    protected static getRequiredData() {
        return {} as Record<WelcomeFlowTransitions, ( keyof WelcomeFlowData )[]>;
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages );
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildText ];
    }

    protected override getInitialState(): WelcomeFlowStates {
        return "VertixBot/UI-General/WelcomeFlow/States/Initial";
    }

    protected override getInitialData(): WelcomeFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( WelcomeFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state as WelcomeFlowStates, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): WelcomeFlowTransitions[] {
        return Array.from( this.getTransitionsForState( this.getCurrentState() ) || [] );
    }

    public override getNextState( transition: WelcomeFlowTransitions ): WelcomeFlowStates {
        const NextStates = ( this.constructor as typeof WelcomeFlow ).getNextStates();
        return NextStates[ transition ] ?? this.getInitialState();
    }

    public override getRequiredData( transition: WelcomeFlowTransitions ): ( keyof WelcomeFlowData )[] {
        return WelcomeFlow.getRequiredData()[ transition ] || [];
    }
}

export default WelcomeFlow;

