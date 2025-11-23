import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";

interface DynamicChannelPermissionsFlowData extends UIFlowData {
    userGrantedDisplayName?: string;
    userDeniedDisplayName?: string;
    userBlockedDisplayName?: string;
    userUnBlockedDisplayName?: string;
    userKickedDisplayName?: string;
}

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelPermissionsFlow";

const STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;
const STATE_PUBLIC = `${ FLOW_NAME }/States/Public`;
const STATE_PRIVATE = `${ FLOW_NAME }/States/Private`;
const STATE_HIDDEN = `${ FLOW_NAME }/States/Hidden`;
const STATE_SHOWN = `${ FLOW_NAME }/States/Shown`;
const STATE_GRANTED = `${ FLOW_NAME }/States/Granted`;
const STATE_DENIED = `${ FLOW_NAME }/States/Denied`;
const STATE_BLOCKED = `${ FLOW_NAME }/States/Blocked`;
const STATE_UNBLOCKED = `${ FLOW_NAME }/States/Unblocked`;
const STATE_KICKED = `${ FLOW_NAME }/States/Kicked`;
const STATE_ERROR = `${ FLOW_NAME }/States/Error`;
const STATE_NOTHING_CHANGED = `${ FLOW_NAME }/States/NothingChanged`;

const TRANSITION_SET_PUBLIC = `${ FLOW_NAME }/Transitions/SetPublic`;
const TRANSITION_SET_PRIVATE = `${ FLOW_NAME }/Transitions/SetPrivate`;
const TRANSITION_SET_HIDDEN = `${ FLOW_NAME }/Transitions/SetHidden`;
const TRANSITION_SET_SHOWN = `${ FLOW_NAME }/Transitions/SetShown`;
const TRANSITION_GRANT_SUCCESS = `${ FLOW_NAME }/Transitions/GrantAccessSuccess`;
const TRANSITION_GRANT_ERROR = `${ FLOW_NAME }/Transitions/GrantAccessError`;
const TRANSITION_DENY_SUCCESS = `${ FLOW_NAME }/Transitions/DenyAccessSuccess`;
const TRANSITION_DENY_NOTHING = `${ FLOW_NAME }/Transitions/DenyAccessNothingChanged`;
const TRANSITION_DENY_ERROR = `${ FLOW_NAME }/Transitions/DenyAccessError`;
const TRANSITION_BLOCK_SUCCESS = `${ FLOW_NAME }/Transitions/BlockUserSuccess`;
const TRANSITION_BLOCK_NOTHING = `${ FLOW_NAME }/Transitions/BlockUserNothingChanged`;
const TRANSITION_BLOCK_ERROR = `${ FLOW_NAME }/Transitions/BlockUserError`;
const TRANSITION_UNBLOCK_SUCCESS = `${ FLOW_NAME }/Transitions/UnblockUserSuccess`;
const TRANSITION_UNBLOCK_NOTHING = `${ FLOW_NAME }/Transitions/UnblockUserNothingChanged`;
const TRANSITION_UNBLOCK_ERROR = `${ FLOW_NAME }/Transitions/UnblockUserError`;
const TRANSITION_KICK_SUCCESS = `${ FLOW_NAME }/Transitions/KickUserSuccess`;
const TRANSITION_KICK_ERROR = `${ FLOW_NAME }/Transitions/KickUserError`;

const ALL_TRANSITIONS: string[] = [
    TRANSITION_SET_PUBLIC,
    TRANSITION_SET_PRIVATE,
    TRANSITION_SET_HIDDEN,
    TRANSITION_SET_SHOWN,
    TRANSITION_GRANT_SUCCESS,
    TRANSITION_GRANT_ERROR,
    TRANSITION_DENY_SUCCESS,
    TRANSITION_DENY_NOTHING,
    TRANSITION_DENY_ERROR,
    TRANSITION_BLOCK_SUCCESS,
    TRANSITION_BLOCK_NOTHING,
    TRANSITION_BLOCK_ERROR,
    TRANSITION_UNBLOCK_SUCCESS,
    TRANSITION_UNBLOCK_NOTHING,
    TRANSITION_UNBLOCK_ERROR,
    TRANSITION_KICK_SUCCESS,
    TRANSITION_KICK_ERROR
];

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_DEFAULT ]: ALL_TRANSITIONS,
    [ STATE_PUBLIC ]: ALL_TRANSITIONS,
    [ STATE_PRIVATE ]: ALL_TRANSITIONS,
    [ STATE_HIDDEN ]: ALL_TRANSITIONS,
    [ STATE_SHOWN ]: ALL_TRANSITIONS,
    [ STATE_GRANTED ]: ALL_TRANSITIONS,
    [ STATE_DENIED ]: ALL_TRANSITIONS,
    [ STATE_BLOCKED ]: ALL_TRANSITIONS,
    [ STATE_UNBLOCKED ]: ALL_TRANSITIONS,
    [ STATE_KICKED ]: ALL_TRANSITIONS,
    [ STATE_ERROR ]: ALL_TRANSITIONS,
    [ STATE_NOTHING_CHANGED ]: ALL_TRANSITIONS
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_SET_PUBLIC ]: STATE_PUBLIC,
    [ TRANSITION_SET_PRIVATE ]: STATE_PRIVATE,
    [ TRANSITION_SET_HIDDEN ]: STATE_HIDDEN,
    [ TRANSITION_SET_SHOWN ]: STATE_SHOWN,
    [ TRANSITION_GRANT_SUCCESS ]: STATE_GRANTED,
    [ TRANSITION_GRANT_ERROR ]: STATE_ERROR,
    [ TRANSITION_DENY_SUCCESS ]: STATE_DENIED,
    [ TRANSITION_DENY_NOTHING ]: STATE_NOTHING_CHANGED,
    [ TRANSITION_DENY_ERROR ]: STATE_ERROR,
    [ TRANSITION_BLOCK_SUCCESS ]: STATE_BLOCKED,
    [ TRANSITION_BLOCK_NOTHING ]: STATE_NOTHING_CHANGED,
    [ TRANSITION_BLOCK_ERROR ]: STATE_ERROR,
    [ TRANSITION_UNBLOCK_SUCCESS ]: STATE_UNBLOCKED,
    [ TRANSITION_UNBLOCK_NOTHING ]: STATE_NOTHING_CHANGED,
    [ TRANSITION_UNBLOCK_ERROR ]: STATE_ERROR,
    [ TRANSITION_KICK_SUCCESS ]: STATE_KICKED,
    [ TRANSITION_KICK_ERROR ]: STATE_ERROR
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelPermissionsFlowData )[]> = {
    [ TRANSITION_GRANT_SUCCESS ]: [ "userGrantedDisplayName" ],
    [ TRANSITION_DENY_SUCCESS ]: [ "userDeniedDisplayName" ],
    [ TRANSITION_BLOCK_SUCCESS ]: [ "userBlockedDisplayName" ],
    [ TRANSITION_UNBLOCK_SUCCESS ]: [ "userUnBlockedDisplayName" ],
    [ TRANSITION_KICK_SUCCESS ]: [ "userKickedDisplayName" ],
    [ TRANSITION_SET_PUBLIC ]: [],
    [ TRANSITION_SET_PRIVATE ]: [],
    [ TRANSITION_SET_HIDDEN ]: [],
    [ TRANSITION_SET_SHOWN ]: [],
    [ TRANSITION_GRANT_ERROR ]: [],
    [ TRANSITION_DENY_NOTHING ]: [],
    [ TRANSITION_DENY_ERROR ]: [],
    [ TRANSITION_BLOCK_NOTHING ]: [],
    [ TRANSITION_BLOCK_ERROR ]: [],
    [ TRANSITION_UNBLOCK_NOTHING ]: [],
    [ TRANSITION_UNBLOCK_ERROR ]: [],
    [ TRANSITION_KICK_ERROR ]: []
};

const FLOW_STATE_OPTIONS: Record<string, JsonObject> = {
    [ STATE_DEFAULT ]: {
        executionStep: "default"
    },
    [ STATE_PUBLIC ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePublic"
    },
    [ STATE_PRIVATE ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStatePrivate"
    },
    [ STATE_HIDDEN ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateHidden"
    },
    [ STATE_SHOWN ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateShown"
    },
    [ STATE_GRANTED ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsGranted"
    },
    [ STATE_DENIED ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsDenied"
    },
    [ STATE_BLOCKED ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsBlocked"
    },
    [ STATE_UNBLOCKED ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked"
    },
    [ STATE_KICKED ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsKick"
    },
    [ STATE_ERROR ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError"
    },
    [ STATE_NOTHING_CHANGED ]: {
        executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged"
    }
};

/**
 * Flow that consolidates all dynamic channel permission outcomes.
 */
export class DynamicChannelPermissionsFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelPermissionsFlowData
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

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPermissionsFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return FLOW_STATE_OPTIONS;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelPermissionsComponent ];
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
        return STATE_DEFAULT;
    }

    protected override getInitialData(): DynamicChannelPermissionsFlowData {
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

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPermissionsFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelPermissionsFlow;

