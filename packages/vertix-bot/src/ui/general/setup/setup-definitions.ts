import "@vertix.gg/prisma/bot-client";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export const MAX_EDIT_MASTER_BUTTONS_PER_ROW = 2;

export interface ISetupArgs extends UIArgs {
    masterChannels?: PrismaBot.Channel[];
    badwords?: string[];
    maxMasterChannels?: number;
}

export const SETUP_EMBED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    masterChannels: uiUtilsWrapAsTemplate( "masterChannels" ),
    masterChannelMessage: uiUtilsWrapAsTemplate( "masterChannelMessage" ),
    masterChannelMessageDefault: uiUtilsWrapAsTemplate( "masterChannelMessageDefault" ),
    masterChannelsOptions: {
        index: uiUtilsWrapAsTemplate( "index" ),
        name: uiUtilsWrapAsTemplate( "name" ),
        id: uiUtilsWrapAsTemplate( "id" ),
        channelsTemplateName: uiUtilsWrapAsTemplate( "channelsTemplateName" ),
        channelsTemplateButtons: uiUtilsWrapAsTemplate( "channelsTemplateButtons" ),
        channelsVerifiedRoles: uiUtilsWrapAsTemplate( "channelsVerifiedRoles" ),
        channelsLogsChannelId: uiUtilsWrapAsTemplate( "channelsLogsChannelId" ),
        channelsAutoSave: uiUtilsWrapAsTemplate( "channelsAutoSave" ),
        version: uiUtilsWrapAsTemplate( "version" )
    },
    badwords: uiUtilsWrapAsTemplate( "badwords" ),
    badwordsMessage: uiUtilsWrapAsTemplate( "badwordsMessage" ),
    badwordsMessageDefault: uiUtilsWrapAsTemplate( "badwordsMessageDefault" ),
    none: uiUtilsWrapAsTemplate( "none" )
};
