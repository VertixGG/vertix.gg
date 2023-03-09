import { ForceMethodBase } from "../errors/force-method-implementation";

export abstract class ObjectBase {
    protected name: string;

    public constructor() {
        this.name = this.getName();
    }

    public static getName(): string {
        throw new ForceMethodBase( this.name, "getName" );
    }

    public getName(): string {
        return ( this.constructor as typeof ObjectBase ).getName();
    }
}

export default ObjectBase;
