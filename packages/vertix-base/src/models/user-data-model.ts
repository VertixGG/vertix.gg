import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { DataOwnerModelBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

const client = PrismaBotClient.$.getClient();

export class UserDataModel extends DataOwnerModelBase<
    typeof client.user,
    typeof client.userData,
    PrismaBot.UserData
> {
    public static getName() {
        return "VertixBase/Models/UserData";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", UserDataModel.getName() ),
            isDebugEnabled( "MODEL", UserDataModel.getName() )
        );
    }

    protected getModel() {
        return client.user;
    }

    protected getDataModel() {
        return client.userData;
    }

    protected getDataVersion() {
        return "0.0.0" as const;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }
}
