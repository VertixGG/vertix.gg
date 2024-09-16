import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelDataOwnerBase  } from "@vertix.gg/base/src/bases/model-data-owner-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";

const client = PrismaBotClient.$.getClient();

export class GuildDataModel extends ModelDataOwnerBase<
    typeof client.guild,
    typeof client.guildData,
    PrismaBot.GuildData,
    TDataOwnerDefaultUniqueKeys
> {
    public static getName() {
        return "VertixBase/Models/GuildDataV3";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", GuildDataModel.getName() ),
            isDebugEnabled( "MODEL", GuildDataModel.getName() )
        );
    }

    protected getModel() {
        return client.guild;
    }

    protected getDataModel() {
        return client.guildData;
    }

    protected getDataVersion() {
        // No backwards compatibility required.
        return "0.0.0.0" as const;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }
}
