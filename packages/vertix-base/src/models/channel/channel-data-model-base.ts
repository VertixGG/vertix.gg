import { clientChannelExtend } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import { ModelDataOwnerBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";

export abstract class ChannelDataModelBase extends ModelDataOwnerBase<
    typeof clientChannelExtend.channel,
    typeof clientChannelExtend.channelData,
    PrismaBot.ChannelData,
    TDataOwnerDefaultUniqueKeys
> {
    public static getName () {
        return "VertixBase/Models/ChannelDataModelBase";
    }

    protected getModel () {
        return clientChannelExtend.channel;
    }

    protected getDataModel () {
        return clientChannelExtend.channelData;
    }

    protected getDataUniqueKeyName () {
        return "ownerId_key_version";
    }
}
