import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";
// TODO: Replace 'any' with the actual type representing Max Master Channels data (could be a simple number or a more complex object)
type TMaxMasterChannelsData = any;

export class MaxMasterChannelsData extends UIDataBase<TMaxMasterChannelsData> {
    public static getName(): string {
        return "Vertix/Data/MaxMasterChannelsData";
    }

    public async create( _identifier: any, _data: TMaxMasterChannelsData ): Promise<TMaxMasterChannelsData> {
        return Promise.reject( new Error( "Method 'create' not implemented." ) );
    }

    public async read( _identifier: any ): Promise<TMaxMasterChannelsData> {
        return Promise.reject( new Error( "Method 'read' not implemented." ) );
    }

    public async update( _identifier: any, _data: TMaxMasterChannelsData ): Promise<TMaxMasterChannelsData> {
        return Promise.reject( new Error( "Method 'update' not implemented." ) );
    }

    public async delete( _identifier: any ): Promise<TMaxMasterChannelsData> {
        return Promise.reject( new Error( "Method 'delete' not implemented." ) );
    }
}
