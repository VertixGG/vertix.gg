import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { DataOwnerModelBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

const client = PrismaBotClient.$.getClient();

export class GuildDataModel extends DataOwnerModelBase<
    typeof client.guild,
    typeof client.guildData,
    PrismaBot.GuildData
> {
    public static getName() {
        return "VertixBase/Models/GuildData";
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
        return "0.0.0" as const;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }

    public async getUIVersion( guildId: string ) {
        return this.getByOwner( { where: { guildId } }, {
            key: "UIVersion"
        } );
    }

    public async createUIVersion( guildId: string, uiVersion: string ) {
        return this.createByOwner( { where: { guildId } }, {
            key: "UIVersion"
        }, uiVersion );
    }
}
