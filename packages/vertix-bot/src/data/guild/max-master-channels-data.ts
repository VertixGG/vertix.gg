import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";
// TODO: Replace 'any' with the actual type representing Max Master Channels data (could be a simple number or a more complex object)
type TMaxMasterChannelsData = any;

export class MaxMasterChannelsData extends UIDataBase<TMaxMasterChannelsData> {
    public static getName(): string {
        return "Vertix/Data/MaxMasterChannelsData";
    }

    // TODO: Implement using Prisma client or configuration lookup logic
    protected create: Promise<TMaxMasterChannelsData> = Promise.reject(
        new Error( "Method 'create' not implemented." )
    );

    // TODO: Implement using Prisma client or configuration lookup logic
    protected read: Promise<TMaxMasterChannelsData> = Promise.reject(
        new Error( "Method 'read' not implemented." )
    );

    // TODO: Implement using Prisma client or configuration update logic
    protected update(): Promise<TMaxMasterChannelsData> {
        return Promise.reject( new Error( "Method 'update' not implemented." ) );
    }

    // TODO: Implement using Prisma client or configuration deletion logic
    protected delete(): Promise<TMaxMasterChannelsData> {
        return Promise.reject( new Error( "Method 'delete' not implemented." ) );
    }
}
