import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { FeedbackComponent } from "@vertix.gg/bot/src/ui/general/feedback/feedback-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface FeedbackFlowData extends UIFlowDataBase {}

export class FeedbackFlow extends UIFlowBase<string, string, FeedbackFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-General/FeedbackFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-General/FeedbackFlow/States/Default": [
                "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitIssueReport",
                "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitSuggestion",
                "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitInvite"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitIssueReport": "VertixBot/UI-General/FeedbackFlow/States/Default",
            "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitSuggestion": "VertixBot/UI-General/FeedbackFlow/States/Default",
            "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitInvite": "VertixBot/UI-General/FeedbackFlow/States/Default"
        };
    }

    public static getRequiredData(): Record<string, ( keyof FeedbackFlowData )[]> {
        return {
            "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitIssueReport": [],
            "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitSuggestion": [],
            "VertixBot/UI-General/FeedbackFlow/Transitions/SubmitInvite": []
        };
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return {
            "VertixBot/UI-General/FeedbackFlow/States/Default": {
                executionStep: "default"
            }
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ FeedbackComponent ];
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField();
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildText ];
    }

    protected override getInitialState(): string {
        return "VertixBot/UI-General/FeedbackFlow/States/Default";
    }

    protected override getInitialData(): FeedbackFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( FeedbackFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return FeedbackFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        return FeedbackFlow.getNextStates()[ transition ] || "VertixBot/UI-General/FeedbackFlow/States/Default";
    }

    public override getRequiredData( transition: string ): ( keyof FeedbackFlowData )[] {
        return FeedbackFlow.getRequiredData()[ transition ] || [];
    }
}

export default FeedbackFlow;

