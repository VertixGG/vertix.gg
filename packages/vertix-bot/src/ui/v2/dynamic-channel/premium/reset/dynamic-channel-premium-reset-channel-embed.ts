import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { IDynamicResetChannelResult } from "@vertix.gg/bot/src/definitions/dynamic-channel";

const vars = {
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
    rateLimitedDisplay: uiUtilsWrapAsTemplate( "rateLimitedDisplay" ),

    elapsedTimeFormatFraction: uiUtilsWrapAsTemplate( "elapsedTimeFormatFraction" )
};

const DynamicChannelPremiumResetChannelEmbed = new ElapsedEmbedBuilder<IDynamicResetChannelResult, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( Date.now() + ( args.rateLimitRetryAfter || 30000 ) * 1000 ) )
    .setColor( 0x7a9cbd )
    .setTitle( "🔃  Dynamic Channel has been reset to default settings! " )
    .setDescription( () => {
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
        } = vars;

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
    } )
    .setOptions( () => {
        const {
            userLimitUnlimited,
            userLimitValue,

            statePublic,
            statePrivate,

            visibilityStateShown,
            visibilityStateHidden,

            rateLimitedNone,
            rateLimitedDisplay,
            elapsedTimeFormatFraction
        } = vars;

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
                    `Please wait for ${ elapsedTimeFormatFraction } seconds or create a new channel instead.`
            }
        };
    } )
    .setArrayOptions( () => {
        const { separator, value } = vars;

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
    } )
    .setLogic( ( args: IDynamicResetChannelResult ) => {
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
            } = vars,
            { newState, oldState } = args;

        return {
            name: newState?.name ?? null,
            nameChanged: newState?.name !== oldState?.name ? changedDisplay : unchangedDisplay,

            userLimit: 0 === newState?.userLimit ? userLimitUnlimited : userLimitValue,
            userLimitChanged: newState?.userLimit !== oldState?.userLimit ? changedDisplay : unchangedDisplay,
            userLimitValue: newState?.userLimit ?? 0,

            state: newState?.state === "public" ? statePublic : statePrivate,
            stateChanged: newState?.state !== oldState?.state ? changedDisplay : unchangedDisplay,

            visibilityState: newState?.visibilityState === "shown" ? visibilityStateShown : visibilityStateHidden,
            visibilityStateChanged:
                newState?.visibilityState !== oldState?.visibilityState ? changedDisplay : unchangedDisplay,

            allowedUsers: newState?.allowedUserIds ?? [],
            allowedUsersChanged:
                JSON.stringify( newState?.allowedUserIds ) !== JSON.stringify( oldState?.allowedUserIds )
                    ? changedDisplay
                    : unchangedDisplay,

            blockedUsers: newState?.blockedUserIds ?? [],
            blockedUsersChanged:
                JSON.stringify( newState?.blockedUserIds ) !== JSON.stringify( oldState?.blockedUserIds )
                    ? changedDisplay
                    : unchangedDisplay,

            rateLimited: args.rateLimitRetryAfter ? rateLimitedDisplay : rateLimitedNone,
        };
    } )
    .setDefaultVars( () => ( {
        name: "My Channel",
        nameChanged: "(__unchanged__)",
        userLimit: "Unlimited",
        userLimitChanged: "(__unchanged__)",
        state: "🌐 **Public**",
        stateChanged: "(__unchanged__)",
        visibilityState: "🐵 **Shown**",
        visibilityStateChanged: "(__unchanged__)",
        allowedUsers: "None",
        allowedUsersChanged: "(__unchanged__)",
        blockedUsers: "None",
        blockedUsersChanged: "(__unchanged__)",
        rateLimited: ""
    } ) )
    .build();

export { DynamicChannelPremiumResetChannelEmbed };
