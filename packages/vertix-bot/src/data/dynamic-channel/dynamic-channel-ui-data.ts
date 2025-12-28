import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";
import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

export interface DynamicChannelUIDataIdentifier {
    channel?: VoiceChannel | null;
    channelId?: string;
    channelName?: string;
    userLimit?: number;
    region?: string | null;
    state?: string;
    ownerId?: string;
    masterChannelId?: string;
    guildId?: string;
    masterChannelIndex?: number;
    memberRoleIds?: string[];
}

export interface DynamicChannelUIDataResult {
    channelName: string;
    userLimit: number;
    state: string;
    channelId: string;
    region: string | null;
    dynamicChannelButtonsTemplate: string[];
    title?: string;
    description?: string;
    masterChannelId?: string;
    masterChannelIndex?: number;
    dynamicChannelNameTemplate?: string;
    dynamicChannelLogsChannelId?: string | null;
    dynamicChannelMentionable?: boolean;
    dynamicChannelAutoSave?: boolean;
    dynamicChannelVerifiedRoles?: string[];
    dynamicChannelIncludeEveryoneRole?: boolean;
}

export class DynamicChannelUIData extends UIDataBase<DynamicChannelUIDataResult> {
    private readonly logger = new Logger( DynamicChannelUIData.getName() );

    public static getName(): string {
        return "VertixBot/Data/DynamicChannelUIData";
    }

    // Not used for this read-model component.
    public async create(): Promise<DynamicChannelUIDataResult> {
        throw new Error( "DynamicChannelUIData#create is not supported" );
    }

    public async update(): Promise<DynamicChannelUIDataResult> {
        throw new Error( "DynamicChannelUIData#update is not supported" );
    }

    public async delete(): Promise<boolean> {
        throw new Error( "DynamicChannelUIData#delete is not supported" );
    }

    public async read(
        identifier: DynamicChannelUIDataIdentifier
    ): Promise<DynamicChannelUIDataResult | null> {
        const { ownerId } = identifier;

        const channel = identifier.channel ?? null;
        const channelId = channel?.id || identifier.channelId;
        const guildId = identifier.guildId ?? ( channel ? channel.guild.id : undefined );
        const requestedMasterChannelId = identifier.masterChannelId ?? null;

        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
        const state = channel
            ? await dynamicChannelService.getChannelPrivacyState( channel )
            : identifier.state ?? "public";

        const args: DynamicChannelUIDataResult = {
            channelName: channel?.name ?? identifier.channelName ?? "Dynamic Channel",
            userLimit: channel?.userLimit ?? identifier.userLimit ?? 0,
            state,
            channelId: channelId ?? "unknown",
            region: channel?.rtcRegion ?? identifier.region ?? null,
            dynamicChannelButtonsTemplate: []
        };

        let masterChannelDB: ChannelExtended | null = null;

        if ( requestedMasterChannelId ) {
            masterChannelDB = await ChannelModel.$.getByChannelId( requestedMasterChannelId );
        }

        if ( !masterChannelDB && channelId ) {
            masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channelId );
        }

        if ( masterChannelDB ) {
            const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
                "Vertix/Config/MasterChannel",
                VERSION_UI_V3
            ).data;
            const masterChannelSettings = await MasterChannelDataModelV3.$.getSettings( masterChannelDB.id );
            const templateButtons = masterChannelSettings?.dynamicChannelButtonsTemplate;
            const templateButtonsByRole = masterChannelSettings?.dynamicChannelButtonsTemplateByRole ?? {};

            const matchedButtons = new Set<string>();
            const memberRoleIds = identifier.memberRoleIds ?? [];

            for ( const roleId of memberRoleIds ) {
                const override = templateButtonsByRole[ roleId ];
                if ( Array.isArray( override ) ) {
                    for ( const buttonId of override ) {
                        matchedButtons.add( buttonId );
                    }
                }
            }

            const resolvedButtons = matchedButtons.size
                ? Array.from( matchedButtons )
                : ( templateButtons?.length ? templateButtons : [] );

            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.sortIds( resolvedButtons );
            args.masterChannelId = masterChannelDB.channelId;
            args.dynamicChannelNameTemplate = masterChannelSettings?.dynamicChannelNameTemplate
                ?? configV3.settings.dynamicChannelNameTemplate;
            args.dynamicChannelLogsChannelId = masterChannelSettings?.dynamicChannelLogsChannelId ?? null;
            args.dynamicChannelMentionable = masterChannelSettings?.dynamicChannelMentionable
                ?? configV3.settings.dynamicChannelMentionable;
            args.dynamicChannelAutoSave = masterChannelSettings?.dynamicChannelAutoSave
                ?? configV3.settings.dynamicChannelAutoSave;

            if ( guildId ) {
                const verifiedRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, guildId );
                args.dynamicChannelVerifiedRoles = verifiedRoles;
                args.dynamicChannelIncludeEveryoneRole = verifiedRoles.includes( guildId );
            }

            if ( !args.dynamicChannelVerifiedRoles ) {
                args.dynamicChannelVerifiedRoles = [];
            }
            if ( args.dynamicChannelIncludeEveryoneRole === undefined ) {
                args.dynamicChannelIncludeEveryoneRole = false;
            }

            if ( !args.masterChannelIndex && guildId ) {
                const masters = await ChannelModel.$.getMasters( guildId );
                const index = masters.findIndex( master => master.channelId === masterChannelDB!.channelId );
                if ( index >= 0 ) {
                    args.masterChannelIndex = index;
                }
            }

            if ( ownerId ) {
                const primaryMessage = await UserMasterChannelDataModel.$.getPrimaryMessage(
                    ownerId,
                    masterChannelDB.id
                );

                args.title = primaryMessage?.title || configV3.constants.dynamicChannelPrimaryMessageTitle;
                args.description = primaryMessage?.description || configV3.constants.dynamicChannelPrimaryMessageDescription;
            }
        } else {
            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() );
        }

        return args;
    }
}
