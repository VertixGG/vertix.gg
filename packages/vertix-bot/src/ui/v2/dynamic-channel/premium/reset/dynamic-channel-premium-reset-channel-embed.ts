import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedElapsedTimeBase } from "@vertix.gg/gui/src/bases/ui-embed-time-elapsed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { IDynamicResetChannelResult } from "@vertix.gg/bot/src/definitions/dynamic-channel";

export class DynamicChannelPremiumResetChannelEmbed extends UIEmbedElapsedTimeBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        changedDisplay: uiUtilsWrapAsTemplate( "changedDisplay" ),
        unchangedDisplay: uiUtilsWrapAsTemplate( "unchangedDisplay" ),

        name: uiUtilsWrapAsTemplate( "name" ),
        nameChanged: uiUtilsWrapAsTemplate( "nameChanged" ),

        userLimit: uiUtilsWrapAsTemplate( "userLimit" ),
        userLimitValue: uiUtilsWrapAsTemplate( "userLimitValue" ),
        userLimitUnlimited: uiUtilsWrapAsTemplate( "userLimitUnlimited" ),
        userLimitChanged: uiUtilsWrapAsTemplate( "userLimitChanged" ),

        state: uiUtilsWrapAsTemplate( "state" ),
        statePublic: uiUtilsWrapAsTemplate( "statePublic" ),
        statePrivate: uiUtilsWrapAsTemplate( "statePrivate" ),
        stateChanged: uiUtilsWrapAsTemplate( "stateChanged" ),

        visibilityState: uiUtilsWrapAsTemplate( "visibilityState" ),
        visibilityStateShown: uiUtilsWrapAsTemplate( "visibilityStateShown" ),
        visibilityStateHidden: uiUtilsWrapAsTemplate( "visibilityStateHidden" ),
        visibilityStateChanged: uiUtilsWrapAsTemplate( "visibilityStateChanged" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersChanged: uiUtilsWrapAsTemplate( "allowedUsersChanged" ),

        blockedUsers: uiUtilsWrapAsTemplate( "blockedUsers" ),
        blockedUsersChanged: uiUtilsWrapAsTemplate( "blockedUsersChanged" ),

        rateLimited: uiUtilsWrapAsTemplate( "rateLimited" ),
        rateLimitedNone: uiUtilsWrapAsTemplate( "rateLimitedNone" ),
        rateLimitedDisplay: uiUtilsWrapAsTemplate( "rateLimitedDisplay" )
    };

    public static getName () {
        return "Vertix/UI-V2/DynamicChannelPremiumResetChannelEmbed";
    }

    public static getInstanceType (): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getEndTime ( args: IDynamicResetChannelResult ): Date {
        return new Date( Date.now() + ( args.rateLimitRetryAfter || 30000 ) * 1000 );
    }

    protected getColor () {
        return 0x7a9cbd;
    }

    protected getTitle () {
        return "🔃  Dynamic Channel has been reset to default settings! ";
    }

    protected getDescription () {
        const {
            name,
            nameChanged,

            userLimit,
            userLimitChanged,

            state,
            stateChanged,

            visibilityState,
            visibilityStateChanged,

            allowedUsers,
            allowedUsersChanged,

            blockedUsers,
            blockedUsersChanged,

            rateLimited
        } = DynamicChannelPremiumResetChannelEmbed.vars;

        return (
            "Settings has been reset to default:\n\n" +
            `- Name: **${ name }** ${ nameChanged }\n` +
            `- User limit: ✋**${ userLimit }** ${ userLimitChanged }\n` +
            `- State: ${ state } ${ stateChanged }\n` +
            `- Visibility State: ${ visibilityState } ${ visibilityStateChanged }\n` +
            `- Allowed Users: ${ allowedUsers } ${ allowedUsersChanged }\n` +
            `- Blocked Users: ${ blockedUsers } ${ blockedUsersChanged }` +
            rateLimited
        );
    }

    protected getOptions () {
        const {
            userLimitUnlimited,
            userLimitValue,

            statePublic,
            statePrivate,

            visibilityStateShown,
            visibilityStateHidden,

            rateLimitedNone,
            rateLimitedDisplay
        } = DynamicChannelPremiumResetChannelEmbed.vars;

        return {
            changedDisplay: "(__restored__)",
            unchangedDisplay: "(__unchanged__)",

            userLimit: {
                [ userLimitValue ]: userLimitValue,
                [ userLimitUnlimited ]: "Unlimited"
            },
            state: {
                [ statePublic ]: "🌐 **Public**",
                [ statePrivate ]: "🚫 **Private**"
            },
            visibilityState: {
                [ visibilityStateShown ]: "🐵 **Shown**",
                [ visibilityStateHidden ]: "🙈 **Hidden**"
            },
            rateLimited: {
                [ rateLimitedNone ]: "",
                [ rateLimitedDisplay ]:
                    "\n\n" +
                    "⚠️ Renaming cannot be performed at the moment due to rate limit restrictions.\n\n" +
                    `Please wait for ${ this.getElapsedTimeFormatFractionVariable() } seconds or create a new channel instead.`
            }
        };
    }

    protected getArrayOptions () {
        const { separator, value } = DynamicChannelPremiumResetChannelEmbed.vars;

        return {
            allowedUsers: {
                format: `<@${ value }>${ separator }`,
                separator: ", "
            },
            blockedUsers: {
                format: `<@${ value }>${ separator }`,
                separator: ", "
            }
        };
    }

    protected getLogic ( args: IDynamicResetChannelResult ) {
        const {
                changedDisplay,
                unchangedDisplay,

                userLimitUnlimited,
                userLimitValue,

                statePublic,
                statePrivate,

                visibilityStateShown,
                visibilityStateHidden,

                rateLimitedNone,
                rateLimitedDisplay
            } = DynamicChannelPremiumResetChannelEmbed.vars,
            { newState, oldState } = args;

        return {
            name: newState?.name,
            nameChanged: newState?.name !== oldState?.name ? changedDisplay : unchangedDisplay,

            userLimit: 0 === newState?.userLimit ? userLimitUnlimited : userLimitValue,
            userLimitChanged: newState?.userLimit !== oldState?.userLimit ? changedDisplay : unchangedDisplay,
            userLimitValue: newState?.userLimit,

            state: newState?.state === "public" ? statePublic : statePrivate,
            stateChanged: newState?.state !== oldState?.state ? changedDisplay : unchangedDisplay,

            visibilityState: newState?.visibilityState === "shown" ? visibilityStateShown : visibilityStateHidden,
            visibilityStateChanged:
                newState?.visibilityState !== oldState?.visibilityState ? changedDisplay : unchangedDisplay,

            allowedUsers: newState?.allowedUserIds,
            allowedUsersChanged:
                JSON.stringify( newState?.allowedUserIds ) !== JSON.stringify( oldState?.allowedUserIds )
                    ? changedDisplay
                    : unchangedDisplay,

            blockedUsers: newState?.blockedUserIds,
            blockedUsersChanged:
                JSON.stringify( newState?.blockedUserIds ) !== JSON.stringify( oldState?.blockedUserIds )
                    ? changedDisplay
                    : unchangedDisplay,

            rateLimited: args.rateLimitRetryAfter ? rateLimitedDisplay : rateLimitedNone
        };
    }
}
