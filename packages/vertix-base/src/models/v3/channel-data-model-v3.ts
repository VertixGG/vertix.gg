import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { DataOwnerModelBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

const client = PrismaBotClient.$.getClient();

export class ChannelDataModelV3 extends DataOwnerModelBase<
    typeof client.channel,
    typeof client.channelData,
    PrismaBot.UserData
> {
    public static getName() {
        return "VertixBase/Models/ChannelDataV3";
    }

    public constructor(
        showCacheDebug = isDebugEnabled( "CACHE", ChannelDataModelV3.getName() ),
        showModelDebug = isDebugEnabled( "MODEL", ChannelDataModelV3.getName() )
    )  {
        super( showCacheDebug, showModelDebug );
    }

    protected getModel() {
        return client.channel;
    }

    protected getDataModel() {
        return client.channelData;
    }

    protected getDataVersion() {
        return VERSION_UI_V3;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }
}
