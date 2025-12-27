import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-embed";
import { DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-embed";
import { DYNAMIC_CHANNEL_REGION_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-embed";
import { DYNAMIC_CHANNEL_PRIVACY_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-embed";

import { DynamicChannelLimitMetaButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-meta-button";
import { DynamicChannelRenameButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-button";
import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";
import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
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

const DynamicChannelPrimaryMessageEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( "https://i.imgur.com/sGjDVJ4.png" )
    .setTitle( () => vars.title )
    .setDescription( () => (
        `${ vars.description }\n\n` +
        `${ vars.renameEmoji } ・ Name: **${ vars.name }**\n\n` +
        `${ vars.limitEmoji } ・ User Limit: **${ vars.limit }**\n\n` +
        `${ vars.privacyEmoji } ・ Privacy State: **${ vars.state }**\n\n` +
        `${ vars.regionEmoji } ・ Region:  **${ vars.region }**\n`
    ) )
    .setOptions( () => {
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
        const { limitDisplayValue, limitDisplayUnlimited } = vars;

        const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 );

        const logic: Record<string, any> = {
            name: args.channelName,
            limit: 0 === args.userLimit ? limitDisplayUnlimited : limitDisplayValue,
            limitValue: args.userLimit,
            renameEmoji: DynamicChannelRenameButton.getEmoji(),
            limitEmoji: DynamicChannelLimitMetaButton.getEmoji(),
            privacyEmoji: DynamicChannelPrivacyButton.getEmoji(),
            title: args.title || configV3.data.constants.dynamicChannelPrimaryMessageTitle,
            description: args.description || configV3.data.constants.dynamicChannelPrimaryMessageDescription,
            region: args.region || "Automatic",
            regionEmoji: DynamicChannelRegionButton.getEmoji()
        };

        switch ( args.state ) {
            default:
            case "public":
                logic.state = vars.statePublic;
                break;
            case "private":
                logic.state = vars.statePrivate;
                break;
            case "shown":
                logic.state = vars.stateShown;
                break;
            case "hidden":
                logic.state = vars.stateHidden;
                break;
        }

        return logic;
    } )
    .setDefaultVars( () => {
        const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 );

        return {
            renameEmoji: DynamicChannelRenameButton.getEmoji(),
            limitEmoji: DynamicChannelLimitMetaButton.getEmoji(),
            privacyEmoji: DynamicChannelPrivacyButton.getEmoji(),
            regionEmoji: DynamicChannelRegionButton.getEmoji(),
            title: configV3.data.constants.dynamicChannelPrimaryMessageTitle,
            description: configV3.data.constants.dynamicChannelPrimaryMessageDescription,
        };
    } )
    .build();

export { DynamicChannelPrimaryMessageEmbed };
