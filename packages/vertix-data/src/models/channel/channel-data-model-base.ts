import { clientChannelExtend } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import { ModelDataOwnerBase } from "@vertix.gg/data/src/bases/model-data-owner-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/data/src/bases/model-data-owner-base";

export abstract class ChannelDataModelBase extends ModelDataOwnerBase<
    typeof clientChannelExtend.channel,
    typeof clientChannelExtend.channelData,
    PrismaBot.ChannelData,
    TDataOwnerDefaultUniqueKeys
> {
    public static getName() {
        return "VertixBase/Models/ChannelDataModelBase";
    }

    protected getModel() {
        return clientChannelExtend.channel;
    }

    protected getDataModel() {
        return clientChannelExtend.channelData;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }
}
