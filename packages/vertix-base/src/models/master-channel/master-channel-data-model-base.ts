import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelDataOwnerConfigBase } from "@vertix.gg/base/src/bases/model-data-owner-config-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";
import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

const client = PrismaBotClient.$.getClient();

export abstract class MasterChannelDataModelBase<T extends ConfigBaseInterface> extends ModelDataOwnerConfigBase<
    typeof client.channel,
    typeof client.channelData,
    PrismaBot.UserData,
    TDataOwnerDefaultUniqueKeys,
    T,
    "settings"
> {
    public static getName () {
        return "VertixBase/Models/MasterChannelDataModelBase";
    }

    protected getModel () {
        return client.channel;
    }

    protected getDataModel () {
        return client.channelData;
    }

    protected getDataUniqueKeyName () {
        return "ownerId_key_version";
    }

    protected getConfigSlice () {
        return "settings" as const;
    }
}
