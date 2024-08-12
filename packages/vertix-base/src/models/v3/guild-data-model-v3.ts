import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { DataOwnerModelBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

const client = PrismaBotClient.$.getClient();

export class GuildDataModelV3 extends DataOwnerModelBase<
    typeof client.guild,
    typeof client.guildData,
    PrismaBot.GuildData
> {
    public static getName() {
        return "VertixBase/Models/GuildDataV3";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", GuildDataModelV3.getName() ),
            isDebugEnabled( "MODEL", GuildDataModelV3.getName() )
        );
    }

    protected getModel() {
        return client.guild;
    }

    protected getDataModel() {
        return client.guildData;
    }

    protected getDataVersion() {
        return VERSION_UI_V3;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }
}
