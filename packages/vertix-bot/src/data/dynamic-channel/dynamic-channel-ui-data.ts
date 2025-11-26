import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

export interface DynamicChannelUiDataIdentifier {
    channel: VoiceChannel;
    ownerId?: string;
}

export interface DynamicChannelUiDataResult {
    channelName: string;
    userLimit: number;
    state: string;
    channelId: string;
    region: string | null;
    dynamicChannelButtonsTemplate: string[];
    title?: string;
    description?: string;
}

export class DynamicChannelUiData extends UIDataBase<DynamicChannelUiDataResult> {
    private readonly logger = new Logger( DynamicChannelUiData.getName() );

    public static getName(): string {
        return "VertixBot/Data/DynamicChannelUiData";
    }

    // Not used for this read-model component.
    public async create(): Promise<DynamicChannelUiDataResult> {
        throw new Error( "DynamicChannelUiData#create is not supported" );
    }

    public async update(): Promise<DynamicChannelUiDataResult> {
        throw new Error( "DynamicChannelUiData#update is not supported" );
    }

    public async delete(): Promise<boolean> {
        throw new Error( "DynamicChannelUiData#delete is not supported" );
    }

    public async read(
        identifier: DynamicChannelUiDataIdentifier
    ): Promise<DynamicChannelUiDataResult | null> {
        const { channel, ownerId } = identifier;

        if ( !channel ) {
            this.logger.warn( this.read, "No channel provided for DynamicChannelUiData.read" );
            return null;
        }

        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
        const state = await dynamicChannelService.getChannelPrivacyState( channel );

        const args: DynamicChannelUiDataResult = {
            channelName: channel.name,
            userLimit: channel.userLimit,
            state,
            channelId: channel.id,
            region: channel.rtcRegion,
            dynamicChannelButtonsTemplate: []
        };

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        if ( masterChannelDB ) {
            const settings = await MasterChannelDataModelV3.$.getSettings( masterChannelDB.id );
            const templateButtons = settings?.dynamicChannelButtonsTemplate;

            args.dynamicChannelButtonsTemplate = templateButtons?.length
                ? DynamicChannelPrimaryMessageElementsGroup.sortIds( templateButtons )
                : DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() );

            if ( ownerId ) {
                const primaryMessage = await UserMasterChannelDataModel.$.getPrimaryMessage(
                    ownerId,
                    masterChannelDB.id
                );

                const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
                    "Vertix/Config/MasterChannel",
                    VERSION_UI_V3
                );

                args.title = primaryMessage?.title || configV3.data.constants.dynamicChannelPrimaryMessageTitle;
                args.description = primaryMessage?.description || configV3.data.constants.dynamicChannelPrimaryMessageDescription;
            }
        } else {
            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() );
        }

        return args;
    }
}
