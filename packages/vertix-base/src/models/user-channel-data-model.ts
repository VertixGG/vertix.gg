import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { DataOwnerModelBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

import type { TDataVersioningDefaultUniqueKeys } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

const client = PrismaBotClient.$.getClient();

interface TDataOwnerUniqueKeys extends TDataVersioningDefaultUniqueKeys {
    ownerId: string;
    channelId: string;
}

export class UserChannelDataModel extends DataOwnerModelBase<
    typeof client.user,
    typeof client.userChannelData,
    PrismaBot.UserChannelData,
    TDataOwnerUniqueKeys
> {
    private static instance: UserChannelDataModel;

    public static getName() {
        return "VertixBase/Models/UserWithChannelData";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", UserChannelDataModel.getName() ),
            isDebugEnabled( "MODEL", UserChannelDataModel.getName() )
        );
    }

    public static get $() {
        if ( ! this.instance ) {
            this.instance = new UserChannelDataModel();
        }

        return this.instance;
    }

    protected getModel() {
        return client.user;
    }

    protected getDataModel() {
        return client.userChannelData;
    }

    protected getDataVersion() {
        return "0.0.0" as const;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_channelId_key_version";
    }

    public async setPrimaryMessage( userId: string, channelId: string, content: { title?: string, description?: string} ) {
        return this.upsertByOwner( { where: { userId } }, { channelId, key: "PrimaryMessage" }, content );
    }

    public async getPrimaryMessage( userId: string, channelId: string ) {
        return this.getByOwner<{
            title?: string,
            description?: string
        }>( { where: { userId } }, { channelId, key: "PrimaryMessage" } );
    }
}

