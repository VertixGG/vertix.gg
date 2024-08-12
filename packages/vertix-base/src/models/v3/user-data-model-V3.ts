import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { DataOwnerModelBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

const client = PrismaBotClient.$.getClient();

export class UserDataModelV3 extends DataOwnerModelBase<
    typeof client.user,
    typeof client.userData,
    PrismaBot.UserData
> {
    public static getName() {
        return "VertixBase/Models/UserDataV3";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", UserDataModelV3.getName() ),
            isDebugEnabled( "MODEL", UserDataModelV3.getName() )
        );
    }

    protected getModel() {
        return client.user;
    }

    protected getDataModel() {
        return client.userData;
    }

    protected getDataVersion() {
        return VERSION_UI_V3;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }
}
