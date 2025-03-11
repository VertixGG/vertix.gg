import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedElapsedTimeBase } from "@vertix.gg/gui/src/bases/ui-embed-time-elapsed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelResetChannelButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-button";

import type { IDynamicResetChannelResult } from "@vertix.gg/bot/src/definitions/dynamic-channel";

export class DynamicChannelResetChannelEmbed extends UIEmbedElapsedTimeBase {
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

        /** @since 0.0.8 */

        region: uiUtilsWrapAsTemplate( "region" ),
        regionChanged: uiUtilsWrapAsTemplate( "regionChanged" ),

        primaryMessageChanged: uiUtilsWrapAsTemplate( "primaryMessageChanged" ),

        /** @end @since */

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersChanged: uiUtilsWrapAsTemplate( "allowedUsersChanged" ),

        blockedUsers: uiUtilsWrapAsTemplate( "blockedUsers" ),
        blockedUsersChanged: uiUtilsWrapAsTemplate( "blockedUsersChanged" ),

        rateLimited: uiUtilsWrapAsTemplate( "rateLimited" ),
        rateLimitedNone: uiUtilsWrapAsTemplate( "rateLimitedNone" ),
        rateLimitedDisplay: uiUtilsWrapAsTemplate( "rateLimitedDisplay" ),

        resetEmoji: uiUtilsWrapAsTemplate( "resetEmoji" )
    };

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelResetChannelEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getEndTime( args: IDynamicResetChannelResult ): Date {
        return new Date( Date.now() + ( args.rateLimitRetryAfter || 30000 ) * 1000 );
    }

    protected getColor() {
        return 0x7a9cbd;
    }

    protected getTitle() {
        return `${ DynamicChannelResetChannelEmbed.vars.resetEmoji }  Dynamic Channel has been reset to default settings! `;
    }

    protected getDescription() {
        const {
            name,
            nameChanged,

            userLimit,
            userLimitChanged,

            state,
            stateChanged,

            visibilityState,
            visibilityStateChanged,

            region,
            regionChanged,

            primaryMessageChanged,

            allowedUsers,
            allowedUsersChanged,

            blockedUsers,
            blockedUsersChanged,

            rateLimited
        } = DynamicChannelResetChannelEmbed.vars;

        return (
            "Settings has been reset to default:\n\n" +
            `- Name: **${ name }** ${ nameChanged }\n` +
            `- User limit: ✋**${ userLimit }** ${ userLimitChanged }\n` +
            `- State: ${ state } ${ stateChanged }\n` +
            `- Visibility State: ${ visibilityState } ${ visibilityStateChanged }\n` +
            `- Region: ${ region } ${ regionChanged }\n` +
            `- Primary Message: ${ primaryMessageChanged }\n` +
            `- Allowed Users: ${ allowedUsers } ${ allowedUsersChanged }\n` +
            `- Blocked Users: ${ blockedUsers } ${ blockedUsersChanged }` +
            rateLimited
        );
    }

    protected getOptions() {
        const {
            userLimitUnlimited,
            userLimitValue,

            statePublic,
            statePrivate,

            visibilityStateShown,
            visibilityStateHidden,

            rateLimitedNone,
            rateLimitedDisplay
        } = DynamicChannelResetChannelEmbed.vars;

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

    protected getArrayOptions() {
        const { separator, value } = DynamicChannelResetChannelEmbed.vars;

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

    protected getLogic( args: IDynamicResetChannelResult ) {
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
            } = DynamicChannelResetChannelEmbed.vars,
            { newState, oldState } = args;

        const primaryMessageChanged = () => {
            const oldMessage = ( oldState?.primaryMessageTitle || "" ) + ( oldState?.primaryMessageDescription || "" ),
                newMessage = ( newState?.primaryMessageTitle || "" ) + ( newState?.primaryMessageDescription || "" );

            return newMessage !== oldMessage ? changedDisplay : unchangedDisplay;
        };

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

            region: newState?.region,
            regionChanged: newState?.region !== oldState?.region ? changedDisplay : unchangedDisplay,

            primaryMessageChanged: primaryMessageChanged(),

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

            rateLimited: args.rateLimitRetryAfter ? rateLimitedDisplay : rateLimitedNone,

            resetEmoji: DynamicChannelResetChannelButton.getEmoji()
        };
    }
}
