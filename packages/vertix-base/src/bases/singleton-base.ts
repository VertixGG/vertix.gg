import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

export abstract class SingletonBase extends InitializeBase {
    private static instances: Map<any, any> = new Map();

    protected constructor () {
        super();
    }

    protected static getInstance<T extends SingletonBase> ( this: new () => T ): T {
        if ( !SingletonBase.instances.has( this ) ) {
            SingletonBase.instances.set( this, new this() );
        }

        return SingletonBase.instances.get( this );
    }
}
