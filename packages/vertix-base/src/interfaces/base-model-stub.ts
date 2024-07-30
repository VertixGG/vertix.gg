export interface TBaseModelStub {
    create( ... args: any[] ): any;
    create<T>( ... args: any[] ): Promise<T>;
    update( ... args: any[] ): any;
    update<T>( ... args: any[] ): Promise<T>;
    upsert( ... args: any[] ): any;
    upsert<T>( ... args: any[] ): Promise<T>;
    findUnique( ... args: any[] ): any,
}
