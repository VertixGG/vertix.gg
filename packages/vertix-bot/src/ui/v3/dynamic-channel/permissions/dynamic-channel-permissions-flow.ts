import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelPermissionsFlowData extends UIFlowDataBase {
    userGrantedDisplayName?: string;
    userDeniedDisplayName?: string;
    userBlockedDisplayName?: string;
    userUnBlockedDisplayName?: string;
    userKickedDisplayName?: string;
}

/**
 * Flow that consolidates all dynamic channel permission outcomes.
 */
export class DynamicChannelPermissionsFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelPermissionsFlowData
> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelPermissionsFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        const transitions: string[] = [
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPublic",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPrivate",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetHidden",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetShown",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessSuccess",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessError",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessSuccess",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessNothingChanged",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessError",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserSuccess",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserNothingChanged",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserError",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserSuccess",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserNothingChanged",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserError",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserSuccess",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserError"
        ];

        return {
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Default": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Public": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Private": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Hidden": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Shown": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Granted": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Denied": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Blocked": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Unblocked": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Kicked": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error": transitions,
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged": transitions
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPublic": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Public",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPrivate": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Private",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetHidden": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Hidden",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetShown": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Shown",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessSuccess": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Granted",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessError": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessSuccess": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Denied",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessNothingChanged": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessError": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserSuccess": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Blocked",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserNothingChanged": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserError": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserSuccess": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Unblocked",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserNothingChanged": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserError": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserSuccess": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Kicked",
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserError": "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPermissionsFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessSuccess": [ "userGrantedDisplayName" ],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessSuccess": [ "userDeniedDisplayName" ],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserSuccess": [ "userBlockedDisplayName" ],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserSuccess": [ "userUnBlockedDisplayName" ],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserSuccess": [ "userKickedDisplayName" ],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPublic": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetPrivate": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetHidden": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/SetShown": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantAccessError": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessNothingChanged": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenyAccessError": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserNothingChanged": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockUserError": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserNothingChanged": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockUserError": [],
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickUserError": []
        };
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return {
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Default": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "default",

                previewVars: [ "permissionsEmoji", "allowedUsersDisplay", "blockedUsersDisplay" ]
            },
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Granted": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsGranted",

                previewVars: [ "userGrantedDisplayName", "allowedUsersDisplay", "blockedUsersDisplay" ]
            },
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Denied": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsDenied",

                previewVars: [ "userDeniedDisplayName", "allowedUsersDisplay", "blockedUsersDisplay" ]
            },
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Blocked": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsBlocked",

                previewVars: [ "userBlockedDisplayName", "allowedUsersDisplay", "blockedUsersDisplay" ]
            },
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Unblocked": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked",

                previewVars: [ "userUnBlockedDisplayName", "allowedUsersDisplay", "blockedUsersDisplay" ]
            },
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Kicked": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsKick",

                previewVars: [ "userKickedDisplayName", "allowedUsersDisplay", "blockedUsersDisplay" ]
            },
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Error": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError",
                previewEmbedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            },
            "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/NothingChanged": {
                component: "VertixBot/UI-V3/DynamicChannelPermissionsComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged",
                previewEmbedsGroup: "VertixBot/UI-General/NothingChangedEmbedGroup"
            }
        };
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
        return "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelPermissionsFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelPermissionsFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelPermissionsFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelPermissionsFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelPermissionsFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPermissionsFlowData )[] {
        return DynamicChannelPermissionsFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelPermissionsFlow;
