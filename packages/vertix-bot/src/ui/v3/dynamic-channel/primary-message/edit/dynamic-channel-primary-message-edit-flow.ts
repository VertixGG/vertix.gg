import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPrimaryMessageEditComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-component";
import { DynamicChannelPrimaryMessageEditDescriptionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-component";
import { DynamicChannelPrimaryMessageEditTitleComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelPrimaryMessageEditFlowData extends UIFlowData {
    title?: string;
    description?: string;
}

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow";

const STATE_CONFIRM = `${ FLOW_NAME }/States/Confirm`;
const STATE_EDIT_TITLE = `${ FLOW_NAME }/States/EditTitle`;
const STATE_EDIT_DESCRIPTION = `${ FLOW_NAME }/States/EditDescription`;
const STATE_COMPLETED = "VertixGUI/UIWizardFlowBase/States/Completed";
const STATE_ERROR = "VertixGUI/UIWizardFlowBase/States/Error";

const TRANSITION_BEGIN = `${ FLOW_NAME }/Transitions/BeginEditing`;
const TRANSITION_SUBMIT_TITLE = `${ FLOW_NAME }/Transitions/SubmitTitle`;
const TRANSITION_SUBMIT_DESCRIPTION = `${ FLOW_NAME }/Transitions/SubmitDescription`;
const TRANSITION_NEXT = "VertixGUI/UIWizardFlowBase/Transitions/Next";
const TRANSITION_BACK = "VertixGUI/UIWizardFlowBase/Transitions/Back";
const TRANSITION_FINISH = "VertixGUI/UIWizardFlowBase/Transitions/Finish";
const TRANSITION_ERROR = "VertixGUI/UIWizardFlowBase/Transitions/Error";

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_CONFIRM ]: [ TRANSITION_BEGIN ],
    [ STATE_EDIT_TITLE ]: [ TRANSITION_SUBMIT_TITLE, TRANSITION_NEXT, TRANSITION_BACK, TRANSITION_ERROR ],
    [ STATE_EDIT_DESCRIPTION ]: [ TRANSITION_SUBMIT_DESCRIPTION, TRANSITION_BACK, TRANSITION_FINISH, TRANSITION_ERROR ],
    [ STATE_COMPLETED ]: [],
    [ STATE_ERROR ]: [ TRANSITION_BEGIN ]
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_BEGIN ]: STATE_EDIT_TITLE,
    [ TRANSITION_SUBMIT_TITLE ]: STATE_EDIT_TITLE,
    [ TRANSITION_SUBMIT_DESCRIPTION ]: STATE_EDIT_DESCRIPTION,
    [ TRANSITION_NEXT ]: STATE_EDIT_DESCRIPTION,
    [ TRANSITION_BACK ]: STATE_EDIT_TITLE,
    [ TRANSITION_FINISH ]: STATE_COMPLETED,
    [ TRANSITION_ERROR ]: STATE_ERROR
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelPrimaryMessageEditFlowData )[]> = {
    [ TRANSITION_SUBMIT_TITLE ]: [ "title" ],
    [ TRANSITION_SUBMIT_DESCRIPTION ]: [ "description" ],
    [ TRANSITION_FINISH ]: [ "title", "description" ],
    [ TRANSITION_BEGIN ]: [],
    [ TRANSITION_NEXT ]: [],
    [ TRANSITION_BACK ]: [],
    [ TRANSITION_ERROR ]: []
};

/**
 * Flow that edits the dynamic channel primary message in a two-step wizard.
 */
export class DynamicChannelPrimaryMessageEditFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelPrimaryMessageEditFlowData
> {
    public static override getName(): string {
        return FLOW_NAME;
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return FLOW_TRANSITIONS;
    }

    public static getNextStates(): Record<string, string> {
        return NEXT_STATES;
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPrimaryMessageEditFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [
            DynamicChannelPrimaryMessageEditComponent,
            DynamicChannelPrimaryMessageEditTitleComponent,
            DynamicChannelPrimaryMessageEditDescriptionComponent
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
        return STATE_CONFIRM;
    }

    protected override getInitialData(): DynamicChannelPrimaryMessageEditFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( FLOW_TRANSITIONS ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return FLOW_TRANSITIONS[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = NEXT_STATES[ transition ];
        if ( !next ) {
            throw new Error( `${ FLOW_NAME }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPrimaryMessageEditFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelPrimaryMessageEditFlow;

