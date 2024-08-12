import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { DataOwnerModelBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

import type { TDataVersioningDefaultUniqueKeys } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

const client = PrismaBotClient.$.getClient();

interface TDataOwnerUniqueKeys extends TDataVersioningDefaultUniqueKeys {
    ownerId: string;
    channelId: string;
}

export class UserChannelDataModelV3 extends DataOwnerModelBase<
    typeof client.user,
    typeof client.userChannelData,
    PrismaBot.UserChannelData,
    TDataOwnerUniqueKeys
> {
    private static instance: UserChannelDataModelV3;

    public static getName() {
        return "VertixBase/Models/UserChannelDataV3";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", UserChannelDataModelV3.getName() ),
            isDebugEnabled( "MODEL", UserChannelDataModelV3.getName() )
        );
    }

    public static get $() {
        if ( ! this.instance ) {
            this.instance = new UserChannelDataModelV3();
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
        return VERSION_UI_V3;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_channelId_key_version";
    }

    public async setPrimaryMessage( userId: string, channelDBId: string, content: { title?: string, description?: string} ) {
        return this.upsert( { where: { userId } }, { channelId: channelDBId, key: "PrimaryMessage" }, content );
    }

    public async getPrimaryMessage( userId: string, channelDBId: string ) {
        return this.get<{
            title?: string,
            description?: string
        }>( { where: { userId } }, { channelId: channelDBId, key: "PrimaryMessage" } );
    }
}

