import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-embed";
import { DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-embed";
import { DYNAMIC_CHANNEL_REGION_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-embed";
import { DYNAMIC_CHANNEL_PRIVACY_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-embed";

import { DynamicChannelLimitMetaButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-meta-button";
import { DynamicChannelRenameButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-button";
import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS = {
    name: uiUtilsWrapAsTemplate( "name" ),
    limit: uiUtilsWrapAsTemplate( "limit" ),
    limitDisplayValue: uiUtilsWrapAsTemplate( "limitDisplayValue" ),
    limitDisplayUnlimited: uiUtilsWrapAsTemplate( "limitDisplayUnlimited" ),
    limitValue: uiUtilsWrapAsTemplate( "limitValue" ),

    state: DYNAMIC_CHANNEL_PRIVACY_VARS.state,
    statePublic: DYNAMIC_CHANNEL_PRIVACY_VARS.statePublic,
    statePrivate: DYNAMIC_CHANNEL_PRIVACY_VARS.statePrivate,
    stateShown: DYNAMIC_CHANNEL_PRIVACY_VARS.stateShown,
    stateHidden: DYNAMIC_CHANNEL_PRIVACY_VARS.stateHidden,

    renameEmoji: uiUtilsWrapAsTemplate( "renameEmoji" ),
    limitEmoji: uiUtilsWrapAsTemplate( "limitEmoji" ),
    privacyEmoji: uiUtilsWrapAsTemplate( "privacyEmoji" ),

    region: DYNAMIC_CHANNEL_REGION_VARS.region,
    regionEmoji: DYNAMIC_CHANNEL_REGION_VARS.regionEmoji,

    title: DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS.title,
    description: DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS.description
};

const DynamicChannelPrimaryMessageEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS>(
    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEmbed",
    DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( "https://i.imgur.com/sGjDVJ4.png" )
    .setTitle( () => DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.title )
    .setDescription( () => (
        `${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.description }\n\n` +
        `${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.renameEmoji } ・ Name: **${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.name }**\n\n` +
        `${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.limitEmoji } ・ User Limit: **${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.limit }**\n\n` +
        `${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.privacyEmoji } ・ Privacy State: **${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.state }**\n\n` +
        `${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.regionEmoji } ・ Region:  **${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS.region }**\n`
    ) )
    .setOptions( () => {
        const vars = DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS;
        return {
            limit: {
                [ vars.limitDisplayValue ]: vars.limitValue,
                [ vars.limitDisplayUnlimited ]: "Unlimited"
            },
            state: {
                [ vars.statePublic ]: "🌐 Public",
                [ vars.statePrivate ]: "🚫 Private",
                [ vars.stateShown ]: "🐵 Shown",
                [ vars.stateHidden ]: "🙈 Hidden"
            }
        };
    } )
    .setLogic( ( args: UIArgs ) => {
        const { limitDisplayValue, limitDisplayUnlimited } = DYNAMIC_CHANNEL_PRIMARY_MESSAGE_VARS;

        return {
            name: args.channelName,
            limit: 0 === args.userLimit ? limitDisplayUnlimited : limitDisplayValue,

            limitValue: args.userLimit,

            renameEmoji: DynamicChannelRenameButton.getEmoji(),
            limitEmoji: DynamicChannelLimitMetaButton.getEmoji(),
            privacyEmoji: DynamicChannelPrivacyButton.getEmoji()
        };
    } )
    .build();

export { DynamicChannelPrimaryMessageEmbed };
